import { Readable } from 'stream';

// Note: Google Cloud Speech-to-Text and Text-to-Speech require proper credentials
// For production, set up Google Cloud project and credentials

/**
 * Speech-to-Text service
 * Converts audio to text for scam analysis
 */
export const speechToText = async (audioBuffer: Buffer, languageCode: string = 'en-US'): Promise<string> => {
  try {
    // Check if Google Cloud credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_API_KEY) {
      console.warn('Google Cloud credentials not configured, using mock response');
      return 'Voice transcription service not configured. Please set up Google Cloud credentials.';
    }

    // Dynamic import to avoid errors if @google-cloud/speech is not installed
    const speech = await import('@google-cloud/speech').catch(() => null);
    
    if (!speech) {
      throw new Error('Google Cloud Speech library not available');
    }

    const client = new speech.SpeechClient();

    const audio = {
      content: audioBuffer.toString('base64'),
    };

    const config = {
      encoding: 'LINEAR16' as const,
      sampleRateHertz: 16000,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join('\n') || '';

    return transcription;
  } catch (error) {
    console.error('Speech-to-text error:', error);
    throw new Error('Voice transcription failed. Please ensure audio format is correct.');
  }
};

/**
 * Text-to-Speech service
 * Converts analysis results to audio
 */
export const textToSpeech = async (
  text: string, 
  languageCode: string = 'en-US'
): Promise<Buffer> => {
  try {
    // Check if Google Cloud credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_API_KEY) {
      console.warn('Google Cloud credentials not configured');
      throw new Error('Text-to-speech service not configured');
    }

    // Dynamic import
    const tts = await import('@google-cloud/text-to-speech').catch(() => null);
    
    if (!tts) {
      throw new Error('Google Cloud Text-to-Speech library not available');
    }

    const client = new tts.TextToSpeechClient();

    // Select voice based on language
    let voiceName = 'en-US-Standard-A';
    if (languageCode.startsWith('hi')) {
      voiceName = 'hi-IN-Standard-A';
    } else if (languageCode.startsWith('es')) {
      voiceName = 'es-ES-Standard-A';
    }

    const request = {
      input: { text: text },
      voice: {
        languageCode: languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content generated');
    }

    return Buffer.from(response.audioContent as Uint8Array);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Voice synthesis failed');
  }
};

/**
 * Get supported languages for voice services
 */
export const getSupportedVoiceLanguages = (): Array<{ code: string; name: string }> => {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-US', name: 'Spanish (US)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
  ];
};
