import React, { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
}

export function FileDropZone({ onFileDrop }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onFileDrop(file);
    },
    [onFileDrop]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <div className="text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-cyan-500 rounded-lg p-12 cursor-pointer hover:bg-gray-800 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-cyan-500 mb-4" />
        <p className="text-lg mb-2">Drop your file here</p>
        <p className="text-sm text-gray-400">or click to select</p>
      </div>

      <button
        onClick={handleButtonClick}
        className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
      >
        Select File
      </button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
