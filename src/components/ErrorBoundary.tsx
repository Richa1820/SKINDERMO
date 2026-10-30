import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SKINDERMO ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-6 sm:p-8 shadow-card text-charcoal-900 space-y-4 my-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0 text-rose-800">
              <AlertOctagon className="w-5 h-5 text-rose-700" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-rose-950">
                {this.props.fallbackTitle || 'Rendering Error in Analysis Workspace'}
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                An unexpected component error occurred while rendering the interface.
                The application has recovered safely to prevent a blank screen.
              </p>
              {this.state.error && (
                <div className="p-3 bg-white/90 border border-rose-200 rounded-lg font-mono text-xs text-rose-800 break-words mt-2">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{this.state.error.name}: {this.state.error.message}</span>
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2 text-[11px] text-charcoal-600">
                      <summary className="cursor-pointer hover:text-charcoal-900 font-sans">
                        View component stack trace
                      </summary>
                      <pre className="mt-2 p-2 bg-canvas-100 rounded text-[10px] overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-rose-200">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-900 text-white font-medium text-xs shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
