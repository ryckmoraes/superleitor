import { showToastOnly } from './notificationService';
import { voskModelsService } from './voskModelsService';

/**
 * Inicializa as vozes para a síntese de fala do navegador.
 * @returns {Promise<boolean>} - Retorna true se as vozes foram inicializadas com sucesso, false caso contrário.
 */
export const initVoices = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length) {
      console.log("Vozes já carregadas:", voices);
      resolve(true);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        console.log("Vozes carregadas após o evento:", voices);
        resolve(true);
      } else {
        console.warn("Nenhuma voz disponível após o evento onvoiceschanged.");
        resolve(false);
      }
    };

    // Timeout de segurança caso as vozes não carreguem
    setTimeout(() => {
      if (!voices.length) {
        console.warn("Timeout: Nenhuma voz carregada.");
        resolve(false);
      }
    }, 5000);
  });
};

/**
 * Função para sintetizar fala usando SpeechSynthesis do navegador,
 * agora levando em conta o idioma selecionado no modelo VOSK.
 */
export function speakNaturally(
  text: string, 
  priority: boolean = false,
  lang?: string // Novo opcional
) {
  if (!text) return;

  // Se fornecido, usa o idioma; senão, pega do modelo atual:
  const currentLang = lang || voskModelsService.getCurrentLanguage();

  if ('speechSynthesis' in window) {
    if (priority && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang;
    utterance.rate = 1.0;

    // Busca uma voz apropriada para o idioma selecionado
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(voice => voice.lang.includes(currentLang));
    if (match) {
      utterance.voice = match;
    }
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Reproduz um feedback sonoro simples.
 */
export const playFeedbackSound = (): void => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Tom de 440Hz
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume baixo

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1); // Dura 0.1 segundos
};

/**
 * Tenta obter permissão para usar o microfone.
 * @returns {Promise<boolean>} - Retorna true se a permissão for concedida, false caso contrário.
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Permissão de microfone concedida.");
    stream.getTracks().forEach(track => track.stop()); // Encerra a stream imediatamente
    return true;
  } catch (error) {
    console.error("Permissão de microfone negada:", error);
    showToastOnly(
      "Erro de microfone",
      "Permissão de acesso ao microfone foi negada.",
      "destructive"
    );
    return false;
  }
};
