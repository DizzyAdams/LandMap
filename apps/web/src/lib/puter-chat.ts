'use client';

/**
 * Client-side MiniMax integration via Puter.js — 100% free, no API keys.
 *
 * Puter.js uses a User-Pays model: the end user covers their own AI usage,
 * so the app runs at zero AI/server cost and scales to unlimited users.
 * Docs: https://developer.puter.com/tutorials/free-unlimited-minimax-api/
 */

import type { ChatMessage } from './chat';

export type MinimaxModel = {
  id: string;
  label: string;
  speed: 'fast' | 'balanced' | 'reasoning';
};

export const MINIMAX_MODELS: MinimaxModel[] = [
  { id: 'minimax/minimax-m3', label: 'MiniMax M3', speed: 'balanced' },
  { id: 'minimax/minimax-m2.7', label: 'MiniMax M2.7 (reasoning)', speed: 'reasoning' },
  { id: 'minimax/minimax-m2.7-highspeed', label: 'MiniMax M2.7 Highspeed', speed: 'fast' },
  { id: 'minimax/minimax-m2.5', label: 'MiniMax M2.5', speed: 'balanced' },
  { id: 'minimax/minimax-m2.5-highspeed', label: 'MiniMax M2.5 Highspeed', speed: 'fast' },
  { id: 'minimax/minimax-m2.1', label: 'MiniMax M2.1', speed: 'balanced' },
  { id: 'minimax/minimax-m2.1-highspeed', label: 'MiniMax M2.1 Highspeed', speed: 'fast' },
  { id: 'minimax/minimax-m2-her', label: 'MiniMax M2-her (dialog)', speed: 'balanced' },
  { id: 'minimax/minimax-m2', label: 'MiniMax M2 (code)', speed: 'balanced' },
  { id: 'minimax/minimax-m1', label: 'MiniMax M1 (long ctx)', speed: 'balanced' },
  { id: 'minimax/minimax-01', label: 'MiniMax-01 (multimodal)', speed: 'balanced' },
];

export const DEFAULT_MINIMAX_MODEL = 'minimax/minimax-m3';

export const LANDMAP_SYSTEM_PROMPT = `You are LandMap AI, a real-estate intelligence assistant for the Brazilian market.
Answer in the user's language (default Portuguese). Be concise, objective and factual.
Help users find properties, compare regions, understand pricing and investment potential.`;

type PuterLike = {
  ai: {
    chat: (
      input: unknown,
      options?: Record<string, unknown>,
    ) => Promise<unknown>;
  };
};

let puterPromise: Promise<PuterLike> | null = null;

/** Lazily load Puter.js so it never blocks SSR / initial bundle. */
export function loadPuter(): Promise<PuterLike> {
  if (!puterPromise) {
    // Cast specifier to any so typecheck passes even before the dep is installed.
    puterPromise = import('@heyputer/puter.js' as any).then((mod: any) => {
      const puter = mod?.puter ?? mod?.default ?? mod;
      if (!puter?.ai?.chat) {
        throw new Error('Puter.js carregado sem a API puter.ai.chat');
      }
      return puter as PuterLike;
    });
  }
  return puterPromise;
}

export type PuterChatOptions = {
  model?: string;
  systemPrompt?: string;
  onToken?: (delta: string) => void;
};

/**
 * Send a chat turn to a free MiniMax model via Puter.js.
 * Returns the full assistant text. When `onToken` is provided it streams deltas.
 */
export async function sendPuterChat(
  messages: ChatMessage[],
  opts: PuterChatOptions = {},
): Promise<string> {
  const puter = await loadPuter();
  const model = opts.model ?? DEFAULT_MINIMAX_MODEL;

  const history: Array<{ role: string; content: string }> = [];
  if (opts.systemPrompt) {
    history.push({ role: 'system', content: opts.systemPrompt });
  }
  for (const m of messages) {
    history.push({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    });
  }

  if (opts.onToken) {
    const stream = (await puter.ai.chat(history, {
      model,
      stream: true,
    })) as AsyncIterable<{ text?: string }>;
    let full = '';
    for await (const part of stream) {
      const delta = part?.text ?? '';
      if (delta) {
        full += delta;
        opts.onToken(delta);
      }
    }
    return full;
  }

  const res = await puter.ai.chat(history, { model });
  if (typeof res === 'string') return res;
  if (typeof (res as any)?.text === 'string') return (res as any).text;
  if (typeof (res as any)?.message?.content === 'string')
    return (res as any).message.content;
  return String(res ?? '');
}
