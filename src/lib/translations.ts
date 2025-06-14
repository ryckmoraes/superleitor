export const translations = {
  pt: {
    greetings: {
      locked: "Olá! Conte-me uma história para desbloquear o SuperLeitor.",
      unlocked: "Olá! Você pode continuar usando o app.",
    },
    recordingScreen: {
      appUnlocked: "App Desbloqueado",
      remainingTime: "Você ainda tem {time} minutos de uso.",
      canContinue: "Você pode continuar usando o app",
      error: "Erro",
      voskInitError: "Erro ao inicializar VOSK: {error}",
      earnedTime: "O app foi desbloqueado por {time} minutos!",
      tellMore: "Conte mais da sua história! Estou ouvindo...",
      remainingTimeLabel: "Tempo restante",
    },
    recordingManager: {
      analyzingStory: "Legal! Vou analisar sua história...",
      storyReceived: "História recebida!",
      recordingFinished: "Gravação finalizada após {time} segundos.",
      noStoryDetected: "Nenhuma história detectada",
      noStoryDetectedDescription: "Não consegui ouvir sua história. Tente novamente falando mais alto.",
      tryAgain: "Não consegui ouvir sua história. Vamos tentar novamente?",
      storyModeActive: "Modo História Ativado",
      storyModeActiveDescription: "Conte sua história para a Esfera Sonora!",
      listening: "Estou ouvindo! Pode contar sua história...",
    },
    languageSelector: {
      title: "Selecionar Idioma",
      save: "Salvar",
      selectedLanguageLabel: "Idioma Selecionado",
      selectPlaceholder: "Selecione um idioma",
      downloadRequired: "Este modelo precisa ser baixado para ser usado.",
      downloadNow: "Baixar agora",
      downloadInProgress: "Download em andamento",
      downloadingModel: "Baixando modelo de idioma...",
      speed: "Velocidade",
      estimatedTime: "Tempo estimado",
      downloadSource: "Baixando de alphacephei.com (servidor oficial VOSK)",
      cancelDownload: "Cancelar Download",
      availableModels: "Modelos Disponíveis",
      size: "Tamanho",
      active: "Ativo",
      select: "Selecionar",
      download: "Baixar",
      backToApp: "Voltar para o aplicativo",
      close: "Fechar",
      languageSaved: "Idioma salvo",
      languageChanged: "O idioma foi alterado para {name}",
      languageChangeError: "Erro ao mudar idioma",
      languageChangeErrorDescription: "Ocorreu um erro ao alterar o idioma.",
      downloading: "Baixando",
      errorDownloading: "Erro no download",
      errorDownloadingDescription: "Não foi possível baixar o modelo de idioma.",
      downloadCanceled: "Download cancelado",
      downloadCanceledDescription: "O download do modelo de idioma foi cancelado.",
      startingDownload: 'Iniciando download...',
      finishingDownload: 'Finalizando...',
      installing: 'Instalando modelo...',
      canceling: 'Cancelando...',
      calculating: 'calculando...',
      downloadInProgressDescriptionToast: "Aguarde o download atual terminar antes de iniciar outro.",
      operationInProgressTitle: "Operação em andamento",
      operationInProgressDescription: "Por favor, aguarde a conclusão da operação atual.",
      cancelDownloadPrompt: "Deseja cancelar o download antes de sair?",
    },
    recognitionStatus: {
      waiting: "Aguardando áudio...",
      listening: "Ouvindo...",
      analyzing: "Analisando...",
      processing: "Processando resultado final...",
      ready: "Pronto.",
      error: "Erro: {error}",
    },
    analysis: {
      result: "Análise concluída: {summary}. Precisão: {accuracy}%. Padrão: {pattern}.",
    },
    speechInitializer: {
      title: "Reconhecimento de fala",
      ready: "Pronto para ouvir em {languageName}",
      info: "Informação",
      offlineNotAvailable: "Reconhecimento offline não disponível. Usando alternativa online."
    }
  },
  en: {
    greetings: {
      locked: "Hello! Tell me a story to unlock SuperReader.",
      unlocked: "Hello! You can continue using the app.",
    },
    recordingScreen: {
      appUnlocked: "App Unlocked",
      remainingTime: "You have {time} minutes of usage remaining.",
      canContinue: "You can continue using the app",
      error: "Error",
      voskInitError: "Error initializing VOSK: {error}",
      earnedTime: "The app has been unlocked for {time} minutes!",
      tellMore: "Tell more of your story! I'm listening...",
      remainingTimeLabel: "Remaining time",
    },
    recordingManager: {
      analyzingStory: "Great! I will analyze your story...",
      storyReceived: "Story received!",
      recordingFinished: "Recording finished after {time} seconds.",
      noStoryDetected: "No story detected",
      noStoryDetectedDescription: "I couldn't hear your story. Try speaking louder.",
      tryAgain: "I couldn't hear your story. Shall we try again?",
      storyModeActive: "Story Mode Activated",
      storyModeActiveDescription: "Tell your story to the Sound Sphere!",
      listening: "I'm listening! You can tell your story...",
    },
    languageSelector: {
      title: "Select Language",
      save: "Save",
      selectedLanguageLabel: "Selected Language",
      selectPlaceholder: "Select a language",
      downloadRequired: "This model needs to be downloaded before use.",
      downloadNow: "Download now",
      downloadInProgress: "Download in progress",
      downloadingModel: "Downloading language model...",
      speed: "Speed",
      estimatedTime: "Estimated time",
      downloadSource: "Downloading from alphacephei.com (official VOSK server)",
      cancelDownload: "Cancel Download",
      availableModels: "Available Models",
      size: "Size",
      active: "Active",
      select: "Select",
      download: "Download",
      backToApp: "Back to the app",
      close: "Close",
      languageSaved: "Language saved",
      languageChanged: "Language has been changed to {name}",
      languageChangeError: "Error changing language",
      languageChangeErrorDescription: "An error occurred while changing the language.",
      downloading: "Downloading",
      errorDownloading: "Error downloading",
      errorDownloadingDescription: "Could not download the language model.",
      downloadCanceled: "Download canceled",
      downloadCanceledDescription: "The language model download has been canceled.",
      startingDownload: 'Starting download...',
      finishingDownload: 'Finishing...',
      installing: 'Installing model...',
      canceling: 'Canceling...',
      calculating: 'calculating...',
      downloadInProgressDescriptionToast: "Please wait for the current download to finish before starting another.",
      operationInProgressTitle: "Operation in progress",
      operationInProgressDescription: "Please wait for the current operation to complete.",
      cancelDownloadPrompt: "Do you want to cancel the download before leaving?",
    },
    recognitionStatus: {
      waiting: "Waiting for audio...",
      listening: "Listening...",
      analyzing: "Analyzing...",
      processing: "Processing final result...",
      ready: "Ready.",
      error: "Error: {error}",
    },
    analysis: {
      result: "Analysis complete: {summary}. Accuracy: {accuracy}%. Pattern: {pattern}.",
    },
    speechInitializer: {
      title: "Speech Recognition",
      ready: "Ready to listen in {languageName}",
      info: "Information",
      offlineNotAvailable: "Offline recognition not available. Using online alternative."
    }
  },
  es: {
    greetings: {
      locked: "¡Hola! Cuéntame una historia para desbloquear SuperLector.",
      unlocked: "¡Hola! Puedes seguir usando la app.",
    },
    recordingScreen: {
      appUnlocked: "App Desbloqueada",
      remainingTime: "Te quedan {time} minutos de uso.",
      canContinue: "Puedes seguir usando la app",
      error: "Error",
      voskInitError: "Error al inicializar VOSK: {error}",
      earnedTime: "¡La app ha sido desbloqueada por {time} minutos!",
      tellMore: "¡Cuenta más de tu historia! Estoy escuchando...",
      remainingTimeLabel: "Tiempo restante",
    },
    recordingManager: {
      analyzingStory: "¡Genial! Analizaré tu historia...",
      storyReceived: "¡Historia recibida!",
      recordingFinished: "Grabación finalizada después de {time} segundos.",
      noStoryDetected: "No se detectó ninguna historia",
      noStoryDetectedDescription: "No pude oír tu historia. Intenta hablar más alto.",
      tryAgain: "¿No pude oír tu historia. Lo intentamos de nuevo?",
      storyModeActive: "Modo Historia Activado",
      storyModeActiveDescription: "¡Cuenta tu historia a la Esfera Sonora!",
      listening: "¡Estoy escuchando! Puedes contar tu historia...",
    },
    languageSelector: {
      title: "Seleccionar Idioma",
      save: "Guardar",
      selectedLanguageLabel: "Idioma Seleccionado",
      selectPlaceholder: "Selecciona un idioma",
      downloadRequired: "Este modelo debe ser descargado para ser usado.",
      downloadNow: "Descargar ahora",
      downloadInProgress: "Descarga en progreso",
      downloadingModel: "Descargando modelo de idioma...",
      speed: "Velocidad",
      estimatedTime: "Tiempo estimado",
      downloadSource: "Descargando de alphacephei.com (servidor oficial VOSK)",
      cancelDownload: "Cancelar Descarga",
      availableModels: "Modelos Disponibles",
      size: "Tamaño",
      active: "Activo",
      select: "Seleccionar",
      download: "Descargar",
      backToApp: "Volver a la aplicación",
      close: "Cerrar",
      languageSaved: "Idioma guardado",
      languageChanged: "El idioma ha sido cambiado a {name}",
      languageChangeError: "Error al cambiar de idioma",
      languageChangeErrorDescription: "Ocurrió un error al cambiar el idioma.",
      downloading: "Descargando",
      errorDownloading: "Error de descarga",
      errorDownloadingDescription: "No se pudo descargar el modelo de idioma.",
      downloadCanceled: "Descarga cancelada",
      downloadCanceledDescription: "La descarga del modelo de idioma ha sido cancelada.",
      startingDownload: 'Iniciando descarga...',
      finishingDownload: 'Finalizando...',
      installing: 'Instalando modelo...',
      canceling: 'Cancelando...',
      calculating: 'calculando...',
      downloadInProgressDescriptionToast: "Por favor, espere a que termine la descarga actual antes de iniciar otra.",
      operationInProgressTitle: "Operación en progreso",
      operationInProgressDescription: "Por favor, espere a que se complete la operación actual.",
      cancelDownloadPrompt: "¿Deseas cancelar la descarga antes de salir?",
    },
    recognitionStatus: {
      waiting: "Esperando audio...",
      listening: "Escuchando...",
      analyzing: "Analizando...",
      processing: "Procesando resultado final...",
      ready: "Listo.",
      error: "Error: {error}",
    },
    analysis: {
      result: "Análisis completo: {summary}. Precisión: {accuracy}%. Patrón: {pattern}.",
    },
    speechInitializer: {
      title: "Reconocimiento de voz",
      ready: "Listo para escuchar en {languageName}",
      info: "Información",
      offlineNotAvailable: "Reconocimiento sin conexión no disponible. Usando alternativa en línea."
    }
  },
  fr: {
    greetings: {
        locked: "Bonjour! Racontez-moi une histoire pour déverrouiller SuperLecteur.",
        unlocked: "Bonjour! Vous pouvez continuer à utiliser l'application.",
    },
    recordingScreen: {
        appUnlocked: "Application déverrouillée",
        remainingTime: "Il vous reste {time} minutes d'utilisation.",
        canContinue: "Vous pouvez continuer à utiliser l'application",
        error: "Erreur",
        voskInitError: "Erreur lors de l'initialisation de VOSK: {error}",
        earnedTime: "L'application a été déverrouillée pendant {time} minutes!",
        tellMore: "Racontez plus de votre histoire! J'écoute...",
        remainingTimeLabel: "Temps restant",
    },
    recordingManager: {
        analyzingStory: "Super! Je vais analyser votre histoire...",
        storyReceived: "Histoire reçue!",
        recordingFinished: "Enregistrement terminé après {time} secondes.",
        noStoryDetected: "Aucune histoire détectée",
        noStoryDetectedDescription: "Je n'ai pas pu entendre votre histoire. Essayez de parler plus fort.",
        tryAgain: "Je n'ai pas pu entendre votre histoire. On réessaye?",
        storyModeActive: "Mode Histoire Activé",
        storyModeActiveDescription: "Racontez votre histoire à la Sphère Sonore!",
        listening: "J'écoute! Vous pouvez raconter votre histoire...",
    },
    languageSelector: {
        title: "Sélectionner la langue",
        save: "Enregistrer",
        selectedLanguageLabel: "Langue sélectionnée",
        selectPlaceholder: "Sélectionnez une langue",
        downloadRequired: "Ce modèle doit être téléchargé avant utilisation.",
        downloadNow: "Télécharger maintenant",
        downloadInProgress: "Téléchargement en cours",
        downloadingModel: "Téléchargement du modèle de langue...",
        speed: "Vitesse",
        estimatedTime: "Temps estimé",
        downloadSource: "Téléchargement depuis alphacephei.com (serveur officiel VOSK)",
        cancelDownload: "Annuler le téléchargement",
        availableModels: "Modèles disponibles",
        size: "Taille",
        active: "Actif",
        select: "Sélectionner",
        download: "Télécharger",
        backToApp: "Retour à l'application",
        close: "Fermer",
        languageSaved: "Langue enregistrée",
        languageChanged: "La langue a été changée en {name}",
        languageChangeError: "Erreur lors du changement de langue",
        languageChangeErrorDescription: "Une erreur est survenue lors du changement de langue.",
        downloading: "Téléchargement",
        errorDownloading: "Erreur de téléchargement",
        errorDownloadingDescription: "Impossible de télécharger le modèle de langue.",
        downloadCanceled: "Téléchargement annulé",
        downloadCanceledDescription: "Le téléchargement du modèle de langue a été annulé.",
        startingDownload: "Démarrage du téléchargement...",
        finishingDownload: "Finalisation...",
        installing: "Installation du modèle...",
        canceling: "Annulation...",
        calculating: "calcul...",
        downloadInProgressDescriptionToast: "Veuillez attendre la fin du téléchargement actuel avant d'en lancer un autre.",
        operationInProgressTitle: "Opération en cours",
        operationInProgressDescription: "Veuillez attendre la fin de l'opération en cours.",
        cancelDownloadPrompt: "Voulez-vous annuler le téléchargement avant de quitter ?",
    },
    recognitionStatus: {
        waiting: "En attente d'audio...",
        listening: "Écoute...",
        analyzing: "Analyse...",
        processing: "Traitement du résultat final...",
        ready: "Prêt.",
        error: "Erreur: {error}",
    },
    analysis: {
        result: "Analyse terminée: {summary}. Précision: {accuracy}%. Modèle: {pattern}.",
    },
    speechInitializer: {
      title: "Reconnaissance vocale",
      ready: "Prêt à écouter en {languageName}",
      info: "Information",
      offlineNotAvailable: "Reconnaissance hors ligne non disponible. Utilisation de l'alternative en ligne."
    }
  },
  de: {
    greetings: {
        locked: "Hallo! Erzähl mir eine Geschichte, um SuperLeser freizuschalten.",
        unlocked: "Hallo! Du kannst die App weiterhin verwenden.",
    },
    recordingScreen: {
        appUnlocked: "App entsperrt",
        remainingTime: "Du hast noch {time} Minuten Nutzungszeit.",
        canContinue: "Du kannst die App weiterhin verwenden",
        error: "Fehler",
        voskInitError: "Fehler beim Initialisieren von VOSK: {error}",
        earnedTime: "Die App wurde für {time} Minuten freigeschaltet!",
        tellMore: "Erzähl mehr von deiner Geschichte! Ich höre zu...",
        remainingTimeLabel: "Verbleibende Zeit",
    },
    recordingManager: {
        analyzingStory: "Super! Ich werde deine Geschichte analysieren...",
        storyReceived: "Geschichte erhalten!",
        recordingFinished: "Aufnahme nach {time} Sekunden beendet.",
        noStoryDetected: "Keine Geschichte erkannt",
        noStoryDetectedDescription: "Ich konnte deine Geschichte nicht hören. Sprich bitte lauter.",
        tryAgain: "Ich konnte deine Geschichte nicht hören. Sollen wir es nochmal versuchen?",
        storyModeActive: "Geschichtenmodus aktiviert",
        storyModeActiveDescription: "Erzähle deine Geschichte der Klangsphäre!",
        listening: "Ich höre zu! Du kannst deine Geschichte erzählen...",
    },
    languageSelector: {
        title: "Sprache auswählen",
        save: "Speichern",
        selectedLanguageLabel: "Ausgewählte Sprache",
        selectPlaceholder: "Wähle eine Sprache",
        downloadRequired: "Dieses Modell muss vor der Verwendung heruntergeladen werden.",
        downloadNow: "Jetzt herunterladen",
        downloadInProgress: "Download läuft",
        downloadingModel: "Sprachmodell wird heruntergeladen...",
        speed: "Geschwindigkeit",
        estimatedTime: "Geschätzte Zeit",
        downloadSource: "Download von alphacephei.com (offizieller VOSK-Server)",
        cancelDownload: "Download abbrechen",
        availableModels: "Verfügbare Modelle",
        size: "Größe",
        active: "Aktiv",
        select: "Auswählen",
        download: "Herunterladen",
        backToApp: "Zurück zur App",
        close: "Schließen",
        languageSaved: "Sprache gespeichert",
        languageChanged: "Die Sprache wurde auf {name} geändert",
        languageChangeError: "Fehler beim Ändern der Sprache",
        languageChangeErrorDescription: "Beim Ändern der Sprache ist ein Fehler aufgetreten.",
        downloading: "Wird heruntergeladen",
        errorDownloading: "Fehler beim Herunterladen",
        errorDownloadingDescription: "Das Sprachmodell konnte nicht heruntergeladen werden.",
        downloadCanceled: "Download abgebrochen",
        downloadCanceledDescription: "Der Download des Sprachmodells wurde abgebrochen.",
        startingDownload: "Download wird gestartet...",
        finishingDownload: "Wird abgeschlossen...",
        installing: "Modell wird installiert...",
        canceling: "Wird abgebrochen...",
        calculating: "berechne...",
        downloadInProgressDescriptionToast: "Bitte warten Sie, bis der aktuelle Download abgeschlossen ist, bevor Sie einen neuen starten.",
        operationInProgressTitle: "Vorgang läuft",
        operationInProgressDescription: "Bitte warten Sie, bis der aktuelle Vorgang abgeschlossen ist.",
        cancelDownloadPrompt: "Möchten Sie den Download abbrechen, bevor Sie gehen?",
    },
    recognitionStatus: {
        waiting: "Warte auf Audio...",
        listening: "Höre zu...",
        analyzing: "Analysiere...",
        processing: "Verarbeite Endergebnis...",
        ready: "Bereit.",
        error: "Fehler: {error}",
    },
    analysis: {
        result: "Analyse abgeschlossen: {summary}. Genauigkeit: {accuracy}%. Muster: {pattern}.",
    },
    speechInitializer: {
      title: "Spracherkennung",
      ready: "Bereit zum Zuhören in {languageName}",
      info: "Information",
      offlineNotAvailable: "Offline-Erkennung nicht verfügbar. Online-Alternative wird verwendet."
    }
  },
};

