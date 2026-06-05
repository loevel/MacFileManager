import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store';
import { Breadcrumb } from './Breadcrumb';
import { FileList } from './FileList';
import { UploadDropZone } from './UploadDropZone';
import { ConfirmDialog } from './ConfirmDialog';
import '../styles/FileExplorer.css';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  mimeType?: string;
  modified: number;
}

export function FileExplorer() {
  const queryClient = useQueryClient();
  const { serverUrl, currentPath, setCurrentPath } = useStore();
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['files', serverUrl, currentPath],
    queryFn: async () => {
      if (!serverUrl) return [];
      const params = new URLSearchParams({ path: currentPath });
      const res = await fetch(`${serverUrl}/api/files?${params}`, {
        mode: 'cors',
      });
      if (!res.ok) throw new Error('Failed to fetch files');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!serverUrl,
  });

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleFileClick = (file: FileEntry) => {
    if (file.isDirectory) {
      handleNavigate(file.path);
    } else {
      setSelectedFile(file);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleUpload = async (filesToUpload: File[]) => {
    if (!serverUrl) return;

    setIsUploading(true);
    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const params = new URLSearchParams({ path: currentPath });
        const res = await fetch(`${serverUrl}/api/upload?${params}`, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Upload failed');
        }
      }
      // Refresh file list after upload
      queryClient.invalidateQueries({ queryKey: ['files', serverUrl, currentPath] });
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!serverUrl || !deleteTarget) return;

    try {
      const params = new URLSearchParams({ path: deleteTarget.path });
      const res = await fetch(`${serverUrl}/api/files?${params}`, {
        method: 'DELETE',
        mode: 'cors',
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Delete failed');
      }

      setDeleteTarget(null);
      setSelectedFile(null);
      // Refresh file list after delete
      queryClient.invalidateQueries({ queryKey: ['files', serverUrl, currentPath] });
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h1>📱 AndroidExplorer</h1>
        <div className="server-info">
          {serverUrl && <span className="connected">● Connected to {serverUrl}</span>}
        </div>
      </div>

      <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

      <div className="explorer-content">
        <div className="file-panel">
          <div className="panel-header">
            <h2>Files</h2>
            <span className="file-count">
              {files?.length || 0} items
            </span>
          </div>

          <div className="upload-section">
            <UploadDropZone onFilesSelected={handleUpload} isUploading={isUploading} />
          </div>

          {isLoading && <p className="loading">Loading...</p>}
          {error && <p className="error">Error: {(error as Error).message}</p>}
          {files && files.length === 0 && <p className="empty">No files</p>}

          {files && files.length > 0 && (
            <FileList
              files={files}
              selectedFile={selectedFile}
              onFileClick={handleFileClick}
            />
          )}
        </div>

        {selectedFile && !selectedFile.isDirectory && (
          <div className="detail-panel">
            <h2>File Details</h2>
            <div className="details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{selectedFile.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Size:</span>
                <span className="value">{formatSize(selectedFile.size)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{selectedFile.mimeType || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Modified:</span>
                <span className="value">
                  {new Date(selectedFile.modified).toLocaleString()}
                </span>
              </div>
              <div className="actions">
                <button className="btn-download">⬇️ Download</button>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteTarget(selectedFile)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete File"
          message={`Are you sure you want to delete "${deleteTarget.name.replace(/^[^\s]+ /, '')}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
