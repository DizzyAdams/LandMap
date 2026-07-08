export type SegmentationOutput = {
  intent: 'search' | 'filter_only' | 'general';
  filters: {
    city?: string;
    state?: string;
    type?: string;
    modality?: string;
    q?: string;
  };
  answerHint?: string;
};

export type RerankCandidate = {
  id: string;
  score: number;
};

export type AnalyzeResult = {
  answer: string;
  candidates: RerankCandidate[];
};

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AnalyzeInput = {
  prompt: string;
  filters?: {
    city?: string;
    state?: string;
    type?: string;
    modality?: string;
  };
};

export type TextChunk = {
  id: string;
  text: string;
  metadata: Record<string, string>;
};

export type RetrievalResult = {
  chunk: TextChunk;
  score: number;
};
