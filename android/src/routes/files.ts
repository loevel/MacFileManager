import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock directories for development
const BASE_PATHS: Record<string, string> = {
  documents: path.join(process.env.HOME || '/tmp', 'Documents'),
  downloads: path.join(process.env.HOME || '/tmp', 'Downloads'),
  photos: path.join(process.env.HOME || '/tmp', 'Pictures'),
};

interface FileEntry {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  mimeType?: string;
  modified: number;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

async function getFileIcon(mimeType?: string, isDirectory?: boolean): Promise<string> {
  if (isDirectory) return '📁';
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('csv')) return '📊';
  if (mimeType.includes('archive') || mimeType.includes('zip')) return '📦';
  return '📄';
}

// GET /api/directories - List available directories
router.get('/directories', async (req: Request, res: Response<ApiResponse<string[]>>) => {
  try {
    const dirs = Object.keys(BASE_PATHS);
    res.json({
      status: 'success',
      data: dirs,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// GET /api/files - List files in directory
router.get('/files', async (req: Request, res: Response<ApiResponse<FileEntry[]>>) => {
  try {
    let dirPath = req.query.path as string || 'documents';

    // Resolve path from base paths or treat as relative
    if (dirPath in BASE_PATHS) {
      dirPath = BASE_PATHS[dirPath as keyof typeof BASE_PATHS];
    } else {
      dirPath = path.join(BASE_PATHS.documents, dirPath);
    }

    // Security: prevent directory traversal
    const realPath = await fs.realpath(dirPath);
    const docRoot = await fs.realpath(BASE_PATHS.documents);
    if (!realPath.startsWith(docRoot)) {
      return res.status(403).json({
        status: 'error',
        error: 'Access denied',
      });
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: FileEntry[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const stat = await fs.stat(fullPath);
      const relativePath = path.relative(BASE_PATHS.documents, fullPath);

      let mimeType: string | undefined;
      if (!entry.isDirectory()) {
        const ext = path.extname(entry.name).toLowerCase();
        // Basic MIME type mapping
        const mimeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.pdf': 'application/pdf',
          '.txt': 'text/plain',
          '.mp4': 'video/mp4',
          '.mp3': 'audio/mpeg',
          '.zip': 'application/zip',
        };
        mimeType = mimeMap[ext] || 'application/octet-stream';
      }

      const icon = await getFileIcon(mimeType, entry.isDirectory());

      files.push({
        name: `${icon} ${entry.name}`,
        path: relativePath,
        size: stat.size,
        isDirectory: entry.isDirectory(),
        mimeType,
        modified: stat.mtime.getTime(),
      });
    }

    // Sort: directories first, then by name
    files.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return b.isDirectory ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      status: 'success',
      data: files,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// GET /api/files/download - Download a file
router.get('/download', async (req: Request, res: Response) => {
  try {
    let filePath = req.query.path as string;

    if (!filePath) {
      return res.status(400).json({
        status: 'error',
        error: 'path query parameter required',
      });
    }

    // Resolve full path
    filePath = path.join(BASE_PATHS.documents, filePath);

    // Security: prevent directory traversal
    const realPath = await fs.realpath(filePath);
    const docRoot = await fs.realpath(BASE_PATHS.documents);
    if (!realPath.startsWith(docRoot)) {
      return res.status(403).json({
        status: 'error',
        error: 'Access denied',
      });
    }

    const stat = await fs.stat(realPath);

    if (!stat.isFile()) {
      return res.status(400).json({
        status: 'error',
        error: 'Path is not a file',
      });
    }

    // Support range requests for large files
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416);
        return res.json({
          status: 'error',
          error: 'Range Not Satisfiable',
        });
      }

      res.status(206);
      res.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.set('Accept-Ranges', 'bytes');
      res.set('Content-Length', `${end - start + 1}`);

      const stream = await fs.readFile(realPath);
      res.end(stream.slice(start, end + 1));
    } else {
      res.set('Content-Length', fileSize.toString());
      const file = await fs.readFile(realPath);
      res.end(file);
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// DELETE /api/files - Delete a file or directory
router.delete('/files', async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    let filePath = req.query.path as string;

    if (!filePath) {
      return res.status(400).json({
        status: 'error',
        error: 'path query parameter required',
      });
    }

    // Resolve full path
    filePath = path.join(BASE_PATHS.documents, filePath);

    // Security: prevent directory traversal
    const realPath = await fs.realpath(filePath);
    const docRoot = await fs.realpath(BASE_PATHS.documents);
    if (!realPath.startsWith(docRoot)) {
      return res.status(403).json({
        status: 'error',
        error: 'Access denied',
      });
    }

    const stat = await fs.stat(realPath);

    if (stat.isDirectory()) {
      await fs.rm(realPath, { recursive: true, force: true });
    } else {
      await fs.unlink(realPath);
    }

    res.json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 GB
  },
});

interface UploadedFile extends Express.Multer.File {
  buffer: Buffer;
}

// POST /api/upload - Upload a file
router.post('/upload', upload.single('file'), async (req: Request, res: Response<ApiResponse<FileEntry>>) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: 'No file provided',
      });
    }

    let targetDir = (req.query.path as string) || '';

    // Resolve target directory
    let targetPath = path.join(BASE_PATHS.documents, targetDir);

    // Security: prevent directory traversal
    const realTargetPath = await fs.realpath(BASE_PATHS.documents).catch(() => BASE_PATHS.documents);
    const resolvedTargetPath = path.resolve(targetPath);
    if (!resolvedTargetPath.startsWith(realTargetPath)) {
      return res.status(403).json({
        status: 'error',
        error: 'Access denied',
      });
    }

    // Ensure directory exists
    await fs.mkdir(resolvedTargetPath, { recursive: true });

    // Sanitize filename
    const filename = path.basename(req.file.originalname);
    const filePath = path.join(resolvedTargetPath, filename);

    // Write file
    const file = req.file as UploadedFile;
    await fs.writeFile(filePath, file.buffer);

    // Get file stats for response
    const stat = await fs.stat(filePath);
    const relativePath = path.relative(BASE_PATHS.documents, filePath);

    const uploadedFile: FileEntry = {
      name: `📄 ${filename}`,
      path: relativePath,
      size: stat.size,
      isDirectory: false,
      mimeType: req.file.mimetype,
      modified: stat.mtime.getTime(),
    };

    res.json({
      status: 'success',
      data: uploadedFile,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export { router as fileRouter };
