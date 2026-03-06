import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
          <div className="bg-zinc-900 border border-red-500/30 p-6 rounded-xl max-w-lg w-full">
            <h1 className="text-xl font-bold text-red-400 mb-4">Algo deu errado</h1>
            <div className="bg-zinc-950 p-4 rounded-lg overflow-auto text-sm font-mono text-zinc-300 mb-4">
              {this.state.error?.toString()}
            </div>
            <p className="text-zinc-400 text-sm">
              Verifique o console do navegador para mais detalhes.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
