import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCw } from 'lucide-react';
import { useT } from '../../i18n';

const Fallback = () => {
  const t = useT('common');
  return (
    <div role="alert" className="container-site flex min-h-[70svh] flex-col justify-center py-section">
      <p className="label text-accent-ink">{t.errorLabel}</p>
      <h1 className="mt-6 max-w-[20ch] font-semiwide text-display-m font-semibold text-ink">{t.errorTitle}</h1>
      <p className="mt-5 max-w-prose text-lead text-ink-2">{t.errorBody}</p>
      <div className="mt-10">
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">
          <span>{t.errorReload}</span>
          <RotateCw aria-hidden="true" size={16} strokeWidth={1.6} className="btn-arrow" />
        </button>
      </div>
    </div>
  );
};

interface State {
  error: Error | null;
}

/**
 * Catches render errors and failed lazy chunk loads (network drop, or a new
 * deploy replacing old chunk files) and offers a reload instead of a blank page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[safwan.ch] render error', error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? <Fallback /> : this.props.children;
  }
}
