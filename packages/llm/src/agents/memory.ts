/**
 * Agent Memory - Conversation memory with RAG context
 * Similar to LangChain Memory + ConversationBufferWindowMemory
 */

export interface MemoryChunk {
  id: string;
  content: string;
  embedding?: number[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class AgentMemory {
  private chunks: MemoryChunk[];
  private maxChunks: number;

  constructor(maxChunks = 50) {
    this.chunks = [];
    this.maxChunks = maxChunks;
  }

  add(chunk: Omit<MemoryChunk, 'id'>): string {
    const id = `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.chunks.push({ ...chunk, id });

    // Keep only last N chunks
    if (this.chunks.length > this.maxChunks) {
      this.chunks = this.chunks.slice(-this.maxChunks);
    }

    return id;
  }

  getRecent(count = 10): MemoryChunk[] {
    return this.chunks.slice(-count);
  }

  getAll(): MemoryChunk[] {
    return [...this.chunks];
  }

  clear(): void {
    this.chunks = [];
  }

  toContextString(): string {
    return this.chunks
      .map((chunk) => {
        const role = chunk.metadata?.role || 'user';
        return `[${role}]: ${chunk.content}`;
      })
      .join('\n');
  }
}
