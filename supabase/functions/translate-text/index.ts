import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json();

    console.log('Translation request:', { text, targetLanguage, sourceLanguage });

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: text and targetLanguage' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If source and target are the same, return original text
    if (sourceLanguage === targetLanguage) {
      return new Response(
        JSON.stringify({
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          translated: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Language names for the prompt
    const languageNames: Record<string, string> = {
      'en': 'English',
      'ta': 'Tamil',
      'hi': 'Hindi'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;

    // Use Lovable AI for translation
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      // Fallback to simple placeholder translations
      const fallbackTranslations: Record<string, Record<string, string>> = {
        'Hello': { 'ta': 'வணக்கம்', 'hi': 'नमस्ते' },
        'Yes': { 'ta': 'ஆம்', 'hi': 'हाँ' },
        'No': { 'ta': 'இல்லை', 'hi': 'नहीं' },
        'Thank You': { 'ta': 'நன்றி', 'hi': 'धन्यवाद' },
        'I Love You': { 'ta': 'நான் உன்னை காதலிக்கிறேன்', 'hi': 'मैं तुमसे प्यार करता हूँ' },
        'I': { 'ta': 'நான்', 'hi': 'मैं' },
        'You': { 'ta': 'நீ', 'hi': 'तुम' },
      };

      const translated = fallbackTranslations[text]?.[targetLanguage] || text;
      
      return new Response(
        JSON.stringify({
          originalText: text,
          translatedText: translated,
          sourceLanguage,
          targetLanguage,
          translated: translated !== text,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call Lovable AI for translation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the given text from ${sourceLangName} to ${targetLangName}. Only respond with the translated text, nothing else. Do not add any explanations or notes.`
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Handle rate limiting
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
            originalText: text,
            translatedText: text,
            translated: false
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    console.log('Translation result:', translatedText);

    return new Response(
      JSON.stringify({
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        translated: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
