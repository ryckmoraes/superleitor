
/**
 * Formats a byte size into a human-readable string
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats seconds into a human-readable time remaining string in Portuguese
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${Math.ceil(seconds)} segundos`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} minutos`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours} hora${hours > 1 ? 's' : ''} e ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
}

/**
 * Calculates earned app time based on recording duration
 */
export function calculateEarnedTime(recordingSeconds: number): number {
  // Histórias muito curtas não ganham tempo
  if (recordingSeconds < 3) return 0;
  
  // Nova fórmula: para cada 10 segundos, concede 3 minutos de tempo
  // Tempo mínimo é 3 minutos para histórias válidas
  const baseMinutes = 3;
  const bonusMinutes = Math.floor(recordingSeconds / 10) * 3;
  
  return Math.max(baseMinutes, bonusMinutes);
}
