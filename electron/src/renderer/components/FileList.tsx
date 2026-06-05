import '../styles/FileList.css';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  mimeType?: string;
  modified: number;
}

interface Props {
  files: FileEntry[];
  selectedFile: FileEntry | null;
  onFileClick: (file: FileEntry) => void;
}

export function FileList({ files, selectedFile, onFileClick }: Props) {
  return (
    <div className="file-list">
      {files.map((file) => (
        <div
          key={file.path}
          className={`file-item ${
            selectedFile?.path === file.path ? 'selected' : ''
          } ${file.isDirectory ? 'directory' : 'file'}`}
          onClick={() => onFileClick(file)}
          onDoubleClick={() => {
            if (file.isDirectory) onFileClick(file);
          }}
        >
          <span className="file-name">{file.name}</span>
          {!file.isDirectory && (
            <span className="file-size">
              {formatSize(file.size)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
