import React from 'react';
import { FileText, Calendar, Trash2, X } from 'lucide-react';
import { HistoryItem } from '../hooks/useFileHistory';

interface FileHistoryProps {
  history: HistoryItem[];
  onSelectFile: (item: HistoryItem) => void;
  onRemoveFile: (id: string) => void;
  onClearHistory: () => void;
}

const truncateFileName = (fileName: string) => {
  return fileName.length > 10 ? `${fileName.slice(0, 10)}...` : fileName;
};

export function FileHistory({ 
  history, 
  onSelectFile, 
  onRemoveFile,
  onClearHistory 
}: FileHistoryProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-cyan-500 mr-2" />
          <h2 className="text-xl font-semibold">History</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-gray-400 hover:text-red-400 transition-colors flex items-center text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <p className="text-gray-400">No files have been analyzed yet</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-gray-700 rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between hover:bg-gray-600 transition-colors">
                <div 
                  className="flex items-center cursor-pointer flex-grow group"
                  onClick={() => onSelectFile(item)}
                >
                  <FileText className="h-5 w-5 text-cyan-500 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      <span>{truncateFileName(item.fileName)}</span>
                      <span className="hidden group-hover:inline ml-2 text-gray-400">
                        ({item.fileName})
                      </span>
                    </p>
                    <div className="flex items-center text-sm text-gray-400 space-x-2">
                      <span>{(item.fileSize / 1024).toFixed(2)} KB</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(item.id);
                  }}
                  className="ml-4 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-2 bg-gray-750 border-t border-gray-600">
                <span
                  className={`text-sm ${
                    item.status === 'analyzed' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {item.status === 'analyzed' ? 'Analysis Complete' : 'Pending Analysis'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}