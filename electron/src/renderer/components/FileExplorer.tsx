import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store';
import { Breadcrumb } from './Breadcrumb';
import { FileList } from './FileList';
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
  const { serverUrl, currentPath, setCurrentPath } = useStore();
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);

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
                <button className="btn-delete">🗑️ Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
