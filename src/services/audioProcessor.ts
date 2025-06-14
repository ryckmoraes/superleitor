
import { voskModelsService } from "./voskModelsService";

let voices: SpeechSynthesisVoice[] = [];

/**
 * Initializes speech synthesis voices from the browser.
 */
export const initVoices = async (): Promise<void> => {
  if (voices.length > 0) {
    console.log("Vozes já carregadas:", voices);
    return;
  }
  
  const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        resolve(voiceList);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  };
  
  voices = await getVoices();
  console.log("Vozes do navegador carregadas:", voices);
};

/**
 * Gets a localized greeting message.
 * @param language - The language code (e.g., 'pt-BR').
 * @returns A localized greeting string.
 */
export const getLocalizedGreeting = (language: string): string => {
  const lang = language.split("-")[0];
  switch (lang) {
    case "pt":
      return "Olá! Conte-me uma história para desbloquear o SuperLeitor.";
    case "en":
      return "Hello! Tell me a story to unlock SuperReader.";
    case "es":
      return "¡Hola! Cuéntame una historia para desbloquear SuperLector.";
    case "fr":
      return "Bonjour! Racontez-moi une histoire pour déverrouiller SuperLecteur.";
    case "de":
      return "Hallo! Erzähl mir eine Geschichte, um SuperLeser freizuschalten.";
    default:
      return "Hello! Tell me a story to unlock the app.";
  }
};

/**
 * Speaks a given text using the browser's speech synthesis.
 * @param text The text to speak.
 * @param languageOrPriority The language code (e.g., 'pt-BR') or a boolean for high priority.
 * @param highPriority If the second argument is language, this is the priority.
 */
export const speakNaturally = (
  text: string,
  languageOrPriority: string | boolean,
  highPriority: boolean = false
) => {
  if (typeof window.speechSynthesis === "undefined") {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  let language: string;
  let priority: boolean;

  if (typeof languageOrPriority === 'string') {
    language = languageOrPriority;
    priority = highPriority;
  } else {
    // Legacy call support for read-only files
    const currentModel = voskModelsService.getCurrentModel();
    language = currentModel?.language || 'pt-BR';
    priority = languageOrPriority;
    console.log(`[speakNaturally] Language not provided, falling back to current model language: ${language}`);
  }

  // Find the voice for the selected language
  const voice = voices.find(
    (v) => v.lang === language || v.lang.startsWith(language.split("-")[0])
  );

  if (!voice) {
    console.warn(`[speakNaturally] Nenhuma voz encontrada para ${language}, usando padrão`);
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice || voices[0];
  utterance.lang = language;
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;

  if (priority) {
    window.speechSynthesis.cancel();
  }

  console.log(`[speakNaturally] Falando em ${language}: ${text}`);
  window.speechSynthesis.speak(utterance);
};
