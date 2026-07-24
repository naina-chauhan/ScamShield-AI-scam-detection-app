import OpenAI from 'openai';
import axios from 'axios';

// Configuration for multiple LLM providers
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // openai, groq, huggingface, ollama

// Initialize OpenAI (if using)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Groq (free alternative)
const groq = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
}) : null;

// Hugging Face API
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

export interface AnalysisResult {
  status: 'scam' | 'warning' | 'safe';
  confidence: number;
  explanation: string;
  detailedReasoning: string[];
  suspiciousWords: string[];
  scamCategory: string;
  language: string;
  embedding?: number[];
}

// Multilingual scam keywords
const SCAM_KEYWORDS: Record<string, Record<string, string[]>> = {
  en: {
    urgent: ['urgent', 'immediately', 'act now', 'limited time', 'expires', 'hurry'],
    money: ['won', 'prize', 'lottery', 'million', 'claim', 'reward', 'refund', 'inheritance'],
    personal: ['verify', 'confirm', 'update', 'suspend', 'account', 'password', 'otp', 'pin', 'cvv'],
    threats: ['blocked', 'suspended', 'legal action', 'arrest', 'police', 'court', 'lawsuit'],
    links: ['click here', 'verify now', 'update here', 'confirm here', 'bit.ly', 'tinyurl'],
    payment: ['bank', 'credit card', 'payment', 'upi', 'paytm', 'gpay', 'phonepe', 'paypal'],
  },
  hi: {
    urgent: ['तुरंत', 'जल्दी', 'अभी', 'समय सीमित', 'खत्म हो रहा'],
    money: ['जीता', 'इनाम', 'लॉटरी', 'लाख', 'करोड़', 'पुरस्कार', 'रिफंड'],
    personal: ['वेरीफाई', 'कन्फर्म', 'अपडेट', 'सस्पेंड', 'अकाउंट', 'पासवर्ड', 'ओटीपी', 'पिन'],
    threats: ['ब्लॉक', 'बंद', 'कानूनी कार्रवाई', 'गिरफ्तारी', 'पुलिस'],
    links: ['यहाँ क्लिक करें', 'अभी वेरीफाई करें'],
    payment: ['बैंक', 'क्रेडिट कार्ड', 'पेमेंट', 'यूपीआई', 'पेटीएम', 'गूगल पे', 'फोनपे'],
  },
  es: {
    urgent: ['urgente', 'inmediatamente', 'ahora', 'tiempo limitado', 'expira'],
    money: ['ganado', 'premio', 'lotería', 'millón', 'reclamar', 'recompensa'],
    personal: ['verificar', 'confirmar', 'actualizar', 'suspender', 'cuenta', 'contraseña'],
    threats: ['bloqueado', 'suspendido', 'acción legal', 'arresto', 'policía'],
    links: ['haga clic aquí', 'verifique ahora'],
    payment: ['banco', 'tarjeta de crédito', 'pago', 'transferencia'],
  },
};

// Detect language
const detectLanguage = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
  if (/[àâäçèéêëîïôùûü]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  
  return 'en';
};

// Keyword-based analysis
const analyzeKeywords = (text: string, language: string): { score: number; words: string[] } => {
  const lowerText = text.toLowerCase();
  const suspiciousWords: string[] = [];
  let score = 0;

  const keywords = SCAM_KEYWORDS[language] || SCAM_KEYWORDS['en'];

  Object.entries(keywords).forEach(([category, words]) => {
    words.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        suspiciousWords.push(keyword);
        score += 10;
      }
    });
  });

  return { score, words: suspiciousWords };
};

// ============================================
// AI Analysis with Multiple Providers
// ============================================

