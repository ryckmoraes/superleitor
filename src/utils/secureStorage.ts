
import { logger } from './logger';

/**
 * Secure storage utility for sensitive data
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Initialize encryption key
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // Generate or retrieve encryption key
    const keyData = localStorage.getItem('enc_key');
    if (keyData) {
      try {
        const keyBytes = new Uint8Array(atob(keyData).split('').map(c => c.charCodeAt(0)));
        this.encryptionKey = await crypto.subtle.importKey(
          'raw',
          keyBytes,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        return this.encryptionKey;
      } catch (error) {
        logger.warn('Failed to load encryption key, generating new one');
      }
    }

    // Generate new key
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Store key (in production, this should be handled more securely)
    const keyBytes = await crypto.subtle.exportKey('raw', this.encryptionKey);
    const keyString = btoa(String.fromCharCode(...new Uint8Array(keyBytes)));
    localStorage.setItem('enc_key', keyString);

    return this.encryptionKey;
  }

  // Encrypt and store sensitive data
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      const encryptionKey = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        data
      );

      const encryptedArray = new Uint8Array(encryptedData);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);

      const encodedData = btoa(String.fromCharCode(...combined));
      localStorage.setItem(`secure_${key}`, encodedData);
    } catch (error) {
      logger.error('Failed to encrypt data', { key, error });
      throw new Error('Encryption failed');
    }
  }

  // Decrypt and retrieve sensitive data
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const encryptedData = localStorage.getItem(`secure_${key}`);
      if (!encryptedData) {
        return null;
      }

      const encryptionKey = await this.getEncryptionKey();
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(c => c.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      logger.error('Failed to decrypt data', { key, error });
      return null;
    }
  }

  // Remove secure item
  removeSecureItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  // Clear all secure data
  clearSecureData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

export const secureStorage = SecureStorage.getInstance();
