import { jsPDF } from 'jspdf';

export function generatePDF(content: string, imageDataUrl?: string) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Security Analysis Report', 20, 20);
  
  let startY = 40;
  if (imageDataUrl) {
    try {
      const img = new Image();
      img.src = imageDataUrl;
      
      const maxWidth = 170; 
      const maxHeight = 120; 
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      if (finalWidth > maxWidth) {
        const ratio = maxWidth / finalWidth;
        finalWidth = maxWidth;
        finalHeight = finalHeight * ratio;
      }
      
      if (finalHeight > maxHeight) {
        const ratio = maxHeight / finalHeight;
        finalWidth = finalWidth * ratio;
        finalHeight = maxHeight;
      }
      
      const leftMargin = (210 - finalWidth) / 2; 
      
      doc.addImage(imageDataUrl, 'JPEG', leftMargin, startY, finalWidth, finalHeight, undefined, 'FAST');
      startY = startY + finalHeight + 20; 
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }
  
  doc.setFontSize(12);
  const lines = content.split('\n');
  let y = startY;
  
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line.trim(), 20, y);
    y += 7;
  });
  
  doc.save('security-analysis-report.pdf');
}