// 1. OpenAI (Paid but best quality)
const analyzeWithOpenAI = async (text: string, scanType: string, language: string) => {
  if (!openai) throw new Error('OpenAI not configured');

  const systemPrompt = `You are an expert scam detection AI. Analyze the provided ${scanType} and determine if it's a scam, suspicious, or safe.

Respond in JSON format:
{
  "status": "scam" | "warning" | "safe",
  "confidence": 0-100,
  "explanation": "Brief explanation",
  "reasoning": ["Detailed reason 1", "Detailed reason 2", ...],
  "category": "phishing|lottery_scam|otp_fraud|investment_fraud|romance_scam|tech_support|impersonation|safe"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this ${scanType} (language: ${language}):\n\n${text}` },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
};

// 2. Groq (FREE and FAST! - Recommended)
const analyzeWithGroq = async (text: string, scanType: string, language: string) => {
  if (!groq) throw new Error('Groq not configured');

  const systemPrompt = `You are an expert scam detection AI. Analyze the provided ${scanType} and determine if it's a scam, suspicious, or safe.

Respond in JSON format:
{
  "status": "scam" | "warning" | "safe",
  "confidence": 0-100,
  "explanation": "Brief explanation",
  "reasoning": ["Detailed reason 1", "Detailed reason 2", ...],
  "category": "phishing|lottery_scam|otp_fraud|investment_fraud|romance_scam|tech_support|impersonation|safe"
}`;

  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768', // Free and powerful model
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this ${scanType} (language: ${language}):\n\n${text}` },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
};

// 3. Hugging Face (FREE)
const analyzeWithHuggingFace = async (text: string, scanType: string) => {
  if (!HF_API_KEY) throw new Error('Hugging Face not configured');

  try {
    // Use zero-shot classification
    const response = await axios.post(
      `${HF_API_URL}/facebook/bart-large-mnli`,
      {
        inputs: text,
        parameters: {
          candidate_labels: ['scam', 'phishing', 'legitimate', 'spam', 'fraud'],
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
        },
      }
    );

    const labels = response.data.labels;
    const scores = response.data.scores;
    const topLabel = labels[0];
    const topScore = scores[0];

    let status: 'scam' | 'warning' | 'safe' = 'safe';
    let category = 'unknown';

    if (topLabel === 'scam' || topLabel === 'phishing' || topLabel === 'fraud') {
      status = topScore > 0.7 ? 'scam' : 'warning';
      category = topLabel === 'phishing' ? 'phishing' : 'general_fraud';
    }

    return {
      status,
      confidence: Math.round(topScore * 100),
      explanation: `AI detected ${topLabel} with ${Math.round(topScore * 100)}% confidence`,
      reasoning: [`Primary classification: ${topLabel}`, `Confidence score: ${topScore.toFixed(2)}`],
      category,
    };
  } catch (error) {
    throw new Error('Hugging Face API failed');
  }
};

// 4. Ollama (FREE, Local, No API key needed!)
const analyzeWithOllama = async (text: string, scanType: string, language: string) => {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  try {
    const response = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'llama3', // or mistral, phi, etc.
      prompt: `You are an expert scam detection AI. Analyze this ${scanType} and determine if it's a scam, suspicious, or safe.

${scanType}: ${text}

Respond in JSON format only:
{
  "status": "scam" | "warning" | "safe",
  "confidence": 0-100,
  "explanation": "Brief explanation",
  "reasoning": ["reason1", "reason2"],
  "category": "phishing|lottery_scam|otp_fraud|safe"
}`,
      stream: false,
      format: 'json',
    });

    return JSON.parse(response.data.response);
  } catch (error) {
    throw new Error('Ollama not running or not configured');
  }
};

// 5. Google Gemini (FREE)
const analyzeWithGemini = async (text: string, scanType: string, language: string) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('Gemini not configured');

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
      {
        contents: [{
          parts: [{
            text: `You are an expert scam detection AI. Analyze this ${scanType} and respond in JSON format only:
{
  "status": "scam" | "warning" | "safe",
  "confidence": 0-100,
  "explanation": "Brief explanation",
  "reasoning": ["reason1", "reason2"],
  "category": "phishing|lottery_scam|otp_fraud|safe"
}

Analyze: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
        },
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
  } catch (error) {
    throw new Error('Gemini API failed');
  }
};

