
// Speech recognition service using Web Speech API

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

class WebSpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private finalTranscript: string = '';
  private interimTranscript: string = '';

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
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError('Reconhecimento de fala não suportado neste dispositivo');
      return;
    }

    if (this.isListening) {
      this.stopRecognition();
    }

    // Reset transcripts
    this.finalTranscript = '';
    this.interimTranscript = '';

    // Setup event handlers
    this.recognition.onresult = (event) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          this.interimTranscript += event.results[i][0].transcript;
        }
      }
      
      onResult({
        transcript: this.finalTranscript + this.interimTranscript,
        isFinal: this.interimTranscript.length === 0
      });
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      onError(`Erro de reconhecimento: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    // Start recognition
    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Web Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError('Erro ao iniciar o reconhecimento de fala');
    }
  }

  public stopRecognition(): void {
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
