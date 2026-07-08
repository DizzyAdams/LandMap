export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  data?: Record<string, unknown>;
};

let minLevel: LogLevel = 'info';
let correlationId = () => Math.random().toString(36).slice(2, 10);
let sink: (entry: LogEntry) => void = (entry) => {
  if (typeof console !== 'undefined') {
    const meta = entry.data && Object.keys(entry.data).length > 0 ? JSON.stringify(entry.data) : '';
    console.log(
      `${entry.timestamp} [${entry.level}] ${entry.message}${entry.correlationId ? ` (${entry.correlationId})` : ''}${meta ? ` ${meta}` : ''}`,
    );
  }
};

export function setLogLevel(level: LogLevel) {
  minLevel = level;
}

export function setLogCorrelationId(value: string) {
  correlationId = () => value;
}

export function setLogSink(next: (entry: LogEntry) => void) {
  sink = next;
}

function shouldLog(level: LogLevel) {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
  if (!shouldLog(level)) return;
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: correlationId(),
    data,
  };
  sink(entry);
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => emit('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => emit('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => emit('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => emit('error', message, data),
};