// Main AI analysis function with provider selection
const analyzeWithAI_Provider = async (text: string, scanType: string, language: string) => {
  try {
    const provider = AI_PROVIDER.toLowerCase();
    
    // Try specified provider first
    if (provider === 'openai' && openai) {
      return await analyzeWithOpenAI(text, scanType, language);
    } else if (provider === 'groq' && groq) {
      return await analyzeWithGroq(text, scanType, language);
    } else if ((provider === 'huggingface' || provider === 'hf') && HF_API_KEY) {
      return await analyzeWithHuggingFace(text, scanType);
    } else if (provider === 'ollama') {
      return await analyzeWithOllama(text, scanType, language);
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      return await analyzeWithGemini(text, scanType, language);
    }
    
    // Auto-detect available provider
    console.log('Specified provider not available, trying alternatives...');
    if (groq) return await analyzeWithGroq(text, scanType, language);
    if (process.env.GEMINI_API_KEY) return await analyzeWithGemini(text, scanType, language);
    if (HF_API_KEY) return await analyzeWithHuggingFace(text, scanType);
    if (process.env.OLLAMA_URL) return await analyzeWithOllama(text, scanType, language);
    if (openai) return await analyzeWithOpenAI(text, scanType, language);
    
    throw new Error('No AI provider configured');
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to keyword-based analysis
    return {
      status: 'warning',
      confidence: 50,
      explanation: 'AI analysis unavailable, using keyword-based detection only',
      reasoning: ['AI service temporarily unavailable', 'Using keyword pattern matching'],
      category: 'unknown',
    };
  }
};

// Generate embeddings (OpenAI or free alternatives)
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    if (openai && AI_PROVIDER === 'openai') {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
      });
      return response.data[0].embedding;
    }

    // Free alternative: Use sentence transformers via HuggingFace
    if (HF_API_KEY) {
      const response = await axios.post(
        `${HF_API_URL}/sentence-transformers/all-MiniLM-L6-v2`,
        { inputs: text.substring(0, 8000) },
        { headers: { 'Authorization': `Bearer ${HF_API_KEY}` } }
      );
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Embedding generation error:', error);
    return [];
  }
};

// URL analysis
const analyzeURL = async (url: string): Promise<AnalysisResult> => {
  const suspiciousWords: string[] = [];
  let scamScore = 0;
  const reasoning: string[] = [];

  const urlLower = url.toLowerCase();
  
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
  if (suspiciousTLDs.some(tld => urlLower.endsWith(tld))) {
    suspiciousWords.push('suspicious TLD');
    scamScore += 30;
    reasoning.push('Uses a suspicious top-level domain commonly associated with scams');
  }

  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    suspiciousWords.push('IP address URL');
    scamScore += 40;
    reasoning.push('Uses IP address instead of legitimate domain name');
  }

  const commonBrands = ['google', 'facebook', 'amazon', 'paypal', 'microsoft', 'apple', 'netflix', 'instagram'];
  commonBrands.forEach(brand => {
    const variations = [
      brand.replace(/o/g, '0'),
      brand.replace(/i/g, '1'),
      brand.replace(/l/g, '1'),
      brand.replace(/a/g, '@'),
    ];
    
    if (variations.some(v => urlLower.includes(v))) {
      suspiciousWords.push('typosquatting');
      scamScore += 50;
      reasoning.push(`Possible typosquatting attempt mimicking ${brand}`);
    }
  });

  if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
    scamScore += 15;
    reasoning.push('Not using secure HTTPS protocol');
  }

  if (/bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly/.test(urlLower)) {
    scamScore += 25;
    reasoning.push('Uses URL shortener, hiding actual destination');
  }

  // Get AI analysis
  const aiAnalysis = await analyzeWithAI_Provider(url, 'url', 'en');
  scamScore = Math.max(scamScore, (100 - aiAnalysis.confidence));
  reasoning.push(...aiAnalysis.reasoning);

  let status: 'scam' | 'warning' | 'safe';
  let confidence: number;

  if (scamScore >= 50 || aiAnalysis.status === 'scam') {
    status = 'scam';
    confidence = Math.min(95, 60 + scamScore / 2);
  } else if (scamScore >= 25 || aiAnalysis.status === 'warning') {
    status = 'warning';
    confidence = Math.min(85, 50 + scamScore / 2);
  } else {
    status = 'safe';
    confidence = Math.max(70, 95 - scamScore);
  }

  return {
    status,
    confidence: Math.round(confidence),
    explanation: aiAnalysis.explanation,
    detailedReasoning: reasoning,
    suspiciousWords,
    scamCategory: aiAnalysis.category,
    language: 'en',
  };
};

