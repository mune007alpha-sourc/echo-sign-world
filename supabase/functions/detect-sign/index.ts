import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sign language gesture mappings based on hand landmarks
// This is a simplified classifier - can be replaced with a real ML model
const GESTURE_MAPPINGS: Record<string, string> = {
  // Letters (simplified patterns)
  'thumb_up': 'A',
  'fist': 'S',
  'index_point': 'D',
  'peace': 'V',
  'open_palm': 'B',
  'pinch': 'O',
  'rock': 'I',
  'call': 'Y',
  'thumb_pinky': 'Y',
  // Common words
  'wave': 'Hello',
  'nod_hand': 'Yes',
  'shake_hand': 'No',
  'heart': 'Thank You',
  'point_self': 'I',
  'point_you': 'You',
  // Numbers
  'one_finger': '1',
  'two_fingers': '2',
  'three_fingers': '3',
  'four_fingers': '4',
  'five_fingers': '5',
};

// Simplified gesture detection based on landmark positions
function classifyGesture(landmarks: number[][]): { gesture: string; confidence: number } {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'unknown', confidence: 0 };
  }

  // Calculate finger states (extended or folded)
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  const pinkyMcp = landmarks[17];

  // Check if fingers are extended (tip is higher than MCP joint)
  const indexExtended = indexTip[1] < indexMcp[1];
  const middleExtended = middleTip[1] < middleMcp[1];
  const ringExtended = ringTip[1] < ringMcp[1];
  const pinkyExtended = pinkyTip[1] < pinkyMcp[1];
  const thumbExtended = thumbTip[0] < landmarks[3][0]; // For right hand

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

  // Detect gestures based on finger positions
  let gesture = 'unknown';
  let confidence = 0.5;

  // Five fingers - Open palm (Hello/B)
  if (extendedCount === 4 && thumbExtended) {
    gesture = 'Hello';
    confidence = 0.85;
  }
  // Fist - all fingers closed
  else if (extendedCount === 0 && !thumbExtended) {
    gesture = 'S';
    confidence = 0.8;
  }
  // Peace sign - index and middle extended
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    gesture = 'V';
    confidence = 0.85;
  }
  // Index point - only index extended
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    gesture = 'D';
    confidence = 0.75;
  }
  // Thumb up
  else if (thumbExtended && extendedCount === 0) {
    gesture = 'Yes';
    confidence = 0.8;
  }
  // Rock sign - index and pinky extended
  else if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    gesture = 'I Love You';
    confidence = 0.85;
  }
  // Three fingers
  else if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    gesture = 'W';
    confidence = 0.75;
  }
  // Four fingers
  else if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    gesture = '4';
    confidence = 0.8;
  }
  // One finger (index)
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    gesture = '1';
    confidence = 0.8;
  }
  // Two fingers
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
    gesture = '2';
    confidence = 0.8;
  }

  return { gesture, confidence };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landmarks, timestamp } = await req.json();
    
    console.log('Received landmarks for detection:', landmarks?.length || 0, 'points');

    if (!landmarks || !Array.isArray(landmarks)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid landmarks data',
          detected: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Classify the gesture
    const result = classifyGesture(landmarks);

    console.log('Detected gesture:', result.gesture, 'with confidence:', result.confidence);

    return new Response(
      JSON.stringify({
        detected: result.gesture !== 'unknown',
        gesture: result.gesture,
        confidence: result.confidence,
        timestamp: timestamp || new Date().toISOString(),
        landmarks_received: landmarks.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in detect-sign function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        detected: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
