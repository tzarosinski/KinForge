/**
 * ERROR BOUNDARY COMPONENT
 * 
 * Catches React component errors and prevents complete page crashes.
 * Shows a friendly error UI with recovery options.
 * 
 * Usage: Wrap components that might throw errors
 * <ErrorBoundary fallback={<CustomError />}>
 *   <UnstableComponent />
 * </ErrorBoundary>
 * 
 * Philosophy: "The show must go on" - never show a blank screen.
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console for debugging
    console.error('🚨 ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show toast notification
    toast.error('A component encountered an error', {
      duration: 5000,
      style: {
        background: '#0B0F19',
        color: '#EF4444',
        border: '2px solid #EF4444'
      }
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="glass-panel max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Something Went Wrong
            </h2>

            <p className="text-slate-300 mb-2">
              A component encountered an unexpected error.
            </p>

            <p className="text-slate-400 text-sm mb-6">
              Your progress has been saved. Try reloading the page.
            </p>

            {/* Error details (collapsed by default) */}
            {this.state.error && (
              <details className="text-left mb-6 bg-slate-900/50 rounded p-4">
                <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">
                  Technical Details (for debugging)
                </summary>
                <pre className="text-xs text-red-400 mt-3 overflow-x-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-forge-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-6 py-3 border-2 border-forge-gold text-forge-gold hover:bg-forge-gold hover:text-forge-dark rounded-lg font-semibold transition-all"
              >
                ↻ Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}
