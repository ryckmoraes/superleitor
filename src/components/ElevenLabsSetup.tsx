
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useElevenLabsContext } from "@/contexts/ElevenLabsContext";
import { CheckIcon, KeyIcon, XIcon } from "lucide-react";

export function ElevenLabsSetup() {
  const { apiKey, setApiKey, voiceId, setVoiceId, isInitialized, voiceOptions } = useElevenLabsContext();
  const [inputKey, setInputKey] = useState(apiKey);
  
  const handleSaveKey = () => {
    setApiKey(inputKey.trim());
  };
  
  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">ElevenLabs Voice</h3>
        <div className="flex items-center gap-1">
          {isInitialized ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XIcon className="h-4 w-4 text-red-500" />
          )}
          <span className={isInitialized ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
            {isInitialized ? "Configured" : "Not Configured"}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="elevenlabs-api-key">API Key</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="elevenlabs-api-key"
                type="password"
                placeholder="Enter your ElevenLabs API key"
                className="pl-8"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveKey} disabled={!inputKey || inputKey === apiKey}>
              Save
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Get your API key from{" "}
            <a
              href="https://elevenlabs.io/app/account/api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              elevenlabs.io
            </a>
          </p>
        </div>
        
        {isInitialized && (
          <div className="space-y-1">
            <Label htmlFor="voice-select">Voice</Label>
            <Select value={voiceId} onValueChange={setVoiceId}>
              <SelectTrigger id="voice-select">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
