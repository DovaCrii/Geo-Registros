"use client";

import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
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
        <div className="rounded-xl border border-red-200 dark:border-rose-800/40 bg-red-50 dark:bg-rose-950/30 p-6 shadow-sm dark:shadow-xl dark:shadow-rose-950/10">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 dark:border-rose-500/20 bg-red-100 dark:bg-rose-500/10 text-danger dark:text-rose-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-rose-100">Error al cargar esta sección</h3>
              <p className="mt-1 text-sm leading-6 text-red-700 dark:text-rose-50/80">
                No se pudo mostrar el contenido. Puede ser un error temporal o que la base de datos no esté disponible. Recargá la página o intentá de nuevo.
              </p>
              <button
                onClick={this.handleRetry}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 dark:border-rose-500/30 bg-white dark:bg-rose-500/10 px-4 py-2 text-xs font-medium text-red-700 dark:text-rose-200 transition hover:bg-red-50 dark:hover:border-rose-400/50 dark:hover:bg-rose-400/20"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
