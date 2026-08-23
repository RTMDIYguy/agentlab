import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
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
        <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-8">
          <div className="max-w-xl w-full bg-navy-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="font-poppins text-xl font-semibold text-rose-400 mb-2">Runtime Error Encountered</h2>
            <p className="font-mono text-sm bg-navy-950 p-4 rounded-lg border border-navy-800 text-rose-300 break-words mb-4">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 bg-cyan-500 text-navy-950 font-semibold rounded-lg hover:bg-cyan-400"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
