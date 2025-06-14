
import { voskModelsService } from '../voskModelsService';

export function getCurrentModelAndPath() {
  const currentModel = voskModelsService.getCurrentModel();
  const modelPath = currentModel ? currentModel.url : '/models/vosk-model-pt-br-small';
  return { currentModel, modelPath };
}

export function logModelInitialization(currentModel: any, modelPath: string) {
  console.log("[voskService] Inicializando VOSK com modelo:", {
    id: currentModel?.id,
    name: currentModel?.name,
    lang: currentModel?.language,
    path: modelPath,
    localStorageVal: localStorage.getItem('vosk_current_model'),
  });
}
