import Groq from 'groq-sdk';

// Lazy initialization — only creates client when first used
let _groqClient: Groq | null = null;

export const groqClient = (): Groq => {
  if (!_groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing from environment variables');
    }
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
};

export const testGroqConnection = async (): Promise<void> => {
  try {
    await groqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5,
    });
    console.log('Groq connected successfully');
  } catch (error) {
    console.error('Groq connection error:', error);
  }
};
