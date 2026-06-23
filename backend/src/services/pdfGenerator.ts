import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface RFQData {
  quotationNumber: string;
  date: string;
  companyName: string;
  billingAddress: string;
  softwareName: string;
  vendor: string;
  seatCount: number;
  expiryDate: string;
  pricePerSeat: number;
  totalAmount: number;
  paymentTerms: string;
}

export const buildRFQDocument = (res: Response, data: RFQData): void => {
  // Initialize a new PDF document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  
  // Set the response headers to trigger a file download in the browser
  const filename = `RFQ_${data.companyName.replace(/\s+/g, '_')}_${data.softwareName}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe the PDF directly to the Express response object
  doc.pipe(res);

  // --- 1. Header (Agency Letterhead) ---
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#4338ca').text('Elite Software Solution', { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('123 Tech Boulevard, Innovation District', { align: 'right' });
  doc.text('hello@elitesoftware.com | +1 (555) 123-4567', { align: 'right' });
  doc.moveDown(2);

  // --- 2. Document Title & Meta ---
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text('REQUEST FOR QUOTATION (RFQ)');
  doc.moveDown(1);
  doc.fontSize(10).font('Helvetica').text(`Quotation Ref: ${data.quotationNumber}`);
  doc.text(`Date: ${data.date}`);
  doc.moveDown(1.5);

  // --- 3. Client Information ---
  doc.font('Helvetica-Bold').text('Prepared For:');
  doc.font('Helvetica').text(data.companyName);
  doc.text(data.billingAddress || 'Address not provided');
  doc.moveDown(2);

  // --- 4. Renewal Summary Table ---
  const tableTop = doc.y;
  
  // Table Headers
  doc.font('Helvetica-Bold');
  doc.text('Software Product', 50, tableTop);
  doc.text('Vendor', 200, tableTop);
  doc.text('Seats', 300, tableTop);
  doc.text('Unit Price', 380, tableTop);
  doc.text('Total', 480, tableTop);
  
  // Divider Line
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#cbd5e1').stroke();

  // Table Row
  doc.font('Helvetica');
  doc.text(data.softwareName, 50, tableTop + 25);
  doc.text(data.vendor, 200, tableTop + 25);
  doc.text(data.seatCount.toString(), 300, tableTop + 25);
  doc.text(`$${data.pricePerSeat.toFixed(2)}`, 380, tableTop + 25);
  doc.text(`$${data.totalAmount.toFixed(2)}`, 480, tableTop + 25);

  doc.moveDown(3);

 // --- 5. Payment Terms & Instructions ---
  // We explicitly add the X-coordinate (50) and Y-coordinate (doc.y + 40) here to reset the cursor to the left margin!
  doc.font('Helvetica-Bold').text('Terms & Conditions:', 50, doc.y + 40);
  doc.font('Helvetica').text(`1. Payment Terms: ${data.paymentTerms}`);
  doc.text(`2. Current license expires on: ${data.expiryDate}`);
  doc.text('3. Please confirm renewal at least 7 days prior to expiration to avoid service interruption.');
  doc.moveDown(3);

  // --- 6. Signature Block ---
  doc.text('_____________________________');
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('Authorized Signature');
  doc.font('Helvetica').text('Ahamed, Project Manager');

  // Finalize the PDF and end the stream
  doc.end();
};

// Add this below your existing buildRFQDocument function
export const buildRFQBuffer = (rfqData: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- ADD YOUR PDF DESIGN HERE ---
      // (You can copy the exact same doc.fontSize().text() design logic you used in buildRFQDocument)
      doc.fontSize(20).text('REQUEST FOR QUOTATION', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Quote Number: ${rfqData.quotationNumber}`);
      doc.text(`Company: ${rfqData.companyName}`);
      doc.text(`Software: ${rfqData.softwareName}`);
      doc.text(`Seats: ${rfqData.seatCount}`);
      doc.text(`Total Amount: $${rfqData.totalAmount}`);
      // --------------------------------

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};