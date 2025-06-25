
import { getNavigatorLanguage } from "@/utils/getNavigatorLanguage";

interface Translation {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

const translations = {
  appTitle: {
    pt: "Super Leitor",
    en: "Super Reader",
    es: "Super Lector",
  },
  welcomeSplash: {
    heading: {
      pt: "Bem-vindo ao",
      en: "Welcome to",
      es: "Bienvenido a",
    },
    appName: {
      pt: "Super Leitor",
      en: "Super Reader",
      es: "Super Lector",
    },
    description: {
      pt: "Um aplicativo para ajudar você a praticar a leitura através de histórias.",
      en: "An application to help you practice reading through stories.",
      es: "Una aplicación para ayudarte a practicar la lectura a través de historias.",
    },
    configure: {
      pt: "Configurar",
      en: "Configure",
      es: "Configurar",
    },
    startReading: {
      pt: "Começar a Ler",
      en: "Start Reading",
      es: "Empezar a Leer",
    },
    greetingWithName: {
      pt: "Olá, {name}! Pronto para uma nova aventura?",
      en: "Hello, {name}! Ready for a new adventure?",
      es: "¡Hola, {name}! ¿Listo para una nueva aventura?",
    },
    readerPlaceholder: {
      pt: "Super Leitor",
      en: "Super Reader",
      es: "Super Lector",
    },
  },
  loadingScreen: {
    loading: {
      pt: "Carregando...",
      en: "Loading...",
      es: "Cargando...",
    },
  },
  diagnosticPage: {
    title: {
      pt: "Diagnóstico",
      en: "Diagnostic",
      es: "Diagnóstico",
    },
    description: {
      pt: "Verifique se tudo está funcionando corretamente.",
      en: "Check if everything is working correctly.",
      es: "Verifique si todo está funcionando correctamente.",
    },
    microphoneAccess: {
      pt: "Acesso ao Microfone",
      en: "Microphone Access",
      es: "Acceso al Micrófono",
    },
    microphoneStatus: {
      pt: "Status do Microfone",
      en: "Microphone Status",
      es: "Estado del Micrófono",
    },
    checkMicrophone: {
      pt: "Verificar Microfone",
      en: "Check Microphone",
      es: "Verificar Micrófono",
    },
    microphoneWorking: {
      pt: "Microfone está funcionando!",
      en: "Microphone is working!",
      es: "¡El micrófono está funcionando!",
    },
    noMicrophoneDetected: {
      pt: "Nenhum microfone detectado.",
      en: "No microphone detected.",
      es: "No se detectó ningún micrófono.",
    },
    speechRecognition: {
      pt: "Reconhecimento de Voz",
      en: "Speech Recognition",
      es: "Reconocimiento de Voz",
    },
    speechRecognitionStatus: {
      pt: "Status do Reconhecimento de Voz",
      en: "Speech Recognition Status",
      es: "Estado del Reconocimiento de Voz",
    },
    startRecognition: {
      pt: "Iniciar Reconhecimento",
      en: "Start Recognition",
      es: "Iniciar Reconocimiento",
    },
    recognitionWorking: {
      pt: "Reconhecimento de voz está funcionando!",
      en: "Speech recognition is working!",
      es: "¡El reconocimiento de voz está funcionando!",
    },
    recognitionNotWorking: {
      pt: "Reconhecimento de voz não está funcionando.",
      en: "Speech recognition is not working.",
      es: "El reconocimiento de voz no está funcionando.",
    },
    audioPlayback: {
      pt: "Reprodução de Áudio",
      en: "Audio Playback",
      es: "Reproducción de Audio",
    },
    playbackStatus: {
      pt: "Status da Reprodução de Áudio",
      en: "Audio Playback Status",
      es: "Estado de la Reproducción de Audio",
    },
    startPlayback: {
      pt: "Iniciar Reprodução",
      en: "Start Playback",
      es: "Iniciar Reproducción",
    },
    playbackWorking: {
      pt: "Reprodução de áudio está funcionando!",
      en: "Audio playback is working!",
      es: "¡La reproducción de audio está funcionando!",
    },
    playbackNotWorking: {
      pt: "Reprodução de áudio não está funcionando.",
      en: "Audio playback is not working.",
      es: "La reproducción de audio no está funcionando.",
    },
    allGood: {
      pt: "Tudo parece estar funcionando corretamente!",
      en: "Everything seems to be working correctly!",
      es: "¡Todo parece estar funcionando correctamente!",
    },
    somethingIsWrong: {
      pt: "Algo não está funcionando corretamente.",
      en: "Something is not working correctly.",
      es: "Algo no está funcionando correctamente.",
    },
    tryAgain: {
      pt: "Tente novamente mais tarde.",
      en: "Try again later.",
      es: "Inténtalo de nuevo más tarde.",
    },
  },
  splashScreen: {
    title: {
      pt: "Configuração Inicial",
      en: "Initial Setup",
      es: "Configuración Inicial",
    },
    description: {
      pt: "Estamos preparando tudo para você.",
      en: "We are preparing everything for you.",
      es: "Estamos preparando todo para ti.",
    },
    loadingModel: {
      pt: "Carregando modelo de reconhecimento de voz...",
      en: "Loading speech recognition model...",
      es: "Cargando modelo de reconocimiento de voz...",
    },
    initializing: {
      pt: "Inicializando...",
      en: "Initializing...",
      es: "Inicializando...",
    },
    done: {
      pt: "Tudo pronto!",
      en: "All set!",
      es: "¡Todo listo!",
    },
    continue: {
      pt: "Continuar",
      en: "Continue",
      es: "Continuar",
    },
  },
  index: {
    title: {
      pt: "Bem-vindo ao Super Leitor!",
      en: "Welcome to Super Reader!",
      es: "¡Bienvenido a Super Lector!",
    },
    description: {
      pt: "Um aplicativo para ajudar você a praticar a leitura e a escrita.",
      en: "An application to help you practice reading and writing.",
      es: "Una aplicación para ayudarte a practicar la lectura y la escritura.",
    },
    start: {
      pt: "Começar",
      en: "Start",
      es: "Empezar",
    },
    diagnostic: {
      pt: "Diagnóstico",
      en: "Diagnostic",
      es: "Diagnóstico",
    },
  },
  recordScreen: {
    appUnlocked: {
      pt: "App Desbloqueado!",
      en: "App Unlocked!",
      es: "¡App Desbloqueada!",
    },
    remainingTime: {
      pt: "Tempo restante: {time} minutos",
      en: "Remaining time: {time} minutes",
      es: "Tiempo restante: {time} minutos",
    },
    remainingTimeLabel: {
      pt: "Tempo restante",
      en: "Remaining time",
      es: "Tiempo restante",
    },
    earnedTime: {
      pt: "Você ganhou {time} minutos de uso!",
      en: "You earned {time} minutes of use!",
      es: "¡Ganaste {time} minutos de uso!",
    },
    error: {
      pt: "Erro!",
      en: "Error!",
      es: "¡Error!",
    },
    voskInitError: {
      pt: "Erro ao inicializar o VOSK: {error}",
      en: "Error initializing VOSK: {error}",
      es: "Error al inicializar VOSK: {error}",
    },
    tellMore: {
      pt: "Conte mais...",
      en: "Tell me more...",
      es: "Cuéntame más...",
    },
  },
  recordingScreen: {
    appUnlocked: {
      pt: "App Desbloqueado!",
      en: "App Unlocked!",
      es: "¡App Desbloqueada!",
    },
    remainingTime: {
      pt: "Tempo restante: {time} minutos",
      en: "Remaining time: {time} minutes",
      es: "Tiempo restante: {time} minutos",
    },
    remainingTimeLabel: {
      pt: "Tempo restante",
      en: "Remaining time",
      es: "Tiempo restante",
    },
    earnedTime: {
      pt: "Você ganhou {time} minutos de uso!",
      en: "You earned {time} minutes of use!",
      es: "¡Ganaste {time} minutos de uso!",
    },
    error: {
      pt: "Erro!",
      en: "Error!",
      es: "¡Error!",
    },
    voskInitError: {
      pt: "Erro ao inicializar o VOSK: {error}",
      en: "Error initializing VOSK: {error}",
      es: "Error al inicializar VOSK: {error}",
    },
    tellMore: {
      pt: "Conte mais...",
      en: "Tell me more...",
      es: "Cuéntame más...",
    },
  },
  recognitionStatus: {
    waiting: {
      pt: "Aguardando áudio...",
      en: "Waiting for audio...",
      es: "Esperando audio...",
    },
    listening: {
      pt: "Ouvindo...",
      en: "Listening...",
      es: "Escuchando...",
    },
    analyzing: {
      pt: "Analisando...",
      en: "Analyzing...",
      es: "Analizando...",
    },
    processing: {
      pt: "Processando resultado final...",
      en: "Processing final result...",
      es: "Procesando resultado final...",
    },
    ready: {
      pt: "Pronto.",
      en: "Ready.",
      es: "Listo.",
    },
    error: {
      pt: "Erro: {error}",
      en: "Error: {error}",
      es: "Error: {error}",
    },
  },
  greetings: {
    welcome: {
      pt: "Olá! Seja bem-vindo ao Super Leitor!",
      en: "Hello! Welcome to Super Reader!",
      es: "¡Hola! ¡Bienvenido a Super Lector!",
    },
    locked: {
      pt: "Olá! Para continuar usando o app, conte uma história!",
      en: "Hello! To continue using the app, tell a story!",
      es: "¡Hola! Para seguir usando la app, cuenta una historia!",
    },
    unlocked: {
      pt: "Olá novamente! Que bom que você voltou!",
      en: "Hello again! Glad you're back!",
      es: "¡Hola de nuevo! ¡Qué bueno que volviste!",
    },
  },
  analysis: {
    result: {
      pt: "Análise: {summary}. Precisão: {accuracy}%. Padrão: {pattern}.",
      en: "Analysis: {summary}. Accuracy: {accuracy}%. Pattern: {pattern}.",
      es: "Análisis: {summary}. Precisión: {accuracy}%. Patrón: {pattern}.",
    },
  },
  recordingManager: {
    storyModeActive: {
      pt: "Modo história ativado!",
      en: "Story mode activated!",
      es: "¡Modo historia activado!",
    },
    storyModeActiveDescription: {
      pt: "Comece a contar sua história.",
      en: "Start telling your story.",
      es: "Empieza a contar tu historia.",
    },
    listening: {
      pt: "Estou ouvindo...",
      en: "I'm listening...",
      es: "Estoy escuchando...",
    },
    storyReceived: {
      pt: "História recebida!",
      en: "Story received!",
      es: "¡Historia recibida!",
    },
    recordingFinished: {
      pt: "Gravação finalizada em {time} segundos.",
      en: "Recording finished in {time} seconds.",
      es: "Grabación finalizada en {time} segundos.",
    },
    analyzingStory: {
      pt: "Analisando sua história...",
      en: "Analyzing your story...",
      es: "Analizando tu historia...",
    },
    noStoryDetected: {
      pt: "Nenhuma história detectada!",
      en: "No story detected!",
      es: "¡No se detectó ninguna historia!",
    },
    noStoryDetectedDescription: {
      pt: "Tente contar uma história mais longa.",
      en: "Try telling a longer story.",
      es: "Intenta contar una historia más larga.",
    },
    tryAgain: {
      pt: "Tente novamente...",
      en: "Try again...",
      es: "Intenta nuevamente...",
    },
  },
  recordingControls: {
    storyMode: {
      pt: "Modo História",
      en: "Story Mode",
      es: "Modo Historia",
    },
    appName: {
      pt: "SuperLeitor",
      en: "SuperReader",
      es: "SuperLector",
    },
    recordingTime: {
      pt: "Tempo de gravação: {time} segundos",
      en: "Recording time: {time} seconds",
      es: "Tiempo de grabación: {time} segundos",
    },
    stopStory: {
      pt: "Parar História",
      en: "Stop Story",
      es: "Parar Historia",
    },
    startStory: {
      pt: "Iniciar História",
      en: "Start Story",
      es: "Iniciar Historia",
    },
  },
  speechInitializer: {
    title: {
      pt: "Reconhecimento Ativo",
      en: "Recognition Active",
      es: "Reconocimiento Activo",
    },
    ready: {
      pt: "Reconhecimento de voz pronto para {languageName}",
      en: "Speech recognition ready for {languageName}",
      es: "Reconocimiento de voz listo para {languageName}",
    },
    info: {
      pt: "Informação",
      en: "Information",
      es: "Información",
    },
    offlineNotAvailable: {
      pt: "Reconhecimento offline não disponível no momento",
      en: "Offline recognition not available at the moment",
      es: "Reconocimiento offline no disponible en este momento",
    },
  },
  languageSelector: {
    languageSaved: {
      pt: "Idioma Salvo",
      en: "Language Saved",
      es: "Idioma Guardado",
    },
    languageChanged: {
      pt: "Idioma alterado para {name}",
      en: "Language changed to {name}",
      es: "Idioma cambiado a {name}",
    },
    languageChangeError: {
      pt: "Erro ao Alterar Idioma",
      en: "Error Changing Language",
      es: "Error al Cambiar Idioma",
    },
    languageChangeErrorDescription: {
      pt: "Não foi possível alterar o idioma. Tente novamente.",
      en: "Could not change language. Please try again.",
      es: "No se pudo cambiar el idioma. Inténtelo de nuevo.",
    },
    downloadInProgress: {
      pt: "Download em Andamento",
      en: "Download in Progress",
      es: "Descarga en Progreso",
    },
    downloadInProgressDescriptionToast: {
      pt: "Aguarde o download atual terminar",
      en: "Wait for current download to finish",
      es: "Espera a que termine la descarga actual",
    },
    downloadingModelToastDescription: {
      pt: "Baixando modelo para {name}. Tamanho: {size}",
      en: "Downloading model for {name}. Size: {size}",
      es: "Descargando modelo para {name}. Tamaño: {size}",
    },
    startingDownload: {
      pt: "Iniciando download...",
      en: "Starting download...",
      es: "Iniciando descarga...",
    },
    calculating: {
      pt: "calculando...",
      en: "calculating...",
      es: "calculando...",
    },
    downloadingModel: {
      pt: "Baixando arquivos...",
      en: "Downloading files...",
      es: "Descargando archivos...",
    },
    finishingDownload: {
      pt: "Finalizando...",
      en: "Finishing...",
      es: "Finalizando...",
    },
    installing: {
      pt: "Instalando modelo...",
      en: "Installing model...",
      es: "Instalando modelo...",
    },
    errorDownloading: {
      pt: "Erro no Download",
      en: "Download Error",
      es: "Error de Descarga",
    },
    errorDownloadingDescription: {
      pt: "Não foi possível baixar o modelo. Verifique sua conexão.",
      en: "Could not download model. Check your connection.",
      es: "No se pudo descargar el modelo. Verifica tu conexión.",
    },
    canceling: {
      pt: "Cancelando...",
      en: "Canceling...",
      es: "Cancelando...",
    },
    downloadCanceled: {
      pt: "Download Cancelado",
      en: "Download Canceled",
      es: "Descarga Cancelada",
    },
    downloadCanceledDescription: {
      pt: "O download foi cancelado com sucesso",
      en: "Download was canceled successfully",
      es: "La descarga fue cancelada exitosamente",
    },
    operationInProgressTitle: {
      pt: "Operação em Andamento",
      en: "Operation in Progress",
      es: "Operación en Progreso",
    },
    operationInProgressDescription: {
      pt: "Aguarde a operação atual terminar",
      en: "Wait for current operation to finish",
      es: "Espera a que termine la operación actual",
    },
    cancelDownloadPrompt: {
      pt: "Cancele o download primeiro para fechar",
      en: "Cancel download first to close",
      es: "Cancela la descarga primero para cerrar",
    },
  },
  hamburguerMenu: {
    options: {
      pt: "Opções",
      en: "Options",
      es: "Opciones",
    },
    theme: {
      pt: "Tema",
      en: "Theme",
      es: "Tema",
    },
    light: {
      pt: "Claro",
      en: "Light",
      es: "Claro",
    },
    dark: {
      pt: "Escuro",
      en: "Dark",
      es: "Oscuro",
    },
    language: {
      pt: "Idioma",
      en: "Language",
      es: "Idioma",
    },
    portuguese: {
      pt: "Português",
      en: "Portuguese",
      es: "Portugués",
    },
    english: {
      pt: "Inglês",
      en: "English",
      es: "Inglés",
    },
    spanish: {
      pt: "Espanhol",
      en: "Español",
      es: "Español",
    },
    diagnostic: {
      pt: "Diagnóstico",
      en: "Diagnostic",
      es: "Diagnóstico",
    },
    resetApp: {
      pt: "Resetar App",
      en: "Reset App",
      es: "Resetear App",
    },
    resetAppConfirmation: {
      pt: "Tem certeza que deseja resetar o app? Isso irá apagar todos os dados.",
      en: "Are you sure you want to reset the app? This will erase all data.",
      es: "¿Estás seguro de que quieres resetear la app? Esto borrará todos los datos.",
    },
    reset: {
      pt: "Resetar",
      en: "Reset",
      es: "Resetear",
    },
    cancel: {
      pt: "Cancelar",
      en: "Cancel",
      es: "Cancelar",
    },
    password: {
      pt: "Senha",
      en: "Password",
      es: "Contraseña",
    },
    createPassword: {
      pt: "Criar Senha",
      en: "Create Password",
      es: "Crear Contraseña",
    },
    changePassword: {
      pt: "Alterar Senha",
      en: "Change Password",
      es: "Cambiar Contraseña",
    },
    removePassword: {
      pt: "Remover Senha",
      en: "Remove Password",
      es: "Remover Contraseña",
    },
    removePasswordConfirmation: {
      pt: "Tem certeza que deseja remover a senha? O acesso às opções ficará livre.",
      en: "Are you sure you want to remove the password? Access to options will be free.",
      es: "¿Estás seguro de que quieres remover la contraseña? El acceso a las opciones será libre.",
    },
    remove: {
      pt: "Remover",
      en: "Remove",
      es: "Remover",
    },
  },
  passwordDialog: {
    verifyPassword: {
      pt: "Verificar Senha",
      en: "Verify Password",
      es: "Verificar Contraseña",
    },
    createPassword: {
      pt: "Criar Senha",
      en: "Create Password",
      es: "Crear Contraseña",
    },
    changePassword: {
      pt: "Alterar Senha",
      en: "Change Password",
      es: "Cambiar Contraseña",
    },
    enterPassword: {
      pt: "Digite sua senha para continuar.",
      en: "Enter your password to continue.",
      es: "Ingrese su contraseña para continuar.",
    },
    createPasswordDescription: {
      pt: "Crie uma senha para proteger o acesso às configurações.",
      en: "Create a password to protect access to settings.",
      es: "Cree una contraseña para proteger el acceso a la configuración.",
    },
    changePasswordDescription: {
      pt: "Altere sua senha atual.",
      en: "Change your current password.",
      es: "Cambie su contraseña actual.",
    },
    currentPassword: {
      pt: "Senha Atual",
      en: "Current Password",
      es: "Contraseña Actual",
    },
    newPassword: {
      pt: "Nova Senha",
      en: "New Password",
      es: "Nueva Contraseña",
    },
    confirmPassword: {
      pt: "Confirmar Senha",
      en: "Confirm Password",
      es: "Confirmar Contraseña",
    },
    enterYourPassword: {
      pt: "Digite sua senha",
      en: "Enter your password",
      es: "Ingrese su contraseña",
    },
    enterNewPassword: {
      pt: "Digite a nova senha",
      en: "Enter the new password",
      es: "Ingrese la nueva contraseña",
    },
    confirmNewPassword: {
      pt: "Confirme a nova senha",
      en: "Confirm the new password",
      es: "Confirme la nueva contraseña",
    },
    cancel: {
      pt: "Cancelar",
      en: "Cancel",
      es: "Cancelar",
    },
    confirm: {
      pt: "Confirmar",
      en: "Confirm",
      es: "Confirmar",
    },
    incorrectPassword: {
      pt: "Senha incorreta",
      en: "Incorrect password",
      es: "Contraseña incorrecta",
    },
    passwordsDoNotMatch: {
      pt: "As senhas não coincidem",
      en: "Passwords do not match",
      es: "Las contraseñas no coinciden",
    },
    passwordMustBeLonger: {
      pt: "A senha deve ter pelo menos 4 caracteres",
      en: "Password must be at least 4 characters",
      es: "La contraseña debe tener al menos 4 caracteres",
    },
  },
  appLock: {
    exitBlocked: {
      pt: "Saída Bloqueada",
      en: "Exit Blocked",
      es: "Salida Bloqueada"
    },
    needStoryOrPassword: {
      pt: "Conte uma história ou use a senha para sair",
      en: "Tell a story or use password to exit", 
      es: "Cuenta una historia o usa la contraseña para salir"
    },
    cantExitMessage: {
      pt: "Você precisa contar uma história para sair do aplicativo",
      en: "You need to tell a story to exit the app",
      es: "Necesitas contar una historia para salir de la aplicación"
    },
    confirmExit: {
      pt: "Tem certeza que deseja sair? Você precisa contar uma história primeiro.",
      en: "Are you sure you want to exit? You need to tell a story first.",
      es: "¿Estás seguro de que quieres salir? Necesitas contar una historia primero."
    },
    appMinimized: {
      pt: "App Minimizado",
      en: "App Minimized", 
      es: "App Minimizada"
    },
    returnToApp: {
      pt: "Retorne ao app para continuar",
      en: "Return to app to continue",
      es: "Regresa a la app para continuar"
    }
  },
  menu: {
    title: {
      pt: "Opções",
      en: "Options",
      es: "Opciones",
    },
    openMenu: {
      pt: "Abrir menu",
      en: "Open menu",
      es: "Abrir menú",
    },
    closeMenu: {
      pt: "Fechar menu",
      en: "Close menu",
      es: "Cerrar menú",
    },
    settings: {
      pt: "Configurações",
      en: "Settings",
      es: "Configuraciones",
    },
    languages: {
      pt: "Idiomas",
      en: "Languages",
      es: "Idiomas",
    },
    resetOnboarding: {
      pt: "Resetar Tutorial",
      en: "Reset Tutorial",
      es: "Resetear Tutorial",
    },
    exitApp: {
      pt: "Sair do App",
      en: "Exit App",
      es: "Salir de la App",
    },
    accessSettings: {
      pt: "Acessar Configurações",
      en: "Access Settings",
      es: "Acceder a Configuraciones",
    },
    accessLanguages: {
      pt: "Acessar Idiomas",
      en: "Access Languages",
      es: "Acceder a Idiomas",
    },
    exitTitle: {
      pt: "Saindo...",
      en: "Exiting...",
      es: "Saliendo...",
    },
    exitDescription: {
      pt: "Voltando à tela inicial",
      en: "Returning to home screen",
      es: "Volviendo a la pantalla inicial",
    },
    exitErrorTitle: {
      pt: "Erro ao sair",
      en: "Error exiting",
      es: "Error al salir",
    },
    exitErrorDescription: {
      pt: "Tente novamente",
      en: "Please try again",
      es: "Inténtalo de nuevo",
    },
    logoutTitle: {
      pt: "Tutorial resetado",
      en: "Tutorial reset",
      es: "Tutorial reseteado",
    },
    logoutDescription: {
      pt: "Voltando ao início",
      en: "Returning to start",
      es: "Volviendo al inicio",
    },
  }
};

export const getTranslation = (
  language: string,
  key: string,
  values?: Record<string, string | number>,
  defaultValue?: string
): string => {
  const langCode = language.split('-')[0] as 'pt' | 'en' | 'es';
  
  // Navigate through the nested object using the key path
  const keyParts = key.split('.');
  let current: any = translations;
  
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Key not found, return default value or key
      console.warn(`Translation key not found: ${key}`);
      return defaultValue || key;
    }
  }
  
  // If we found the translation object, get the language-specific text
  if (current && typeof current === 'object' && langCode in current) {
    let text = current[langCode];
    
    // Replace placeholders if values are provided
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }
    
    return text;
  }
  
  // Fallback to default value or key
  console.warn(`Translation not found for language ${langCode} and key: ${key}`);
  return defaultValue || key;
};

export default translations;
