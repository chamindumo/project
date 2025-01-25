import { jsPDF } from 'jspdf';

export function generatePDF(content: string) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Security Analysis Report', 20, 20);
  
  // Add content
  doc.setFontSize(12);
  const lines = content.split('\n');
  let y = 40;
  
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 7;
  });
  
  // Download the PDF
  doc.save('security-analysis-report.pdf');
}