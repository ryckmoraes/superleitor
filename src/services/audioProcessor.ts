import { showToastOnly } from './notificationService';
import { voskModelsService } from './voskModelsService';
// --- NEW: Import Language Context ---
import { useLanguage } from '@/contexts/LanguageContext';
// ... keep existing code ...

/**
 * Retorna uma saudação localizada baseada no idioma atual do modelo VOSK
 */
export const getLocalizedGreeting = (): string => {
  const currentLang = voskModelsService.getCurrentLanguage();
  
  switch (currentLang) {
    case 'en-US':
      return "Hello! Tell me a story to unlock SuperReader.";
    case 'es-ES':
      return "¡Hola! Cuéntame una historia para desbloquear SuperReader.";
    case 'fr-FR':
      return "Bonjour! Raconte-moi une histoire pour débloquer SuperReader.";
    case 'de-DE':
      return "Hallo! Erzähl mir eine Geschichte, um SuperReader freizuschalten.";
    case 'it-IT':
      return "Ciao! Raccontami una storia per sbloccare SuperReader.";
    case 'ru-RU':
      return "Привет! Расскажи мне историю, чтобы разблокировать SuperReader.";
    case 'zh-CN':
      return "你好！给我讲个故事来解锁超级阅读器。";
    case 'ja-JP':
      return "こんにちは！SuperReaderのロックを解除するために物語を聞かせてください。";
    case 'pt-BR':
    default:
      return "Olá! Conte-me uma história para desbloquear o SuperLeitor.";
  }
};

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
 * agora levando em conta o idioma selecionado no modelo VOSK via context.
 */
export function speakNaturally(
  text: string, 
  priority: boolean = false,
  lang?: string // Novo opcional
) {
  if (!text) return;

  // Prefer context language if in React component context
  let currentLang = lang;
  try {
    // This works only inside a React component/hook!
    const { language } = useLanguage();
    currentLang = lang || language;
  } catch {
    // fallback:
    currentLang = lang || voskModelsService.getCurrentLanguage();
  }

  console.log(`[speakNaturally] Falando em ${currentLang}:`, text);

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
      console.log(`[speakNaturally] Usando voz: ${match.name} (${match.lang})`);
    } else {
      console.log(`[speakNaturally] Nenhuma voz encontrada para ${currentLang}, usando padrão`);
    }
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Reproduz um feedback sonoro simples.
 */
export const playFeedbackSound = (): void => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
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
