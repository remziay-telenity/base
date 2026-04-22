"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary — catches rendering errors in any child component.
 * Shows a fallback UI instead of a blank page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in development; swap for a real error reporter in production
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="bg-[#111] border border-red-900 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-red-400">Something went wrong</p>
          {this.state.error && (
            <p className="text-xs text-gray-500 font-mono break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="text-xs text-gray-400 hover:text-gray-200 underline transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
