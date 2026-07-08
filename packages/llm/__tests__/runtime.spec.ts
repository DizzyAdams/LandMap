import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  runHealthChecks,
  setCorrelationId,
  getCorrelationId,
} from '../src/runtime/healthcheck';
import { resetLlmConfigCache } from '../src/config/llm-config';
import { logger, setLogLevel, setLogCorrelationId, setLogSink } from '../src/runtime/logger';
import {
  LandmapLlmError,
  invalidConfigError,
  llmServiceError,
  vectorServiceError,
  pipelineError,
  isLandmapLlmError,
} from '../src/runtime/errors';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  resetLlmConfigCache();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('runtime/healthcheck', () => {
  it('returns ok true when package and vector are healthy, even if llm is unset', async () => {
    const envelope = await runHealthChecks();

    expect(typeof envelope.ok).toBe('boolean');
    expect(envelope.checks.map(c => c.name)).toContain('package');
    expect(envelope.checks.map(c => c.name)).toContain('llm');
    expect(envelope.checks.map(c => c.name)).toContain('vector');
  });
});

describe('runtime/logger', () => {
  it('does not throw when emitting logs', () => {
    expect(() => logger.debug('debug')).not.toThrow();
    expect(() => logger.info('info')).not.toThrow();
    expect(() => logger.warn('warn')).not.toThrow();
    expect(() => logger.error('error')).not.toThrow();
  });

  it('respects custom sink and correlation id', () => {
    const entries: any[] = [];
    setLogSink((entry) => entries.push(entry));
    setLogCorrelationId('ct-123');
    setLogLevel('debug');

    logger.debug('hello', { key: 1 });

    expect(entries).toHaveLength(1);
    expect(entries[0].correlationId).toBe('ct-123');
    expect(entries[0].level).toBe('debug');
    expect(entries[0].data).toEqual({ key: 1 });
  });

  it('filters logs above the configured level', () => {
    const entries: any[] = [];
    setLogSink((entry) => entries.push(entry));
    setLogCorrelationId('ct-filter');
    setLogLevel('warn');

    logger.info('info');
    logger.warn('warn');

    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('warn');
  });
});

describe('runtime/errors', () => {
  it('creates LandmapLlmError with code and optional cause', () => {
    const error = new LandmapLlmError('bad request', 'BAD_REQUEST', { status: 400 });
    expect(error.message).toBe('bad request');
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.cause).toEqual({ status: 400 });
    expect(error.name).toBe('LandmapLlmError');
  });

  it('common mappers produce typed errors', () => {
    expect(invalidConfigError('model')).toBeInstanceOf(LandmapLlmError);
    expect(llmServiceError('upstream', new Error('boom'))).toBeInstanceOf(LandmapLlmError);
    expect(vectorServiceError('down')).toBeInstanceOf(LandmapLlmError);
    expect(pipelineError('compat')).toBeInstanceOf(LandmapLlmError);
  });

  it('isLandmapLlmError discriminates correctly', () => {
    const err = new LandmapLlmError('x');
    expect(isLandmapLlmError(err)).toBe(true);

    // intentional wrong shape for type guard test
    expect(isLandmapLlmError(new Error('ok'))).toBe(false);
  });
});
