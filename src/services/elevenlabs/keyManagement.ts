
import { logger } from '@/utils/logger';
import { secureStorage } from '@/utils/secureStorage';

/**
 * Secure API Key management for ElevenLabs
 */
export const keyManagement = {
  // Get the API key from secure storage
  getApiKey: async (): Promise<string | null> => {
    try {
      return await secureStorage.getSecureItem('elevenlabs_api_key');
    } catch (error) {
      logger.error('Failed to retrieve ElevenLabs API key', error);
      return null;
    }
  },

  // Set the API key in secure storage
  setApiKey: async (apiKey: string): Promise<void> => {
    try {
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('Invalid API key');
      }

      // Validate API key format (basic check)
      if (!apiKey.startsWith('sk_')) {
        logger.warn('API key does not follow expected format');
      }

      await secureStorage.setSecureItem('elevenlabs_api_key', apiKey.trim());
      logger.info('ElevenLabs API key updated securely');
    } catch (error) {
      logger.error('Failed to store ElevenLabs API key', error);
      throw new Error('Failed to store API key securely');
    }
  },
  
  // Check if the API key exists
  hasApiKey: async (): Promise<boolean> => {
    try {
      const apiKey = await secureStorage.getSecureItem('elevenlabs_api_key');
      return !!apiKey && apiKey.length > 0;
    } catch (error) {
      logger.error('Failed to check API key existence', error);
      return false;
    }
  },
  
  // Clear the API key
  clearApiKey: (): void => {
    try {
      secureStorage.removeSecureItem('elevenlabs_api_key');
      // Also clear any old insecure storage
      sessionStorage.removeItem('elevenlabs_api_key');
      logger.info('ElevenLabs API key cleared');
    } catch (error) {
      logger.error('Failed to clear API key', error);
    }
  }
};
