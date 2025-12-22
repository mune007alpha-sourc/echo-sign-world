import { useState, useCallback, useRef, useEffect } from "react";
import { Camera, CameraOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { cn } from "@/lib/utils";

export function CameraPreview() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else {
          setError("Failed to access camera. Please try again.");
        }
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <article className="feature-card" aria-labelledby="camera-heading">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-success/10">
            <Video className="h-6 w-6 text-success" aria-hidden="true" />
          </div>
          <div>
            <h2 id="camera-heading" className="text-xl font-semibold text-foreground">
              Camera Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              For future sign language recognition
            </p>
          </div>
        </div>
        <StatusIndicator
          status={isActive ? "active" : error ? "error" : "idle"}
          label={isActive ? "Camera Active" : error ? "Error" : "Ready"}
        />
      </div>

      {/* Video container */}
      <div
        className={cn(
          "relative aspect-video rounded-xl overflow-hidden bg-secondary/50 border-2 border-border",
          isActive && "border-success/50"
        )}
      >
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            aria-label="Live camera feed"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="p-4 rounded-full bg-muted">
              <CameraOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
            </div>
            {error ? (
              <p className="text-center text-destructive text-sm max-w-xs" role="alert">
                {error}
              </p>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                Camera is off. Start to preview for sign language recognition.
              </p>
            )}
          </div>
        )}

        {/* Live indicator */}
        {isActive && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive-foreground" />
            </span>
            LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center">
        <Button
          variant={isActive ? "destructive" : "default"}
          size="lg"
          onClick={toggleCamera}
          className="min-w-[180px]"
          aria-label={isActive ? "Stop camera" : "Start camera"}
          aria-pressed={isActive}
        >
          {isActive ? (
            <>
              <CameraOff className="h-5 w-5" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Start Camera
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
