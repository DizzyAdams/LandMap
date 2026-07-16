'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from './lovable/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="flex min-h-[40vh] items-center justify-center bg-[var(--card)] px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--destructive)]/30 bg-[var(--destructive)]/10">
              <AlertTriangle className="h-6 w-6 text-[var(--destructive)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Algo deu errado
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Ocorreu um erro inesperado ao carregar esta seção.
            </p>
            {this.state.error && (
              <p className="mt-2 max-h-20 overflow-auto text-[11px] text-[var(--muted-foreground)] font-mono">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
