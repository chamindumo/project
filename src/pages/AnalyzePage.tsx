import React, { useState, useCallback, useRef } from 'react';
import { FileDropZone } from '../components/FileDropZone';
import { FilePreview } from '../components/FilePreview';
import { PageHeader } from '../components/PageHeader';
import { useFileHistory, HistoryItem } from '../hooks/useFileHistory';
import { useOutletContext } from 'react-router-dom';
import { HfInference } from "@huggingface/inference";

export function AnalyzePage() {
  const { addToHistory, updateHistoryItem } = useFileHistory();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null); // Store classification results
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  // Get the ref setter from the outlet context
  const { ref } = useOutletContext<{ ref: (instance: any) => void }>();

  // Handle file drop
  const handleFileDrop = useCallback((droppedFile: File) => {
    setFile(droppedFile);

    // Create file preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreview(preview);

      const newFileId = crypto.randomUUID();
      setCurrentFileId(newFileId);

      // Add to history with preview
      addToHistory({
        id: newFileId,
        fileName: droppedFile.name,
        fileSize: droppedFile.size,
        timestamp: new Date(),
        status: 'pending',
        preview,
      });
    };
    reader.readAsDataURL(droppedFile);
  }, [addToHistory]);


  const fetchChatCompletion = async (analysisResults:string, iqa:string) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo-instruct',
          messages: [
            {
              role: 'user',
              content: `genarate the detail report the stegoimage algorithem is ${analysisResults} and the image qulity is (IQA value ) ${iqa} so give the very detaild recomndataion with formal language`,
            },
          ],
        }),
      });
  
      const chatCompletion = await response.json();
      console.log('API Response:', chatCompletion); // Log the entire response
  
      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No choices returned from the API');
      }
  
      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching chat completion:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  

  // Handle image classification via Flask backend
  const handleAnalyze = useCallback(async () => {
    if (!file || !currentFileId || !preview) return;
    setLoading(true); // Set loading to true when analysis starts

    try {
      // Prepare the form data to send the image to the Flask backend
      const formData = new FormData();
      formData.append('image', file);

      // Send the image to the Flask backend for classification
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Parse the JSON response from the Flask backend
      const result = await response.json();

      // Update the analysis state with the classification results
      setAnalysis(result);

      // Fetch recommendations from chat completion
      const fileDetails = `
- File Name: ${file.name}
- File Size: ${(file.size / 1024).toFixed(2)} KB
- Last Modified: ${new Date(file.lastModified).toLocaleDateString()}
      `;

      const analysisResults = result.payload_class
      const iqa = result.iqa_score.toFixed(2)
;

      const recommendations = await fetchChatCompletion(analysisResults, iqa);
      setRecommendations(recommendations ?? null);

      // Update history item with both preview and analysis
      updateHistoryItem(currentFileId, {
        status: 'analyzed',
        analysis: result, // Store the classification results in history
        preview,
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysis({ error: 'Failed to analyze the file. Please try again.' });
    }finally {
      setLoading(false); // Set loading to false when analysis completes
    }
  }, [file, currentFileId, preview, updateHistoryItem]);

  // Generate a proper report
  const renderReport = () => {
    if (!file || !analysis || !recommendations) return null;

    const fileDetails = `
- File Name: ${file.name}
- File Size: ${(file.size / 1024).toFixed(2)} KB
- Last Modified: ${new Date(file.lastModified).toLocaleDateString()}
    `;

    const analysisResults = `
- Payload Classification: ${analysis.payload_class}
- IQA Score: ${analysis.iqa_score.toFixed(2)}
    `;

    const downloadReport = async () => {
      const reportContent = `
File Details:
${fileDetails}

Analysis Results:
${analysisResults}

Recommendations:
${recommendations}
      `;

      // Create a Blob and trigger download
      const blob = new Blob([reportContent || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}_analysis_report.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="bg-gray-900 shadow-md rounded-lg p-6 space-y-4 text-white">
        {/* File Details */}
        <div>
          <h3 className="text-lg font-bold text-blue-300">File Details</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-300">
            <li>
              <strong>File Name:</strong> {file.name}
            </li>
            <li>
              <strong>File Size:</strong> {(file.size / 1024).toFixed(2)} KB
            </li>
            <li>
              <strong>Last Modified:</strong>{' '}
              {new Date(file.lastModified).toLocaleDateString()}
            </li>
          </ul>
        </div>

        {/* Analysis Results */}
        <div>
          <h3 className="text-lg font-bold text-blue-300">Analysis Results</h3>
          {analysis.error ? (
            <p className="text-red-500">{analysis.error}</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li>
                <strong>Payload Classification:</strong>{' '}
                <span className="font-semibold text-blue-400">
                   {analysis.payload_class}
                </span>
              </li>
              <li>
                <strong>IQA Score:</strong>{' '}
                <span className="font-semibold text-green-400">
                  {analysis.iqa_score.toFixed(2)}
                </span>
              </li>
            </ul>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-bold text-blue-300">Recommendations</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-300">
            <li>{recommendations}</li>
          </ul>
        </div>

        {/* Download Button */}
        <div className="flex justify-end">
          <button
            onClick={downloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Report
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
       <style>
        {`
          @keyframes loading {
            from {
              background-position: 100% 0;
            }
            to {
              background-position: -100% 0;
            }
          }
        `}
      </style>
    {loading ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
        <p>Image is processing...</p>
        <div style={{
          width: '100%',
          height: '15px',
          background: 'linear-gradient(to right, #4caf50 0%, #4caf50 50%, #ccc 50%, #ccc 100%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite'
        }}></div>
      </div>
      ) : (
    <div>
      <PageHeader title="File Analysis" />

      {!file && <FileDropZone onFileDrop={handleFileDrop} />}

      {file && preview && (
        <div className="space-y-8">
          <FilePreview file={file} preview={preview} />

          {!analysis && (
            <button
              onClick={handleAnalyze}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Analyze File
            </button>
          )}

          {analysis && renderReport()}
        </div>
      )}
      
    </div>
    )}
    </div>
    
  );
}