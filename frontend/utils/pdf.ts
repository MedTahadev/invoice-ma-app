
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadPdf = (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  // Hide buttons before capturing
  const buttons = input.querySelectorAll('button');
  buttons.forEach(btn => btn.style.display = 'none');
  
  html2canvas(input, { scale: 2 }) // Increase scale for better quality
    .then((canvas) => {
      // Show buttons again after capturing
      buttons.forEach(btn => btn.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${fileName}.pdf`);
    })
    .catch(err => {
        // Ensure buttons are visible even if there's an error
        buttons.forEach(btn => btn.style.display = '');
        console.error("Error generating PDF:", err);
    });
};
