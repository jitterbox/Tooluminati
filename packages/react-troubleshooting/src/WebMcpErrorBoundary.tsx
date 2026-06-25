import { Component, type ErrorInfo, type ReactNode } from 'react';
import type {
  ClientErrorBuffer,
  TroubleshootingTimelineBuffer,
} from '@tooluminati/diagnostics';
import { useWebMcpTroubleshootingContext } from './WebMcpTroubleshootingContext';

export interface WebMcpErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  source?: string;
}

interface BoundaryProps extends WebMcpErrorBoundaryProps {
  errors: ClientErrorBuffer;
  timeline: TroubleshootingTimelineBuffer;
}

interface State {
  hasError: boolean;
}

class Boundary extends Component<BoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.errors.push({
      message: error.message,
      source:
        this.props.source ??
        info.componentStack?.split('\n')[1]?.trim() ??
        'react',
      timestamp: new Date().toISOString(),
      ...(error.stack ? { stack: error.stack } : {}),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export function WebMcpErrorBoundary({
  children,
  fallback,
  source,
}: WebMcpErrorBoundaryProps) {
  const { errors, timeline } = useWebMcpTroubleshootingContext();
  return (
    <Boundary
      errors={errors}
      timeline={timeline}
      fallback={fallback}
      {...(source ? { source } : {})}
    >
      {children}
    </Boundary>
  );
}
