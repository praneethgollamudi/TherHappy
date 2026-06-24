import Anthropic from 'npm:@anthropic-ai/sdk@^0.27.3';
import { createClient } from 'npm:@supabase/supabase-js@^2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Aria, a warm and compassionate mental wellness companion for TherHappy. You provide emotional support, a safe space to express feelings, and evidence-based coping strategies.

Core principles:
- Listen actively and with genuine empathy
- Validate emotions without judgment before offering suggestions
- Ask thoughtful, open-ended questions that help users explore their feelings
- Offer practical, evidence-based coping strategies when appropriate
- Be warm, human, and concise — never robotic or clinical

Important boundaries:
- You are NOT a replacement for professional therapy or medical care
- Always encourage professional help for serious, persistent, or complex issues
- If someone expresses thoughts of self-harm, suicide, or is in crisis, IMMEDIATELY respond with compassion AND provide crisis resources: National Suicide Prevention Lifeline (call or text 988), Crisis Text Line (text HOME to 741741).

Your communication style:
- Conversational and warm, never clinical
- Reflect back what you hear: "It sounds like you're feeling..."
- Keep responses focused — 2-4 short paragraphs
- End most responses with a gentle question to continue the conversation`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const data = JSON.stringify({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
