import { useState } from 'react';
import '../styles/UploadDropZone.css';

interface Props {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export function UploadDropZone({ onFilesSelected, isUploading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`upload-drop-zone ${isDragOver ? 'drag-over' : ''} ${
        isUploading ? 'uploading' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        multiple
        onChange={handleFileInput}
        disabled={isUploading}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-input">
        {isUploading ? (
          <>
            <span className="icon">⬆️</span>
            <p>Uploading...</p>
          </>
        ) : (
          <>
            <span className="icon">📤</span>
            <p>Drop files here or click to select</p>
            <span className="hint">Drag any file into this panel</span>
          </>
        )}
      </label>
    </div>
  );
}
