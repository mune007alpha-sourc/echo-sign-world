import { useState, useCallback, useRef, useEffect } from "react";
import { Camera, CameraOff, Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DetectionResult {
  gesture: string;
  confidence: number;
  timestamp: string;
}

interface SignDetectionProps {
  language: string;
  onDetection?: (text: string) => void;
}

export function SignDetection({ language, onDetection }: SignDetectionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string>("");
  const [currentGesture, setCurrentGesture] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const handsRef = useRef<any>(null);

  // Hand connections for drawing
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm
  ];

  // Draw hand landmarks on canvas
  const drawHandLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Draw connections
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    for (const [start, end] of HAND_CONNECTIONS) {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    }

    // Draw landmarks
    ctx.fillStyle = '#FF0000';
    for (const landmark of landmarks) {
      ctx.beginPath();
      ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Load MediaPipe script from CDN
  const loadMediaPipeScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).Hands) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MediaPipe Hands'));
      document.head.appendChild(script);
    });
  };

  // Initialize MediaPipe Hands
  const initializeMediaPipe = useCallback(async () => {
    try {
      // Load script from CDN
      await loadMediaPipeScript();

      const HandsConstructor = (window as any).Hands;
      if (!HandsConstructor) {
        throw new Error('MediaPipe Hands not available');
      }
      
      const hands = new HandsConstructor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;

          // Clear and draw video frame
          ctx.save();
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw hand landmarks
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
              drawHandLandmarks(ctx, landmarks);
            }

            // Process detection (throttled)
            const now = Date.now();
            if (now - lastDetectionRef.current > 500) { // 500ms throttle
              lastDetectionRef.current = now;
              processLandmarks(results.multiHandLandmarks[0]);
            }
          }

          ctx.restore();
        }
      });

      handsRef.current = hands;
      return hands;
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      throw new Error('Failed to load hand tracking. Please try again.');
    }
  }, []);

  // Process landmarks and detect signs
  const processLandmarks = async (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    setIsDetecting(true);

    try {
      // Convert normalized landmarks to array format
      const landmarkArray = landmarks.map((lm: any) => [lm.x, lm.y, lm.z]);

      // Call backend for detection
      const { data, error: funcError } = await supabase.functions.invoke('detect-sign', {
        body: { 
          landmarks: landmarkArray,
          timestamp: new Date().toISOString()
        }
      });

      if (funcError) {
        console.error('Detection error:', funcError);
        return;
      }

      if (data?.detected && data?.gesture) {
        setCurrentGesture(data.gesture);
        setConfidence(data.confidence);

        // Translate if not English
        let displayText = data.gesture;
        if (language !== 'en') {
          const { data: translationData } = await supabase.functions.invoke('translate-text', {
            body: {
              text: data.gesture,
              sourceLanguage: 'en',
              targetLanguage: language
            }
          });
          
          if (translationData?.translatedText) {
            displayText = translationData.translatedText;
          }
        }

        // Update detected text (append with space)
        setDetectedText(prev => {
          const newText = prev ? `${prev} ${displayText}` : displayText;
          onDetection?.(newText);
          return newText;
        });
      }
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Start camera and detection
  const startDetection = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Initialize MediaPipe first
      await initializeMediaPipe();

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current && canvasRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Set canvas size to match video
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });

        // Start detection loop
        const detectFrame = async () => {
          if (videoRef.current && handsRef.current && streamRef.current) {
            await handsRef.current.send({ image: videoRef.current });
            animationRef.current = requestAnimationFrame(detectFrame);
          }
        };

        detectFrame();
        setIsActive(true);
      }
    } catch (err) {
      console.error("Camera/Detection error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else {
          setError(err.message || "Failed to start detection. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [initializeMediaPipe]);

  // Stop camera and detection
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setCurrentGesture("");
    setConfidence(0);
  }, []);

  // Clear detected text
  const clearText = () => {
    setDetectedText("");
    onDetection?.("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <article className="feature-card" aria-labelledby="sign-detection-heading">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Hand className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 id="sign-detection-heading" className="text-xl font-semibold text-foreground">
              Live Sign Language Detection
            </h2>
            <p className="text-sm text-muted-foreground">
              Show signs to the camera to convert to text
            </p>
          </div>
        </div>
        <StatusIndicator
          status={isActive ? (isDetecting ? "active" : "active") : error ? "error" : "idle"}
          label={isActive ? (isDetecting ? "Detecting..." : "Camera Active") : error ? "Error" : "Ready"}
        />
      </div>

      {/* Video/Canvas container */}
      <div
        className={cn(
          "relative aspect-video rounded-xl overflow-hidden bg-secondary/50 border-2 border-border",
          isActive && "border-primary/50"
        )}
      >
        {/* Hidden video element for MediaPipe */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
          aria-hidden="true"
        />
        
        {/* Canvas for drawing */}
        {isActive ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            aria-label="Live camera feed with hand tracking overlay"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <div className="p-4 rounded-full bg-muted">
              {isLoading ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" aria-hidden="true" />
              ) : (
                <CameraOff className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            {error ? (
              <p className="text-center text-destructive text-sm max-w-xs" role="alert">
                {error}
              </p>
            ) : isLoading ? (
              <p className="text-center text-muted-foreground text-sm">
                Initializing hand tracking...
              </p>
            ) : (
              <p className="text-center text-muted-foreground text-sm">
                Start detection to begin recognizing sign language
              </p>
            )}
          </div>
        )}

        {/* Live indicator and gesture display */}
        {isActive && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive-foreground" />
              </span>
              LIVE
            </div>
            
            {currentGesture && (
              <div className="absolute top-3 right-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-lg">
                {currentGesture}
                <span className="ml-2 text-xs opacity-75">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detected text output */}
      {detectedText && (
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">Detected Signs:</p>
              <p className="text-lg font-medium text-foreground" aria-live="polite">
                {detectedText}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearText} aria-label="Clear detected text">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-3">
        <Button
          variant={isActive ? "destructive" : "default"}
          size="lg"
          onClick={isActive ? stopDetection : startDetection}
          disabled={isLoading}
          className="min-w-[200px]"
          aria-label={isActive ? "Stop detection" : "Start detection"}
          aria-pressed={isActive}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : isActive ? (
            <>
              <CameraOff className="h-5 w-5" />
              Stop Detection
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Start Detection
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Supported signs:</strong> Letters (A-Z), Numbers (1-5), Hello, Yes, No, Thank You, I Love You
        </p>
      </div>
    </article>
  );
}
