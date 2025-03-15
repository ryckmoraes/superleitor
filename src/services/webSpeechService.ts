
// Speech recognition service using Web Speech API

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

// Error handling for speech recognition
type RecognitionErrorCallback = (error: string, technical?: string) => void;

class WebSpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private finalTranscript: string = '';
  private interimTranscript: string = '';
  private restartTimeout: number | null = null;
  private maxRestarts: number = 3;
  private currentRestarts: number = 0;

  constructor() {
    // Check if browser supports speech recognition (safely for mobile)
    if (typeof window !== 'undefined') {
      // Initialize the SpeechRecognition object
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        try {
          this.recognition = new SpeechRecognitionAPI();
          
          // Configure recognition settings
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'pt-BR'; // Set language to Brazilian Portuguese
          this.recognition.maxAlternatives = 1;
        } catch (error) {
          console.error("Error initializing speech recognition:", error);
        }
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public startRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void,
    onError: RecognitionErrorCallback,
    onStart?: () => void
  ): void {
    if (!this.recognition) {
      onError('Reconhecimento de fala não suportado neste dispositivo', 'Speech recognition not available');
      return;
    }

    if (this.isListening) {
      this.stopRecognition();
    }

    // Reset transcripts
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.currentRestarts = 0;

    // Setup event handlers
    this.recognition.onresult = (event) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          this.interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Only call the callback if we have meaningful content
      if (this.finalTranscript || this.interimTranscript) {
        onResult({
          transcript: this.finalTranscript + this.interimTranscript,
          isFinal: this.interimTranscript.length === 0
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      
      let userFriendlyMessage = 'Houve um problema com o reconhecimento de voz.';
      
      // Provide user-friendly error messages
      switch (event.error) {
        case 'no-speech':
          userFriendlyMessage = 'Não consegui ouvir nada. Pode falar novamente?';
          break;
        case 'aborted':
          userFriendlyMessage = 'O reconhecimento de fala foi interrompido.';
          break;
        case 'audio-capture':
          userFriendlyMessage = 'Não consegui acessar o microfone. Verifique as permissões.';
          break;
        case 'network':
          userFriendlyMessage = 'Problema de conexão. Verifique sua internet.';
          break;
        case 'not-allowed':
          userFriendlyMessage = 'Permissão do microfone negada. Por favor, permita o acesso.';
          break;
        case 'service-not-allowed':
          userFriendlyMessage = 'O serviço de reconhecimento de fala não está disponível neste dispositivo.';
          break;
        default:
          userFriendlyMessage = `Problema com o reconhecimento de fala. Tente novamente.`;
      }
      
      onError(userFriendlyMessage, `Technical error: ${event.error}`);
      
      // Auto-restart on certain errors, but limit the number of restarts
      if (['no-speech', 'network', 'aborted'].includes(event.error) && this.currentRestarts < this.maxRestarts) {
        this.currentRestarts++;
        this.restartSpeechRecognition(onResult, onEnd, onError, onStart);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // Only call onEnd if we're not trying to restart
      if (this.restartTimeout === null) {
        onEnd();
      }
    };
    
    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    // Start recognition
    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Web Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError('Erro ao iniciar o reconhecimento de fala', error instanceof Error ? error.message : String(error));
    }
  }

  private restartSpeechRecognition(
    onResult: (result: SpeechRecognitionResult) => void,
    onEnd: () => void,
    onError: RecognitionErrorCallback,
    onStart?: () => void
  ): void {
    // Clear any existing timeout
    if (this.restartTimeout !== null) {
      window.clearTimeout(this.restartTimeout);
    }
    
    // Set a short delay before restarting
    this.restartTimeout = window.setTimeout(() => {
      try {
        if (this.recognition) {
          this.recognition.start();
          this.isListening = true;
          console.log('Web Speech recognition restarted');
          if (onStart) onStart();
        }
        this.restartTimeout = null;
      } catch (error) {
        console.error('Error restarting speech recognition:', error);
        this.restartTimeout = null;
        onEnd(); // Give up and signal end
      }
    }, 300);
  }

  public stopRecognition(): void {
    // Clear any restart timeout
    if (this.restartTimeout !== null) {
      window.clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log('Web Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  public getTranscript(): string {
    return this.finalTranscript;
  }
}

// Create singleton instance
const webSpeechService = new WebSpeechService();
export default webSpeechService;
