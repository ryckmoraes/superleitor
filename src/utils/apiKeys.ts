
// This is a utility to handle API keys in a more secure way
// Note: For a production application, API keys should ideally be handled server-side

// Store keys in memory only (not in localStorage for better security)
let apiKeys: Record<string, string> = {};

// Simple encryption function (basic obfuscation)
const obfuscate = (str: string): string => {
  return btoa(str.split('').reverse().join('')).replace(/=/g, '');
};

// Simple decryption function
const deobfuscate = (str: string): string => {
  return atob(str + '=='.substring(0, (4 - str.length % 4) % 4))
    .split('').reverse().join('');
};

// Initialize with default keys (obfuscated)
// This is just basic obfuscation, not true security

export const getApiKey = (service: string): string => {
  if (!apiKeys[service]) {
    throw new Error(`API key for ${service} not found`);
  }
  return deobfuscate(apiKeys[service]);
};

export const setApiKey = (service: string, key: string): void => {
  apiKeys[service] = obfuscate(key);
};
