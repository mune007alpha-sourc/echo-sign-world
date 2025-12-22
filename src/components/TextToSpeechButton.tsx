import { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TextToSpeechButtonProps {
  text: string;
  language: string;
  className?: string;
}

export function TextToSpeechButton({ text, language, className }: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!text || isSpeaking) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!text) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSpeaking ? stop : speak}
      className={cn("gap-2", className)}
      aria-label={isSpeaking ? "Stop speaking" : "Speak text aloud"}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="h-4 w-4" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          Speak
        </>
      )}
    </Button>
  );
}
