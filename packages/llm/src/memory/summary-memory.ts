/* ------------------------------------------------------------------ */
/*  Lightweight summary memory                                        */
/*  Keeps a running compressed history for conversational agents.     */
/* ------------------------------------------------------------------ */

export type SummaryMemoryOptions = {
  /** Maximum number of raw messages to keep before summarizing. */
  maxMessages?: number;
};

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Simple rolling summary memory.
 *
 * Behavior:
 * - Stores messages up to `maxMessages`.
 * - Once the limit is exceeded, truncates to the most recent N messages.
 *   For a real summarizer, call `summarize()` before truncating to compress
 *   older turns into one system message.
 */
export class SummaryMemory {
  private readonly maxMessages: number;
  private history: Message[] = [];
  private summary: string = '';

  constructor(options?: SummaryMemoryOptions) {
    this.maxMessages = options?.maxMessages ?? 20;
  }

  add(message: Message): void {
    this.history.push(message);
    if (this.history.length > this.maxMessages) {
      this.history = this.history.slice(-this.maxMessages);
    }
  }

  /** Return all messages, prefixing the current rolling summary if defined. */
  getMessages(forceIncludeSummary = true): Message[] {
    const out: Message[] = [];
    if (forceIncludeSummary && this.summary) {
      out.push({ role: 'system', content: `Resumo do histórico anterior: ${this.summary}` });
    }
    out.push(...this.history);
    return out;
  }

  /** Naive compressor: joins the oldest half of the history into one sentence. */
  summarize(): string {
    if (this.history.length <= 2) return this.summary;

    const half = Math.max(2, Math.floor(this.history.length / 2));
    const oldest = this.history.slice(0, half);
    const snippet = oldest
      .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
      .join(' | ');

    this.summary = this.summary
      ? `${this.summary} | ${snippet}`
      : snippet;
    this.history = this.history.slice(half);
    return this.summary;
  }

  clear(): void {
    this.history = [];
    this.summary = '';
  }

  size(): number {
    return this.history.length;
  }
}
