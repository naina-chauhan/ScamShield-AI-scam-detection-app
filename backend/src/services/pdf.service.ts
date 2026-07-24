import PDFDocument from 'pdfkit';
import { AnalysisResult } from './ai.service.js';

export interface PDFReportData {
  scanType: string;
  inputText: string;
  result: AnalysisResult;
  userName?: string;
  timestamp: Date;
}

export const generatePDFReport = (data: PDFReportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(24)
      .fillColor('#1e40af')
      .text('ScamShield AI Report', { align: 'center' })
      .moveDown(0.5);

    // Subtitle
    doc
      .fontSize(12)
      .fillColor('#6b7280')
      .text('Scam Detection Analysis Report', { align: 'center' })
      .moveDown(1);

    // Divider line
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);

    // Report metadata
    doc
      .fontSize(10)
      .fillColor('#374151')
      .text(`Report Date: ${data.timestamp.toLocaleString()}`, 50, doc.y)
      .text(`Scan Type: ${data.scanType.toUpperCase()}`, 50, doc.y + 15)
      .text(`User: ${data.userName || 'Anonymous'}`, 50, doc.y + 30)
      .moveDown(2);

    // Result status box
    const statusColor = 
      data.result.status === 'scam' ? '#dc2626' :
      data.result.status === 'warning' ? '#f59e0b' :
      '#10b981';

    const statusText = 
      data.result.status === 'scam' ? '⚠️ SCAM DETECTED' :
      data.result.status === 'warning' ? '⚠️ SUSPICIOUS' :
      '✓ SAFE';

    doc
      .rect(50, doc.y, 500, 60)
      .fillAndStroke(statusColor, statusColor)
      .fillColor('#ffffff')
      .fontSize(20)
      .text(statusText, 50, doc.y - 50, {
        width: 500,
        align: 'center',
        lineBreak: false,
      })
      .moveDown(3);

    // Confidence score
    doc
      .fillColor('#374151')
      .fontSize(14)
      .text('Confidence Score', 50, doc.y, { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(32)
      .fillColor(statusColor)
      .text(`${data.result.confidence}%`, 50, doc.y)
      .moveDown(1.5);

    // Category
    doc
      .fillColor('#374151')
      .fontSize(14)
      .text('Scam Category', 50, doc.y, { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#6b7280')
      .text(data.result.scamCategory.replace(/_/g, ' ').toUpperCase(), 50, doc.y)
      .moveDown(1.5);

    // Explanation
    doc
      .fillColor('#374151')
      .fontSize(14)
      .text('Analysis Summary', 50, doc.y, { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor('#6b7280')
      .text(data.result.explanation, 50, doc.y, {
        width: 500,
        align: 'justify',
      })
      .moveDown(1.5);

    // Detailed reasoning
    if (data.result.detailedReasoning && data.result.detailedReasoning.length > 0) {
      doc
        .fillColor('#374151')
        .fontSize(14)
        .text('Detailed Reasoning', 50, doc.y, { underline: true })
        .moveDown(0.5);

      data.result.detailedReasoning.forEach((reason, index) => {
        doc
          .fontSize(10)
          .fillColor('#6b7280')
          .text(`${index + 1}. ${reason}`, 60, doc.y, {
            width: 490,
            align: 'left',
          })
          .moveDown(0.5);
      });

      doc.moveDown(1);
    }

    // Suspicious words/phrases
    if (data.result.suspiciousWords && data.result.suspiciousWords.length > 0) {
      doc
        .fillColor('#374151')
        .fontSize(14)
        .text('Suspicious Keywords Detected', 50, doc.y, { underline: true })
        .moveDown(0.5);

      const keywords = data.result.suspiciousWords.join(', ');
      doc
        .fontSize(10)
        .fillColor('#dc2626')
        .text(keywords, 50, doc.y, {
          width: 500,
          align: 'left',
        })
        .moveDown(1.5);
    }

    // Analyzed content (truncated)
    doc
      .fillColor('#374151')
      .fontSize(14)
      .text('Analyzed Content', 50, doc.y, { underline: true })
      .moveDown(0.5);

    const truncatedInput = data.inputText.length > 500 
      ? data.inputText.substring(0, 500) + '...' 
      : data.inputText;

    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(truncatedInput, 50, doc.y, {
        width: 500,
        align: 'left',
      })
      .moveDown(2);

    // Add new page if needed
    if (doc.y > 650) {
      doc.addPage();
    }

    // Recommendations
    doc
      .fillColor('#374151')
      .fontSize(14)
      .text('Safety Recommendations', 50, doc.y, { underline: true })
      .moveDown(0.5);

    const recommendations = [
      'Never share OTP, PIN, CVV, or passwords with anyone',
      'Verify sender authenticity before responding',
      'Do not click on suspicious links',
      'Contact organizations directly using official channels',
      'Report suspicious messages to authorities',
      'Keep your software and security systems updated',
    ];

    recommendations.forEach((rec, index) => {
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(`• ${rec}`, 60, doc.y, {
          width: 490,
          align: 'left',
        })
        .moveDown(0.3);
    });

    doc.moveDown(2);

    // Footer
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.5);

    doc
      .fontSize(8)
      .fillColor('#9ca3af')
      .text('Generated by ScamShield AI - Your Digital Safety Partner', 50, doc.y, {
        align: 'center',
      })
      .text('For more information, visit https://scamshield.ai', 50, doc.y + 10, {
        align: 'center',
      });

    // Finalize PDF
    doc.end();
  });
};
