import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { cn } from "@/lib/utils";
import type { SpeechRecognition as SpeechRecognitionType } from "@/types/speech.d";

interface VoiceToTextProps {
  language: string;
  onTextRecognized?: (text: string) => void;
}

export function VoiceToText({ language, onTextRecognized }: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const languageMap: Record<string, string> = {
    en: "en-US",
    ta: "ta-IN",
    hi: "hi-IN",
  };

  const startListening = useCallback(() => {
    setError(null);

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageMap[language] || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + " " + finalTranscript);
        onTextRecognized?.(finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(`Error: ${event.error}. Please try again.`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onTextRecognized]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <article className="feature-card" aria-labelledby="voice-to-text-heading">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Volume2 className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 id="voice-to-text-heading" className="text-xl font-semibold text-foreground">
              Voice to Text
            </h2>
            <p className="text-sm text-muted-foreground">
              Speak and see your words appear
            </p>
          </div>
        </div>
        <StatusIndicator
          status={isListening ? "active" : error ? "error" : "idle"}
          label={isListening ? "Listening..." : error ? "Error" : "Ready"}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button
          variant={isListening ? "destructive" : "touch"}
          size="iconXl"
          onClick={toggleListening}
          className={cn(
            "rounded-full transition-all duration-300",
            isListening && "animate-pulse-soft shadow-glow"
          )}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          aria-pressed={isListening}
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          {isListening ? "Tap to stop" : "Tap to start speaking"}
        </p>
      </div>

      {/* Transcript display */}
      <div
        className="mt-6 min-h-[120px] p-4 rounded-xl bg-secondary/50 border-2 border-border"
        role="log"
        aria-live="polite"
        aria-label="Speech transcript"
      >
        {transcript || interimTranscript ? (
          <div className="space-y-2">
            {transcript && (
              <p className="text-foreground text-lg leading-relaxed">{transcript.trim()}</p>
            )}
            {interimTranscript && (
              <p className="text-muted-foreground text-lg italic">{interimTranscript}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center italic">
            {error || "Your spoken words will appear here..."}
          </p>
        )}
      </div>

      {transcript && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTranscript}
          className="mt-3"
          aria-label="Clear transcript"
        >
          Clear text
        </Button>
      )}
    </article>
  );
}
