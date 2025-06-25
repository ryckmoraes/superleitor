
export const getNavigatorLanguage = (): string => {
  // Get the browser language
  const language = navigator.language || 'pt-BR';
  
  // Normalize to supported languages
  if (language.startsWith('en')) {
    return 'en-US';
  } else if (language.startsWith('es')) {
    return 'es-ES';
  } else {
    return 'pt-BR'; // Default to Portuguese
  }
};
