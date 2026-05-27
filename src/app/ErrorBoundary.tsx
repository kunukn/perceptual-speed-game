import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = (): void => {
    document.location.href = import.meta.env.BASE_URL;
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-vhdvh flex flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <h1 className="text-lg font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-slate-700">
          The app hit an unexpected error. Try reloading to start fresh.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }
}
