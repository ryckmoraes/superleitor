
import { logger } from './logger';

/**
 * Security utilities for password hashing and validation
 */

// Simple but secure password hashing using Web Crypto API
export const securityUtils = {
  // Hash password using PBKDF2
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    try {
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      
      // Generate salt if not provided
      const saltData = salt ? 
        encoder.encode(salt) : 
        crypto.getRandomValues(new Uint8Array(16));
      
      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive key using PBKDF2
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltData,
          iterations: 100000, // Recommended minimum
          hash: 'SHA-256'
        },
        keyMaterial,
        256 // 32 bytes
      );
      
      // Convert to base64 for storage
      const hashArray = new Uint8Array(derivedBits);
      const saltArray = new Uint8Array(saltData);
      
      const hash = btoa(String.fromCharCode(...hashArray));
      const saltStr = btoa(String.fromCharCode(...saltArray));
      
      return { hash, salt: saltStr };
    } catch (error) {
      logger.error('Error hashing password', error);
      throw new Error('Password hashing failed');
    }
  },

  // Verify password against hash
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const { hash: newHash } = await this.hashPassword(password, atob(salt));
      return newHash === hash;
    } catch (error) {
      logger.error('Error verifying password', error);
      return false;
    }
  },

  // Validate password strength
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize user input to prevent XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[+/]/g, '')
      .substring(0, length);
  }
};
