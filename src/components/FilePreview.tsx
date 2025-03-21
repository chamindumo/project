import React from 'react';
import { FileSearch } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  preview: string;
}

export function FilePreview({ file, preview }: FilePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Selected File</h2>
        <div className="flex items-center space-x-4">
          <FileSearch className="h-8 w-8 text-cyan-500" />
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-400">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="flex justify-center">
          <img 
            src={preview} 
            alt="File preview" 
            className="max-w-[300px] max-h-[300px] w-auto h-auto rounded object-contain"
          />
        </div>
      </div>
    </div>
  );
}