type NestedValue = string | { [key: string]: NestedValue };
type LanguageDict = { [key: string]: NestedValue };

export const getTranslation = (
  lang: string,
  key: string,
  values?: Record<string, string | number>,
  defaultValue?: string
): string => {
  const langKey = lang.split("-")[0] as keyof typeof translations;
  let langDict: LanguageDict = translations[langKey] || translations.en;

  // Fallback if primary language dictionary doesn't exist
  if (!langDict) {
    langDict = translations.pt;
  }

  const keys = key.split(".");
  let text = keys.reduce(
    (obj, k) => (obj && typeof obj === 'object' && obj[k] ? obj[k] : null),
    langDict
  ) as string | null;

  if (!text) {
    // Fallback to English for the specific key if not found in the current language
    const fallbackDict = translations.en || translations.pt;
    text = keys.reduce(
        (obj, k) => (obj && typeof obj === 'object' && obj[k] ? obj[k] : null),
        fallbackDict
    ) as string | null;

    if (!text) {
        console.warn(`[getTranslation] No translation found for key: ${key}`);
        return defaultValue || key;
    }
  }
  
  if (values) {
    return Object.entries(values).reduce((acc, [k, v]) => {
        return acc.replace(`{${k}}`, String(v));
    }, text);
  }

  return text;
};
