import React, { useCallback, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
}

export function FileDropZone({ onFileDrop }: FileDropZoneProps) {
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setError(null);
    
    // Check both MIME type and file extension
    const isJpegMimeType = file.type === 'image/jpeg';
    const hasJpegExtension = file.name.toLowerCase().endsWith('.jpeg');
    
    if (!isJpegMimeType || !hasJpegExtension) {
      setError('Only .jpeg files are allowed. Please upload a valid .jpeg file.');
      return;
    }
    
    onFileDrop(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) validateAndProcessFile(file);
    },
    [onFileDrop]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-cyan-500 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-800 transition-colors"
      >
        <Upload className="mx-auto h-12 w-12 text-cyan-500 mb-4" />
        <p className="text-lg mb-2">Drop your JPEG file here</p>
        <p className="text-sm text-gray-400 mb-4">(.jpeg files only)</p>
        <input
          type="file"
          accept=".jpeg"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Select JPEG File
        </button>
      </div>
    </div>
  );
}