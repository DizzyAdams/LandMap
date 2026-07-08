'use client';

import { LANDMAP_API_BASE } from './api';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  id?: number;
};

export type AnalyzeResult = {
  answer: string;
  candidates: Array<{ id: string; score: number }>;
};

export async function sendChatPrompt(prompt: string): Promise<AnalyzeResult> {
  const res = await fetch(`${LANDMAP_API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
