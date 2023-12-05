import React from "react";

import { ErrorBoundaryFallback } from "./ErrorBoundaryFallback";

export interface ErrorBoundaryFallbackProps {
  clearError: () => void;
  error: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.FC<ErrorBoundaryFallbackProps>;
  report: (error: Error, errorInfo: React.ErrorInfo) => void | Promise<void>;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static defaultProps = {
    fallback: ErrorBoundaryFallback,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError = (error: Error) => {
    return { error };
  };

  componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
    this.props.report(error, errorInfo);
  };

  clearError = () => {
    this.setState({
      error: null,
    });
  };

  render = () => {
    const { error } = this.state;

    if (error === null) return this.props.children;

    return this.props.fallback({
      error,
      clearError: this.clearError,
    });
  };
}
