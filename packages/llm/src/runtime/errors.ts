export class LandmapLlmError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code = 'LANDMAP_LLM_ERROR', cause?: unknown) {
    super(message);
    this.name = 'LandmapLlmError';
    this.code = code;
    this.cause = cause;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      cause: this.cause instanceof Error ? { name: this.cause.name, message: this.cause.message } : this.cause,
    };
  }
}

export function invalidConfigError(detail: string) {
  return new LandmapLlmError(`Invalid LLM config: ${detail}`, 'INVALID_CONFIG');
}

export function llmServiceError(detail: string, cause?: unknown) {
  return new LandmapLlmError(`LLM service error: ${detail}`, 'LLM_SERVICE_ERROR', cause);
}

export function vectorServiceError(detail: string, cause?: unknown) {
  return new LandmapLlmError(`Vector service error: ${detail}`, 'VECTOR_SERVICE_ERROR', cause);
}

export function pipelineError(detail: string, cause?: unknown) {
  return new LandmapLlmError(`Pipeline error: ${detail}`, 'PIPELINE_ERROR', cause);
}

export function isLandmapLlmError(error: unknown): error is LandmapLlmError {
  return error instanceof LandmapLlmError;
}
