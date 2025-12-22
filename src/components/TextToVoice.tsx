import { useState, useCallback, useRef } from "react";
import { Volume2, VolumeX, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusIndicator } from "@/components/StatusIndicator";
import { cn } from "@/lib/utils";

interface TextToVoiceProps {
  language: string;
}

export function TextToVoice({ language }: TextToVoiceProps) {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languageMap: Record<string, string> = {
    en: "en-US",
    ta: "ta-IN",
    hi: "hi-IN",
  };

  const speakText = useCallback(() => {
    if (!text.trim()) {
      setError("Please enter some text to speak");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in your browser.");
      return;
    }

    setError(null);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[language] || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setError("Failed to speak text. Please try again.");
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  return (
    <article className="feature-card" aria-labelledby="text-to-voice-heading">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <Volume2 className="h-6 w-6 text-accent" aria-hidden="true" />
          </div>
          <div>
            <h2 id="text-to-voice-heading" className="text-xl font-semibold text-foreground">
              Text to Voice
            </h2>
            <p className="text-sm text-muted-foreground">
              Type text and hear it spoken aloud
            </p>
          </div>
        </div>
        <StatusIndicator
          status={isSpeaking ? "active" : error ? "error" : "idle"}
          label={isSpeaking ? "Speaking..." : error ? "Error" : "Ready"}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="text-input" className="sr-only">
            Enter text to speak
          </label>
          <Textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message here..."
            className="min-h-[120px] text-lg rounded-xl border-2 border-border bg-secondary/30 p-4 resize-none focus:border-primary transition-colors"
            aria-describedby={error ? "text-error" : undefined}
            disabled={isSpeaking}
          />
          {error && (
            <p id="text-error" className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant={isSpeaking ? "destructive" : "default"}
            size="lg"
            onClick={isSpeaking ? stopSpeaking : speakText}
            disabled={!text.trim() && !isSpeaking}
            className={cn(
              "min-w-[160px]",
              isSpeaking && "animate-pulse-soft"
            )}
            aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
          >
            {isSpeaking ? (
              <>
                <Square className="h-5 w-5" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Speak Text
              </>
            )}
          </Button>

          {text && !isSpeaking && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setText("")}
              aria-label="Clear text"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
