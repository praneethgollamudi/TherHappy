import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

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
- If someone expresses thoughts of self-harm, suicide, or is in crisis, IMMEDIATELY respond with compassion AND provide crisis resources: National Suicide Prevention Lifeline (call or text 988), Crisis Text Line (text HOME to 741741). Stay present with them.

Your communication style:
- Conversational and warm, never clinical or overly formal
- Reflect back what you hear before offering suggestions: "It sounds like you're feeling..."
- Use "I" statements: "I hear that..." "I can understand why..."
- Keep responses focused — 2-4 short paragraphs is usually best
- End most responses with a gentle question to continue the conversation (unless providing crisis resources)
- Use occasional gentle affirmations, but don't be saccharine

You are a supportive presence, not a fixer. Your goal is to help people feel heard, understood, and equipped to navigate their emotions.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages } = await req.json();

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
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

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: `Failed to get response: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
