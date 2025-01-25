import React from 'react';
import { Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

interface PDFPreviewProps {
  analysis: string;
}

export function PDFPreview({ analysis }: PDFPreviewProps) {
  const handleDownload = () => {
    generatePDF(analysis);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analysis Report</h2>
        <button
          onClick={handleDownload}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
          {analysis}
        </pre>
      </div>
    </div>
  );
}