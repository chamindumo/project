import React, { useState, useCallback } from 'react';
import { FileDropZone } from '../components/FileDropZone';
import { FilePreview } from '../components/FilePreview';
import { PDFPreview } from '../components/PDFPreview';
import { PageHeader } from '../components/PageHeader';
import { useFileHistory, HistoryItem } from '../hooks/useFileHistory';
import { useOutletContext } from 'react-router-dom';

export function AnalyzePage() {
  const {
    addToHistory,
    updateHistoryItem,
  } = useFileHistory();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  // Get the ref setter from the outlet context
  const { ref } = useOutletContext<{ ref: (instance: any) => void }>();

  const handleFileDrop = (droppedFile: File) => {
    setFile(droppedFile);
    
    // Create file preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreview(preview);
      
      const newFileId = crypto.randomUUID();
      setCurrentFileId(newFileId);
      
      // Add to history
      addToHistory({
        id: newFileId,
        fileName: droppedFile.name,
        fileSize: droppedFile.size,
        timestamp: new Date(),
        status: 'pending',
        preview
      });
    };
    reader.readAsDataURL(droppedFile);
  };

  const handleAnalyze = async () => {
    if (!file || !currentFileId) return;
    
    // Simulate file analysis
    const analysisResult = `
      File Analysis Report
      -------------------
      Filename: ${file.name}
      Size: ${(file.size / 1024).toFixed(2)} KB
      Type: ${file.type}
      Last Modified: ${new Date(file.lastModified).toLocaleString()}
      
      Security Status: Clean
      Threat Level: Low
      Encryption: Detected
      
      Recommendations:
      - File appears to be safe
      - No malicious content detected
      - Standard security protocols applied
    `;
    
    setAnalysis(analysisResult);

    // Update history item
    updateHistoryItem(currentFileId, {
      status: 'analyzed',
      analysis: analysisResult
    });
  };

  // Expose the history item selection handler to the parent component
  const handleHistoryItemSelect = useCallback((item: HistoryItem) => {
    setCurrentFileId(item.id);
    setPreview(item.preview || null);
    setAnalysis(item.analysis || null);
    
    // Create a new File object from the history data
    if (item.preview) {
      const byteString = atob(item.preview.split(',')[1]);
      const mimeString = item.preview.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const newFile = new File([ab], item.fileName, { type: mimeString });
      setFile(newFile);
    }
  }, []);

  // Expose the handler to the parent component
  React.useEffect(() => {
    if (ref) {
      ref({ handleHistoryItemSelect });
    }
  }, [ref, handleHistoryItemSelect]);

  return (
    <div>
      <PageHeader title="File Analysis" />
      
      {!file && <FileDropZone onFileDrop={handleFileDrop} />}
      
      {file && preview && (
        <div className="space-y-8">
          <FilePreview file={file} preview={preview} />
          
          {!analysis && (
            <button
              onClick={handleAnalyze}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Analyze File
            </button>
          )}

          {analysis && <PDFPreview analysis={analysis} />}
        </div>
      )}
    </div>
  );
}