import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileDropZone } from '../components/FileDropZone';
import { FilePreview } from '../components/FilePreview';
import { PageHeader } from '../components/PageHeader';
import { useFileHistory, HistoryItem } from '../hooks/useFileHistory';
import { useOutletContext } from 'react-router-dom';
import { PDFPreview } from '../components/PDFPreview';
import jsPDF from 'jspdf';

export function AnalyzePage() {
  const { addToHistory, updateHistoryItem } = useFileHistory();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null); 
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const { ref } = useOutletContext<{ ref: (instance: any) => void }>();

  const handleFileDrop = useCallback((droppedFile: File) => {
    setError(null);
    
    // Check both MIME type and file extension
    const isJpgMimeType = droppedFile.type === 'image/jpeg';
    const hasJpgExtension = droppedFile.name.toLowerCase().endsWith('.jpg');
    
    if (!isJpgMimeType || !hasJpgExtension) {
      setError('Only .jpg files are allowed. Please upload a valid .jpg file.');
      setFile(null);
      setPreview(null);
      setAnalysis(null);
      setCurrentFileId(null);
      return;
    }
    
    setFile(droppedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreview(preview);
      const newFileId = crypto.randomUUID();
      setCurrentFileId(newFileId);
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

  const fetchChatCompletion = async (analysisResults: string, iqa: string) => {
    const apiKey = import.meta.env.REACT_APP_API_KEY;
    if (!apiKey) {
      console.error('API key is missing. Ensure REACT_APP_API_KEY is set in the .env file.');
      throw new Error('API key is missing.');
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: [
            {
              role: 'user',
              content: `You are an expert in image analysis and steganography. Based on the following details:
              
- Stegoimage Algorithm: ${analysisResults}
- Image Quality Assessment (IQA) Score: ${iqa}

Please generate a detailed and professional report. The report should include:
1. A brief explanation of the stegoimage algorithm.
2. An assessment of the image quality based on the IQA score.
3. Recommendations for improving the image quality or steganographic process.
4. Any potential risks or vulnerabilities associated with the current analysis.

Use formal language and ensure the report is easy to understand for both technical and non-technical audiences.`,
            },
          ],
        }),
      });
  
      const chatCompletion = await response.json();
      console.log('API Response:', chatCompletion); 
  
      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No choices returned from the API');
      }
  
      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching chat completion:', error);
      throw error; 
    }
  };
  
  const handleHistoryItemSelect = useCallback((item: HistoryItem) => {
    setCurrentFileId(item.id);
    setPreview(item.preview || null);
    setAnalysis(item.analysis || null);
    
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

  const handlers = useRef({ handleHistoryItemSelect });
  React.useEffect(() => {
    if (ref) {
      ref(handlers.current);
    }
  }, [ref]);

  const handleAnalyze = useCallback(async () => {
    if (!file || !currentFileId || !preview) return;
    setLoading(true); 

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysis(result);
      
      const analysisResults = result.payload_class;
      const iqa = result.iqa_score.toFixed(2);

      const recommendations = await fetchChatCompletion(analysisResults, iqa);
      setRecommendations(recommendations ?? null);

      updateHistoryItem(currentFileId, {
        status: 'analyzed',
        analysis: result, 
        preview,
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysis({ error: 'Failed to analyze the file. Please try again.' });
    } finally {
      setLoading(false); 
    }
  }, [file, currentFileId, preview, updateHistoryItem]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
  
    const newUserMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newUserMessage];
  
    setChatMessages(updatedMessages);
    setChatInput('');
  
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  
    try {
      // Add a 1-second delay to avoid rate limits
      await delay(1000);
  
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
          messages: updatedMessages,
        }),
      });
  
      const chatCompletion = await response.json();
  
      if (chatCompletion.choices && chatCompletion.choices.length > 0) {
        console.log('No choices in response:', chatCompletion);
        const botResponse = chatCompletion.choices[0].message.content;
        setChatMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: botResponse }]);
      } else {
        console.log('No choices in response:', chatCompletion);
        console.error('No choices in response:', chatCompletion);
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: 'No response received. Please try again.' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Error occurred while fetching the response.' },
      ]);
    }
  };

  // Automatically scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        setChatOpen(false); // Close the chatbot if clicked outside
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [chatBoxRef]);

  const formatRecommendations = (recommendations: string) => {
    return recommendations.split('\n').map((line, i) => (
      <p key={i} style={{ margin: '5px 0' }}>
        {line.startsWith('-') ? (
          <strong>{line}</strong> // Bold headings
        ) : line.includes('**') ? (
          <span>
            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong> // Bold text inside **
              ) : (
                part
              )
            )}
          </span>
        ) : line.startsWith('* **') ? (
          <span>
            <strong>Point:</strong> {line.slice(1).trim()} {/* Add "Point:" for this specific case */}
          </span>
        ) : (
          line
        )}
      </p>
    ));
  };

  const renderReport = () => {
    if (!file || !analysis || !recommendations) return null;
  
    const fileDetails = `
  File Name: ${file.name}
  File Size: ${(file.size / 1024).toFixed(2)} KB
  Last Modified: ${new Date(file.lastModified).toLocaleDateString()}
    `;
  
    const analysisResults = `
  Payload Classification: ${analysis.payload_class}
  IQA Score: ${analysis.iqa_score.toFixed(2)}
    `;
  
    const formattedRecommendations = formatRecommendations(recommendations);
  
    const downloadReport = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Analysis Report', 10, 10);
      doc.setFontSize(12);
      doc.text('--- File Details ---', 10, 20);
      doc.text(fileDetails, 10, 30);
      doc.text('--- Analysis Results ---', 10, 50);
      doc.text(analysisResults, 10, 60);
      doc.text('--- Recommendations ---', 10, 80);
      const recommendationsText = recommendations.split('\n'); // Convert recommendations to an array of strings
      doc.text(recommendationsText, 10, 90);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 110);
      doc.save(`${file.name}_analysis_report.pdf`);
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
          <div className="mt-2 space-y-1 text-sm text-gray-300">
            {formattedRecommendations}
          </div>
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

      {/* Floating Chatbot Icon */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            backgroundColor: '#007bff', // Changed to blue
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '24px', color: 'white' }}>💬</span>
        </button>
      </div>

      {/* Chatbox */}
      {chatOpen && (
        <div
          ref={chatBoxRef}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px', // Increased width
            height: '500px', // Increased height
            backgroundColor: '#001f3f', // Dark blue background
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-in-out',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '10px',
              backgroundColor: '#007bff', // Header remains blue
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Chatbot
          </div>
          <div
            style={{
              padding: '10px',
              height: '380px', // Adjusted height for larger chat area
              overflowY: 'auto',
              borderBottom: '1px solid #ddd',
              color: 'white', // Text color for dark background
            }}
          >
            {chatMessages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  textAlign: message.role === 'user' ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    backgroundColor: message.role === 'user' ? '#007bff' : '#004080', // User messages blue, bot messages darker blue
                    color: 'white',
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                    textAlign: 'left', // Align text to the left
                  }}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '5px 0' }}>
                      {line.startsWith('-') ? (
                        <strong>{line}</strong> // Bold headings
                      ) : line.includes('**') ? (
                        <span>
                          {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong key={j}>{part.slice(2, -2)}</strong> // Bold text inside **
                            ) : (
                              part
                            )
                          )}
                        </span>
                      ) : line.startsWith('* **') ? (
                        <span>
                          <strong>Point:</strong> {line.slice(1).trim()} {/* Add "Point:" for this specific case */}
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginRight: '10px',
                color: 'black', // Changed text color to black
              }}
            />
            <button
              onClick={handleChatSubmit}
              style={{
                backgroundColor: '#007bff', // Button remains blue
                color: 'white',
                border: 'none',
                borderRadius: '50%', // Circular button
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center', // Center vertically
                justifyContent: 'center', // Center horizontally
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '20px' }}>➤</span> {/* Send icon */}
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}