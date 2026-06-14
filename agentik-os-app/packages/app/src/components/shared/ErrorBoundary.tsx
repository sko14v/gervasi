import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-radius-xl border border-danger/20 bg-danger/5 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-title-3 text-label-primary">
            Algo salió mal
          </h3>
          <p className="mt-2 max-w-md text-callout text-label-secondary">
            {this.state.error?.message || 'Ha ocurrido un error inesperado al renderizar este componente.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-radius-md bg-surface border border-separator px-4 py-2 text-subhead font-medium text-label-primary transition hover:bg-tint"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
