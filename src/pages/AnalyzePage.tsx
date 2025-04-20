import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FileDropZone } from '../components/FileDropZone';
import { FilePreview } from '../components/FilePreview';
import { PageHeader } from '../components/PageHeader';
import { useFileHistory, HistoryItem } from '../hooks/useFileHistory';
import { useOutletContext } from 'react-router-dom';
import { RefreshCcw, Download } from "lucide-react";
import { PDFPreview } from '../components/PDFPreview';
import jsPDF from 'jspdf';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function AnalyzePage() {
  const { addToHistory, updateHistoryItem, saveReportToDatabase, fetchReportFromDatabase } = useFileHistory();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const { ref, selectedHistoryItem } = useOutletContext<{ ref: (instance: any) => void; selectedHistoryItem: any }>();
  const location = useLocation();
  
  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setRecommendations(null);
    setCurrentFileId(null);
    setError(null);
  };

  

  const handleFileDrop = useCallback((droppedFile: File) => {
    setError(null);

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
    try {
      const iqaPercentage = (parseFloat(iqa) * 100).toFixed(2);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer /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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'user',
              content: `You are an expert in image analysis and steganography. Based on the following details:
              
- Stegoimage Algorithm: ${analysisResults}
- Image Quality Assessment (IQA) Score: ${iqaPercentage}

Please generate a detailed and professional report. The report should include:
1. Introduction
2. Stegoimage Algorithm Explanation: "${analysisResults}"
The stegoimage algorithm detected in the analysis is "${analysisResults}". 

3. Image Quality Assessment (IQA) and its Interpretation
4. Recommendations for Improvement
5. Potential Risks and Vulnerabilities
6. Conclusion

Use formal language and ensure the report is easy to understand for both technical and non-technical audiences.
the report create by Chamindu Moramudali and the data is april 2025`
,
            },
          ],
        }),
      });

      const chatCompletion = await response.json();
      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No choices returned from the API');
      }

      // Remove unwanted symbols (*, #) from the report content
      const sanitizedContent = chatCompletion.choices[0].message.content.replace(/[*#]/g, '');

      return sanitizedContent;
    } catch (error) {
      console.error('Error fetching chat completion:', error);
      const iqaPercentage = (parseFloat(iqa) * 100).toFixed(2);

      let algorithmExplanation = '';
switch (analysisResults) {
  case 'Clean':
    algorithmExplanation = `- Clean (Class 0):
      - **Description**: The image contains no embedded steganographic data, preserving its original pixel and statistical integrity. It is free from hidden payloads or modifications that could indicate covert data embedding.
      - **Technical Details**: No alterations to DCT coefficients (in JPEG images), pixel values, or statistical distributions are detected. The image passes forensic tests like histogram analysis, chi-square tests, and machine learning-based steganalysis with high confidence.
      - **Use Cases**: Critical for applications requiring authenticity, such as legal evidence, medical imaging (e.g., MRI scans), archival records, and official documentation where tampering is unacceptable.
      - **Detection Challenges**: Clean images are robust against false positives in steganalysis, as there are no statistical anomalies to misinterpret.
      - **Implications**: Ensures trust and reliability in sensitive domains but may not serve purposes requiring data embedding (e.g., watermarking or covert communication).`;
    break;

  case 'JMiPOD':
    algorithmExplanation = `- JMiPOD (Class 2):
      - **Description**: JMiPOD (JPEG-Marked Image Preservation of Distribution) is an advanced steganographic algorithm designed to embed data in JPEG images while preserving the natural statistical distribution of DCT coefficients.
      - **Technical Details**: It modifies DCT coefficients minimally to embed data, using adaptive techniques to match the image’s statistical profile. This reduces detectability by statistical steganalysis tools (e.g., ensemble classifiers or deep learning models).
      - **Use Cases**: Ideal for watermarking intellectual property (e.g., digital art), covert communications in secure channels, and embedding metadata in media files without compromising visual quality.
      - **Detection Challenges**: Highly resistant to detection due to its low distortion footprint. Requires sophisticated steganalysis tools, such as feature-based classifiers or neural networks trained on large datasets, to identify embedding.
      - **Implications**: Offers a balance between data capacity and stealth but may require careful tuning to avoid subtle statistical anomalies under advanced forensic scrutiny.`;
    break;

  case 'UERD':
    algorithmExplanation = `- UERD (Class 1):
      - **Description**: UERD (Uniform Embedding Revisited with Distortion Minimization) is a steganographic method that embeds data uniformly across an image while minimizing visible distortions to maintain perceptual quality.
      - **Technical Details**: It distributes data bits evenly across pixel values or DCT coefficients, optimizing for minimal mean squared error. The embedding strength can be adjusted, but higher payloads may introduce detectable artifacts.
      - **Use Cases**: Commonly used for embedding metadata in secure document tagging, digital signatures, or lightweight covert messaging where moderate data capacity is sufficient.
      - **Detection Challenges**: More detectable than JMiPOD under forensic analysis, as uniform embedding can create subtle statistical deviations (e.g., in pixel correlations or DCT histograms). Machine learning-based steganalysis can exploit these patterns.
      - **Implications**: Suitable for applications prioritizing image quality over high data capacity. Users should avoid excessive embedding to minimize detection risks.`;
    break;

  default:
    algorithmExplanation = `- Unknown Algorithm:
      - **Description**: The detected algorithm "${analysisResults}" does not match known steganographic methods (Clean, JMiPOD, UERD).
      - **Technical Details**: The embedding technique may involve custom, experimental, or proprietary methods. It could manipulate pixel values, DCT coefficients, or other image features in non-standard ways.
      - **Use Cases**: Potentially used in niche applications, proprietary systems, or experimental steganography research. Without further analysis, its purpose remains unclear.
      - **Detection Challenges**: Requires reverse engineering or advanced forensic tools (e.g., custom feature extraction or deep learning models) to characterize the embedding behavior.
      - **Implications**: The lack of predefined classification increases the risk of undetected payloads. Further investigation is recommended to assess security and integrity.`;
}

let qualityInterpretation = '';
let iqaRecommendations = '';
const iqaFloat = parseFloat(iqa);
if (iqaFloat >= 0.90) {
  qualityInterpretation = 'excellent, with negligible artifacts and high visual fidelity.';
  iqaRecommendations = `- **Maintain Current Practices**: The high IQA score indicates minimal impact from steganographic embedding, making the image suitable for high-fidelity applications (e.g., professional photography, medical imaging).
    - **Optimize Embedding**: If using JMiPOD or UERD, continue using low embedding strengths to preserve quality. For Clean images, no embedding is necessary.
    - **Monitor Compression**: Avoid aggressive lossy compression (e.g., low-quality JPEG) to maintain visual fidelity.
    - **Regular Validation**: Periodically validate with forensic tools to ensure no unintended embedding occurs.
    - **Enhance Resolution**: Consider using higher-resolution images to further improve robustness and quality for critical applications.`;
} else if (iqaFloat >= 0.75) {
  qualityInterpretation = 'good, with minor artifacts that are barely noticeable.';
  iqaRecommendations = `- **Refine Embedding Parameters**: Minor artifacts suggest slight distortions from embedding (e.g., with UERD or JMiPOD). Reduce embedding strength or payload size to improve quality.
    - **Algorithm Selection**: Prefer JMiPOD over UERD for better statistical preservation and lower artifact visibility.
    - **Preprocessing**: Apply noise reduction or contrast enhancement before embedding to increase image robustness.
    - **Test Compression**: Ensure lossy compression settings (e.g., JPEG quality) do not exacerbate artifacts.
    - **User Validation**: Conduct visual inspections or use SSIM/PSNR metrics to confirm acceptability for practical uses (e.g., digital media, watermarking).`;
} else if (iqaFloat >= 0.50) {
  qualityInterpretation = 'moderate, with noticeable artifacts that may affect usability.';
  iqaRecommendations = `- **Reduce Embedding Load**: Noticeable artifacts indicate excessive data embedding or suboptimal algorithm settings. Significantly lower the payload size for UERD or JMiPOD.
    - **Switch Algorithms**: If using UERD, consider JMiPOD for better quality preservation. If using an unknown algorithm, analyze its embedding behavior to optimize parameters.
    - **Image Enhancement**: Use high-resolution images or preprocess with sharpening filters to mitigate artifact visibility.
    - **Forensic Testing**: Perform steganalysis to assess detectability risks, as moderate artifacts may correlate with statistical anomalies.
    - **Limit Use Cases**: Restrict use to non-critical applications (e.g., casual media sharing) until quality improves.`;
} else if (iqaFloat >= 0.25) {
  qualityInterpretation = 'poor, with significant artifacts that degrade visual quality.';
  iqaRecommendations = `- **Overhaul Embedding Strategy**: Significant artifacts suggest overuse of embedding capacity or an unsuitable algorithm. Drastically reduce payload size or switch to JMiPOD for minimal distortion.
    - **High-Resolution Source**: Use higher-resolution images to distribute embedding across more pixels, reducing artifact density.
    - **Algorithm Analysis**: For unknown algorithms, conduct reverse engineering to understand distortion causes. For UERD, lower embedding strength significantly.
    - **Avoid Lossy Formats**: Minimize use of lossy compression (e.g., JPEG) to prevent further quality degradation.
    - **Restrict Usage**: Avoid using the image in professional or sensitive contexts (e.g., legal evidence, medical imaging) due to compromised quality.`;
} else {
  qualityInterpretation = 'very poor, with severe artifacts rendering the image nearly unusable.';
  iqaRecommendations = `- **Cease Embedding**: Severe artifacts indicate critical overuse of embedding or an incompatible algorithm. Stop embedding until the process is optimized.
    - **Reevaluate Algorithm**: If using UERD or an unknown algorithm, switch to JMiPOD or a proven method with lower distortion. Analyze unknown algorithms thoroughly.
    - **Use New Source Image**: Select a high-resolution, high-quality source image to restart the embedding process.
    - **Forensic Overhaul**: Conduct comprehensive steganalysis to identify vulnerabilities, as severe artifacts likely make embeddings easily detectable.
    - **Avoid All Use**: Do not use the image in any application until quality is restored, as it is unsuitable for both visual and steganographic purposes.`;
}

const report = `1. Introduction
Steganography involves embedding hidden data within digital media, such as images, in a way that is imperceptible to the human eye. This report analyzes the steganographic properties and quality of the uploaded image, providing insights into the embedding algorithm and its impact on visual fidelity.

2. Stegoimage Algorithm Analysis: "${analysisResults}"
${algorithmExplanation}

3. Image Quality Assessment (IQA)
The Image Quality Assessment (IQA) score for the image is ${iqaPercentage}%. This score quantifies the visual quality post-steganographic embedding, based on metrics like structural similarity (SSIM) or peak signal-to-noise ratio (PSNR).
- Excellent (90% - 100%): Negligible artifacts, ideal for high-fidelity applications.
- Good (75% - 89%): Minor artifacts, suitable for most practical uses.
- Moderate (50% - 74%): Noticeable artifacts, acceptable for less critical applications.
- Poor (25% - 49%): Significant artifacts, limiting usability.
- Very Poor (Below 25%): Severe artifacts, unsuitable for most purposes.

Interpretation: The image quality is ${qualityInterpretation}

4. IQA-Based Recommendations
${iqaRecommendations}

5. General Recommendations
- **Image Selection**: Use high-resolution images to enhance embedding capacity and reduce visible distortions.
- **Algorithm Optimization**: Select or tune steganographic algorithms (e.g., JMiPOD for stealth, UERD for balance) to minimize statistical and visual artifacts.
- **Data Payload Management**: Limit embedded data size to preserve image quality and reduce detectability.
- **Preprocessing**: Apply image enhancement techniques (e.g., noise reduction, contrast adjustment) to improve embedding robustness.
- **Testing**: Validate images with forensic tools to ensure resistance to steganalysis.

6. Potential Risks and Vulnerabilities
- **Statistical Attacks**: Steganalysis tools can detect anomalies in pixel distributions or DCT coefficients, especially for UERD or unknown algorithms.
- **Machine Learning Detection**: Advanced models trained on steganographic patterns can identify embeddings, particularly for non-optimized algorithms.
- **Compression Artifacts**: Lossy compression (e.g., JPEG) may corrupt embedded data, reducing reliability.
- **Visual Inspection**: High embedding strengths may produce artifacts visible under close scrutiny, compromising stealth.

7. Conclusion
The image employs the "${analysisResults}" steganographic algorithm with an IQA score of ${iqaPercentage}%. By following the provided IQA-based recommendations, optimizing embedding techniques, and managing data payloads, users can enhance image quality and reduce detection risks. Regular forensic validation is advised to ensure robustness.`;
      const sanitizedReport = report.replace(/[*#]/g, ''); // Remove unwanted symbols
      return sanitizedReport;

      // Remove all symbols from the report
      
     
    }
  };

  const handleHistoryItemSelect = useCallback(async (item: HistoryItem) => {
    setCurrentFileId(item.id);
    setPreview(item.preview || null);

    const reportData = await fetchReportFromDatabase(item.id);
    if (reportData) {
      const analysisObject = {
        payload_class:reportData.analysis,
        iqa_score: reportData.iqaValue, // Add iqaValue to the analysis object
      };
      setAnalysis(analysisObject);
      console.log('Fetched Analysis:', analysisObject);
      setRecommendations(reportData.report);
    } else {
      setAnalysis(item.analysis || null);
      setRecommendations(item.report || null);
    }

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

    // Ensure the report is displayed
    if (item.report) {
      setRecommendations(item.report);
    }
  }, [fetchReportFromDatabase]);

  const handlers = useRef({ handleHistoryItemSelect });
  React.useEffect(() => {
    if (ref) {
      ref(handlers.current);
    }
  }, [ref]);

  useEffect(() => {
    if (selectedHistoryItem) {
      setFile(new File([], selectedHistoryItem.fileName));
      setPreview(selectedHistoryItem.preview);
      setAnalysis(selectedHistoryItem.analysis);
    }
  }, [selectedHistoryItem]);

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
      console.log('Analysis Result:', result);

      const analysisResults = result.payload_class;
      const iqa = result.iqa_score.toFixed(2);

      const recommendations = await fetchChatCompletion(analysisResults, iqa);
      setRecommendations(recommendations ?? null);

      const reportItem: HistoryItem = {
        id: currentFileId,
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date(),
        status: 'analyzed',
        preview,
        analysis: analysisResults,
        report: recommendations,
        iqaValue: iqa,
      };
      console.log('Report Item:', reportItem);

      await saveReportToDatabase(reportItem);
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysis({ error: 'Failed to analyze the file. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [file, currentFileId, preview, updateHistoryItem, saveReportToDatabase]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newUserMessage];

    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }

    try {
      await delay(1000);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: updatedMessages,
        }),
      });

      const chatCompletion = await response.json();

      if (chatCompletion.choices && chatCompletion.choices.length > 0) {
        console.log('API Response:', chatCompletion);
        const botResponse = chatCompletion.choices[0].message.content;
        setChatMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: botResponse }]);
      } else {
        console.log('No choices in response:', chatCompletion);
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
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        setChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [chatBoxRef]);

  const formatRecommendations = (recommendations: string) => {
    const lines = recommendations.split('\n').filter(line => line.trim() !== '');
    let sectionCount = 0;

    return lines.map((line, i) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Handle section headings like **3.2. Stegoimage Algorithm Explanation: JMIPOD**
        sectionCount++;
        const content = trimmedLine.slice(2, -2).trim(); // Remove ** from start and end
        // Remove any nested numbering (e.g., "3.2.") and keep only the title
        const title = content.replace(/^\d+\.\d+\.\s*/, '').trim();
        return (
          <div key={i} className="mt-6">
            <h4 className="text-xl font-semibold text-blue-400">{`${title}`}</h4>
          </div>
        );
      } else if (trimmedLine.startsWith('##')) {
        // Fallback for headings marked with ## (if any)
        sectionCount++;
        const title = trimmedLine.slice(2).replace(/^\d+\.\d+\.\s*/, '').trim();
        return (
          <div key={i} className="mt-6">
            <h4 className="text-xl font-semibold text-blue-400">{`${sectionCount}. ${title}`}</h4>
          </div>
        );
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.startsWith('-') 
          ? trimmedLine.slice(1).trim() 
          : trimmedLine.slice(1).trim();
        
        if (content.includes('**')) {
          const parts = content.split(/(\*\*.*?\*\*)/);
          return (
            <p key={i} className="ml-6 text-gray-300 mt-2">
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        }
        return (
          <p key={i} className="ml-6 text-gray-300 mt-2">{content}</p>
        );
      } else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
        return (
          <p key={i} className="text-gray-300 mt-2">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      } else {
        return (
          <p key={i} className="text-gray-300 mt-2">{trimmedLine}</p>
        );
      }
    });
  };

  
  const renderReport = () => {
    if (!file || !analysis || !recommendations) return null;

    const fileDetails = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      lastModified: new Date(file.lastModified).toLocaleDateString(),
    };

    const analysisResults = {
      payloadClass: analysis?.payload_class || "N/A",
      iqaScore: analysis?.iqa_score ? parseFloat(analysis.iqa_score).toFixed(2) : "N/A",
      classProbabilities: analysis?.class_probabilities || {},
    };

    const filteredImages = [
      { src: analysis?.original_ycbcr || "", caption: "Original (YCbCr)" },
      { src: analysis?.srm_filtered || "", caption: "SRM Filtered" },
      { src: analysis?.noise_residual || "", caption: "Noise Residual" },
    ].filter(image => image.src); // Filter out images with empty src

    const classChartOptions = {
      responsive: true,
      cutout: '80%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        centerText: {
          id: 'centerText',
          afterDatasetsDraw(chart: any) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            ctx.font = 'bold 24px Helvetica';
            ctx.fillStyle = '#D1D5DB';
            ctx.textAlign = 'center';
            ctx.textBaseline= 'middle';
            const text = chart.data.datasets[0].data[0] + '%';
            ctx.fillText(text, width / 2, height / 2);
            ctx.restore();
          },
        },
      },
      rotation: -90,
      circumference: 360,
    };

    const classProbabilitiesCharts = Object.entries(analysisResults.classProbabilities).map(([className, prob]) => {
      const percentage = ((prob as number) * 100).toFixed(2);
      const chartData = {
        labels: [className],
        datasets: [
          {
            data: [percentage, 100 - parseFloat(percentage)],
            backgroundColor: ['#FF0000', '#E5E7EB'],
            borderWidth: 0,
            borderColor: '#FFFFFF',
            borderAlign: 'inner' as const,
          },
        ],
      };
      return { className, percentage, chartData };
    });

    const iqaPercentage = analysisResults.iqaScore !== "N/A" ? (parseFloat(analysisResults.iqaScore) * 100).toFixed(2) : "0";
    const iqaChartData = {
      labels: ['IQA', 'Remaining'],
      datasets: [
        {
          label: 'Image Quality Assessment',
          data: [iqaPercentage, 100 - parseFloat(iqaPercentage)],
          backgroundColor: ['#36A2EB', '#E5E7EB'],
          hoverBackgroundColor: ['#36A2EB', '#E5E7EB'],
        },
      ],
    };

    const iqaChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.label}: ${context.raw}%`,
          },
        },
      },
    };

    const downloadReport = () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      const headerColor = '#1E3A8A';
      const sectionHeaderColor = '#2563EB';
      const subHeaderColor = '#4B5EAA';
      const textColor = '#000000';
      const lineSpacing = 1.5;

      const addText = (text: string, x: number, y: number, fontSize: number, isBold: boolean = false, color: string = textColor) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(color);
        const lines = doc.splitTextToSize(text, maxLineWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4 * lineSpacing);
      };

      const addSectionHeading = (heading: string) => {
        checkPageOverflow(20);
        yPosition = addText(heading, margin, yPosition, 14, true, headerColor);
        yPosition += 3;
      };

      const addMainSectionHeading = (heading: string) => {
        checkPageOverflow(20);
        yPosition = addText(heading, margin, yPosition, 16, true, sectionHeaderColor);
        yPosition += 4;
      };

      const addSubHeading = (heading: string, indent: number = 0) => {
        checkPageOverflow(15);
        yPosition = addText(heading, margin + indent, yPosition, 14, true, subHeaderColor);
        yPosition += 2;
      };

      const addFormattedText = (text: string, x: number, indent: number = 0) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
        let currentX = x + indent;
        let currentLine = '';
        const fontSize = 12;
        doc.setFontSize(fontSize);

        parts.forEach((part, index) => {
          const isBoldDouble = part.startsWith('**') && part.endsWith('**');
          const isBoldSingle = part.startsWith('*') && part.endsWith('*') && !isBoldDouble;
          const isBold = isBoldDouble || isBoldSingle;
          const content = isBold ? part.slice(isBoldDouble ? 2 : 1, isBoldDouble ? -2 : -1) : part;

          doc.setFont("helvetica", isBold ? "bold" : "normal");
          const contentWidth = doc.getTextWidth(content);

          const testLine = currentLine + content;
          const testLineWidth = doc.getTextWidth(testLine);

          if (currentX === x + indent && testLineWidth <= maxLineWidth) {
            currentLine += content;
          } else if (currentX === x + indent && testLineWidth > maxLineWidth) {
            const words = content.split(' ');
            words.forEach((word, wordIndex) => {
              const testWordLine = currentLine + (currentLine ? ' ' : '') + word;
              const testWordLineWidth = doc.getTextWidth(testWordLine);

              if (testWordLineWidth <= maxLineWidth) {
                currentLine += (currentLine ? ' ' : '') + word;
              } else {
                if (currentLine) {
                  doc.setFont("helvetica", isBold && wordIndex === 0 ? "bold" : "normal");
                  checkPageOverflow(5);
                  doc.text(currentLine, currentX, yPosition);
                  yPosition += fontSize * 0.4 * lineSpacing;
                  currentLine = word;
                } else {
                  checkPageOverflow(5);
                  doc.text(word, currentX, yPosition);
                  yPosition += fontSize * 0.4 * lineSpacing;
                  currentLine = '';
                }
              }
            });
          } else {
            checkPageOverflow(5);
            doc.text(currentLine, x + indent, yPosition);
            yPosition += fontSize * 0.4 * lineSpacing;
            currentLine = content;
            currentX = x + indent;
          }
        });

        if (currentLine) {
          checkPageOverflow(5);
          doc.text(currentLine, currentX, yPosition);
          yPosition += fontSize * 0.4 * lineSpacing;
        }
      };

      const addParagraph = (text: string, indent: number = 0) => {
        addFormattedText(text, margin, indent);
      };

      const addNumberedPoint = (text: string, pointNumber: number, indentLevel: number = 1) => {
        const indent = indentLevel * 5;
        checkPageOverflow(5);
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        const numberText = `${pointNumber}.`;
        doc.text(numberText, margin + indent - 10, yPosition);
        addFormattedText(text, margin, indent);
      };

      const checkPageOverflow = (additionalHeight: number) => {
        if (yPosition + additionalHeight > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin + 15;
        }
      };

      const addHeader = () => {
        doc.setFontSize(10);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "normal");
        doc.text("Stegoimage Analysis Report", margin, 10);
        doc.setDrawColor(headerColor);
        doc.line(margin, 12, pageWidth - margin, 12);
      };

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor('#666666');
          doc.setFont("helvetica", "normal");
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
        }
      };

      doc.setFontSize(24);
      doc.setTextColor(headerColor);
      doc.setFont("helvetica", "bold");
      doc.text("Stegoimage Analysis Report", pageWidth / 2, pageHeight / 3, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString();
      doc.text(`Date: ${currentDate}`, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });
      doc.text(`Subject: Analysis of Stegoimage Utilized with ${analysisResults.payloadClass} Algorithm`, pageWidth / 2, pageHeight / 3 + 30, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight / 3 + 40, { align: 'center' });
      doc.addPage();

      yPosition = margin + 15;

      addSectionHeading("1. File Details");
      addParagraph(`File Name: ${fileDetails.fileName}`);
      addParagraph(`File Size: ${fileDetails.fileSize}`);
      addParagraph(`Last Modified: ${fileDetails.lastModified}`);
      yPosition += 5;

      addSectionHeading("2. Analysis Results");
      addParagraph(`Payload Classification: ${analysisResults.payloadClass}`);
      addSubHeading("Class Probabilities:", 5);
      let pointNumber = 1;
      Object.entries(analysisResults.classProbabilities).forEach(([className, prob]) => {
        addNumberedPoint(`${className}: ${((prob as number) * 100).toFixed(2)}%`, pointNumber++, 2);
      });
      addParagraph(`IQA Score: ${analysisResults.iqaScore}`);
      yPosition += 5;

      addSectionHeading("3. Filtered Images");
      const imgWidth = 60;
      const imgHeight = 60;
      const imgSpacing = 10;
      const totalWidth = (imgWidth * 3) + (imgSpacing * 2);
      const startX = (pageWidth - totalWidth) / 2;

      filteredImages.forEach((img, index) => {
        checkPageOverflow(imgHeight + 20);
        const xPosition = startX + (index * (imgWidth + imgSpacing));
        doc.addImage(img.src, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(img.caption, xPosition + (imgWidth / 2), yPosition + imgHeight + 5, { align: 'center' });
      });
      yPosition += imgHeight + 15;

      if (preview) {
        addSectionHeading("4. Original Image");
        const imgWidth = 180;
        const imgHeight = 100;
        checkPageOverflow(imgHeight + 20);
        doc.addImage(preview, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      let sectionCount = 4;
      const recommendationLines = recommendations.split('\n').filter(line => line.trim() !== '');
      console.log('Recommendation Lines:', recommendationLines);
      let indentLevel = 1;
      let inPotentialCauses = false;
      let potentialCausesPointNumber = 1;
      let sectionPointNumber = 1;

      const addRecommendationLines = () => {
        checkPageOverflow(20);
        yPosition = addText("5. Recommendations", margin, yPosition, 14, true, headerColor);
        yPosition += 5;
    
        recommendationLines.forEach((line, index) => {
          const sanitizedLine = line.replace(/[^\w\s]/g, ''); // Remove all symbols
          checkPageOverflow(10);
          yPosition = addText(sanitizedLine, margin, yPosition, 12, false, textColor);
        });
      };

      addRecommendationLines();

      const pageCount = doc.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        addHeader();
      }
      addFooter();

      doc.save(`analysis_report_${file.name}_.pdf`);
    };

    
    return (
      <div className="bg-gray-900 shadow-lg rounded-lg p-8 space-y-6 text-white max-w-4xl mx-auto">
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-blue-400 mb-3">File Details</h3>
          <ul className="space-y-2 text-gray-300">
            <li><span className="font-semibold text-blue-200">File Name:</span> {file.name}</li>
            <li><span className="font-semibold text-blue-200">File Size:</span> {(file.size / 1024).toFixed(2)} KB</li>
            <li><span className="font-semibold text-blue-200">Last Modified:</span> {new Date(file.lastModified).toLocaleDateString()}</li>
          </ul>
        </div>

        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-blue-400 mb-3">Analysis Results</h3>
          {analysis.error ? (
            <p className="text-red-500">{analysis.error}</p>
          ) : (
            <div className="space-y-6">
              <div>
                <span className="font-semibold text-blue-200">Payload Classification:</span>{' '}
                <span className="text-blue-400">{analysis.payload_class}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-200">Class Probabilities:</span>
                <div className="mt-4 flex flex-wrap justify-center gap-8">
                  {classProbabilitiesCharts.map((chart, index) => (
                    <div key={index} className="text-center">
                      <div className="relative w-32 h-32">
                        <Doughnut
                          data={chart.chartData}
                          options={classChartOptions}
                          plugins={[classChartOptions.plugins.centerText]}
                        />
                      </div>
                      <p className="mt-2 text-gray-300 text-sm">{chart.className}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-blue-200">Image Quality Assessment (IQA):</span>{' '}
                <span className="text-green-400">{analysisResults.iqaScore}</span>
                <div className="mt-4 flex justify-center">
                  <div className="w-64 h-64">
                    <Pie data={iqaChartData} options={iqaChartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Filtered Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredImages.map((img, index) => (
              <div key={index} className="text-center">
                <img src={img.src} alt={img.caption} className="w-full h-40 object-cover rounded-lg shadow-md" />
                <p className="mt-2 text-gray-300 text-sm">{img.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Detailed Analysis</h3>
          <div className="text-gray-300 space-y-2">{formatRecommendations(recommendations)}</div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={downloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            <Download size={24} strokeWidth={3} />
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
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            }
          }
        `}
      </style>
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #4caf50, #36A2EB, #4caf50)',
              position: 'relative',
              animation: 'spin 1.5s linear infinite, pulse 1.5s ease-in-out infinite',
            }}
          >
            <div
              style={{
                content: '""',
                position: 'absolute',
                top: '5px',
                left: '5px',
                right: '5px',
                bottom: '5px',
                backgroundColor: '#1E3A8A',
                borderRadius: '50%',
              }}
            />
          </div>
          <p
            style={{
              marginTop: '20px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animation: 'fadeIn 0.5s ease-in-out',
            }}
          >
            Processing Image...
          </p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
                >
                  Analyze File
                </button>
              )}

              {analysis && (
                <>
                  {renderReport()}
                  <button
                    onClick={resetAnalysis}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md mt-4"
                  >
                    <RefreshCcw size={24} strokeWidth={3} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
            backgroundColor: '#1E3A8A',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '24px', color: 'white' }}>💬</span>
        </button>
      </div>

      {chatOpen && (
        <div
          ref={chatBoxRef}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            height: '500px',
            backgroundColor: '#1E3A8A',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-in-out',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: '10px',
              backgroundColor: '#1E3A8A',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1px solid #4B5EAA',
            }}
          >
            Chatbot
          </div>
          <div
            style={{
              padding: '10px',
              height: '380px',
              overflowY: 'auto',
              borderBottom: '1px solid #4B5EAA',
              color: 'white',
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
                    backgroundColor: message.role === 'user' ? '#3B82F6' : '#4B5EAA',
                    color: 'white',
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                    textAlign: 'left',
                  }}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '5px 0' }}>
                      {line.startsWith('-') ? (
                        <strong>{line}</strong>
                      ) : line.includes('**') ? (
                        <span>
                          {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong key={j}>{part.slice(2, -2)}</strong>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      ) : line.startsWith('* **') ? (
                        <span>
                          <strong>Point:</strong> {line.slice(1).trim()}
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </span>
              </div>
            ))}
            {isChatLoading && (
              <div
                style={{
                  marginBottom: '10px',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    backgroundColor: '#4B5EAA',
                    color: 'white',
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid #fff',
                      borderTop: '3px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      marginRight: '10px',
                    }}
                  />
                  Thinking...
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #4B5EAA', alignItems: 'center' }}>
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
                color: 'black',
              }}
              disabled={isChatLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isChatLoading) {
                  handleChatSubmit();
                }
              }}
            />
            <button
              onClick={handleChatSubmit}
              disabled={isChatLoading}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isChatLoading ? 'not-allowed' : 'pointer',
                opacity: isChatLoading ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: '20px' }}>➤</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}