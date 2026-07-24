import { simpleParser, ParsedMail } from 'mailparser';
import { Readable } from 'stream';

export interface ParsedEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  date?: Date;
  headers?: any;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

/**
 * Parse email file (.eml, .msg format)
 */
export const parseEmailFile = async (fileBuffer: Buffer): Promise<ParsedEmail> => {
  try {
    const parsed: ParsedMail = await simpleParser(fileBuffer);

    // Extract email information
    const emailData: ParsedEmail = {
      from: parsed.from?.text || 'Unknown',
      to: parsed.to?.text || 'Unknown',
      subject: parsed.subject || 'No Subject',
      text: parsed.text || '',
      html: parsed.html || undefined,
      date: parsed.date || undefined,
      headers: parsed.headers || undefined,
      attachments: parsed.attachments?.map(att => ({
        filename: att.filename || 'unknown',
        contentType: att.contentType,
        size: att.size,
      })) || [],
    };

    return emailData;
  } catch (error) {
    console.error('Email parsing error:', error);
    throw new Error('Failed to parse email file');
  }
};

/**
 * Analyze email headers for spoofing and phishing indicators
 */
export const analyzeEmailHeaders = (emailData: ParsedEmail): {
  suspiciousIndicators: string[];
  riskScore: number;
} => {
  const indicators: string[] = [];
  let riskScore = 0;

  // Check from address
  const fromAddress = emailData.from.toLowerCase();
  
  // Common phishing domains
  const suspiciousDomains = [
    'tempmail', 'guerrillamail', 'mailinator', 
    'yopmail', '10minutemail', 'throwaway'
  ];
  
  if (suspiciousDomains.some(domain => fromAddress.includes(domain))) {
    indicators.push('Sender uses temporary/disposable email service');
    riskScore += 30;
  }

  // Check for mismatched display name and email
  if (emailData.from.includes('<') && emailData.from.includes('>')) {
    const displayName = emailData.from.split('<')[0].trim().toLowerCase();
    const emailAddress = emailData.from.split('<')[1].split('>')[0].toLowerCase();
    
    // Check if display name suggests a brand but email doesn't match
    const brands = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook'];
    brands.forEach(brand => {
      if (displayName.includes(brand) && !emailAddress.includes(brand)) {
        indicators.push(`Display name mentions "${brand}" but email domain doesn't match`);
        riskScore += 40;
      }
    });
  }

  // Check subject for urgency/scam keywords
  const subject = emailData.subject.toLowerCase();
  const urgentKeywords = [
    'urgent', 'immediate', 'action required', 'verify', 
    'suspend', 'confirm', 'update', 'secure', 'alert'
  ];
  
  urgentKeywords.forEach(keyword => {
    if (subject.includes(keyword)) {
      indicators.push(`Subject contains urgency keyword: "${keyword}"`);
      riskScore += 10;
    }
  });

  // Check for suspicious attachments
  if (emailData.attachments && emailData.attachments.length > 0) {
    const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.vbs', '.js'];
    
    emailData.attachments.forEach(att => {
      const ext = att.filename.toLowerCase().substring(att.filename.lastIndexOf('.'));
      if (dangerousExtensions.includes(ext)) {
        indicators.push(`Dangerous attachment type: ${att.filename}`);
        riskScore += 50;
      }
    });
  }

  // Check email headers for spoofing
  if (emailData.headers) {
    // SPF, DKIM, DMARC checks would go here if headers contain that info
    // This is simplified for demonstration
    const headerStr = JSON.stringify(emailData.headers).toLowerCase();
    
    if (headerStr.includes('spf=fail') || headerStr.includes('dkim=fail')) {
      indicators.push('Email failed authentication checks (SPF/DKIM)');
      riskScore += 40;
    }
  }

  return {
    suspiciousIndicators: indicators,
    riskScore: Math.min(riskScore, 100),
  };
};

/**
 * Extract full text from email for AI analysis
 */
export const extractEmailText = (emailData: ParsedEmail): string => {
  let fullText = `From: ${emailData.from}\n`;
  fullText += `To: ${emailData.to}\n`;
  fullText += `Subject: ${emailData.subject}\n\n`;
  fullText += emailData.text;

  return fullText;
};