// Text/Email analysis
const analyzeText = async (text: string, scanType: string): Promise<AnalysisResult> => {
  const language = detectLanguage(text);
  const keywordAnalysis = analyzeKeywords(text, language);
  
  const aiAnalysis = await analyzeWithAI_Provider(text, scanType, language);
  
  const embedding = await generateEmbedding(text);

  let finalScore = keywordAnalysis.score;
  if (aiAnalysis.status === 'scam') {
    finalScore += 50;
  } else if (aiAnalysis.status === 'warning') {
    finalScore += 25;
  }

  let status: 'scam' | 'warning' | 'safe';
  let confidence: number;

  if (finalScore >= 50 || aiAnalysis.status === 'scam') {
    status = 'scam';
    confidence = Math.min(95, aiAnalysis.confidence);
  } else if (finalScore >= 25 || aiAnalysis.status === 'warning') {
    status = 'warning';
    confidence = Math.min(85, aiAnalysis.confidence - 10);
  } else {
    status = 'safe';
    confidence = Math.max(70, aiAnalysis.confidence);
  }

  return {
    status,
    confidence: Math.round(confidence),
    explanation: aiAnalysis.explanation,
    detailedReasoning: aiAnalysis.reasoning,
    suspiciousWords: keywordAnalysis.words,
    scamCategory: aiAnalysis.category,
    language,
    embedding,
  };
};

// Main analysis function
export const analyzeWithAI = async (
  scanType: 'text' | 'url' | 'email',
  input: string
): Promise<AnalysisResult> => {
  if (scanType === 'url') {
    return analyzeURL(input);
  } else {
    return analyzeText(input, scanType);
  }
};

// Chat service with multiple providers
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const chatWithAIService = async (
  messages: ChatMessage[],
  language: string = 'en',
  onChunk: (chunk: any) => void
) => {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are ScamShield AI, an expert assistant helping users identify and protect against scams. Be helpful, clear, and concise. Respond in ${language === 'hi' ? 'Hindi' : language === 'es' ? 'Spanish' : 'English'} if requested.`,
  };

  try {
    // Try providers in order
    if (groq) {
      const stream = await groq.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk({ choices: [{ delta: { content } }] });
        }
      }
      return;
    }

    if (openai) {
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk({ choices: [{ delta: { content } }] });
        }
      }
      return;
    }

    // Fallback response
    const fallbackMessage = language === 'hi' 
      ? 'मैं आपकी मदद के लिए यहाँ हूँ। कृपया कोई संदिग्ध संदेश या लिंक साझा करें।'
      : 'I can help you identify scams. Please share any suspicious messages or links you want me to analyze.';
    
    onChunk({ choices: [{ delta: { content: fallbackMessage } }] });
  } catch (error) {
    console.error('Chat service error:', error);
    onChunk({ choices: [{ delta: { content: 'Chat service temporarily unavailable.' } }] });
  }
};

// Translate text
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    if (groq) {
      const completion = await groq.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: `Translate to ${targetLanguage}. Only output the translation.` },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });
      return completion.choices[0].message.content || text;
    }

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Translate to ${targetLanguage}` },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });
      return completion.choices[0].message.content || text;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};
