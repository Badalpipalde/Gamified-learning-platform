import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-text)'
        }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-danger)', marginBottom: '16px' }}>Oops! Something went wrong.</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            We're sorry, but the application encountered an unexpected error.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
