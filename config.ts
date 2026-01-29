import dotenv from 'dotenv';

dotenv.config();

interface Config {
  openai: {
    apiKey: string;
    model: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  upload: {
    maxFileSize: number;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('OPENAI_MODEL', 'gpt-4-turbo-preview'),
  },
  server: {
    port: parseInt(getEnvVar('PORT', '3000'), 10),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  },
  upload: {
    maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880'), 10),
  },
};
