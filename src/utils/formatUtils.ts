
/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Formats seconds to a human-readable time remaining string
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "calculando...";
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)} segundos`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} minutos`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};
