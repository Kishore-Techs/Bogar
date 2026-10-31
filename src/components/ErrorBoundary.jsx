import React from 'react';
import LotusLogo from './LotusLogo';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#f6f1e8',
            background: '#16110f',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <LotusLogo size={56} color="#D4B675" />
          </div>
          <h2
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontSize: '1.8rem',
              color: '#d4b675',
              marginBottom: 12,
              letterSpacing: '1px',
            }}
          >
            Sacred Serenity
          </h2>
          <p
            style={{
              maxWidth: 480,
              fontSize: '0.95rem',
              color: '#c4baa9',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            A momentary disturbance occurred while displaying this section. Please return to the homepage or reload.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              background: 'linear-gradient(135deg, #c5a059, #8c6f37)',
              color: '#120f0d',
              fontWeight: 600,
              border: 'none',
              padding: '12px 28px',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(197, 160, 89, 0.3)',
            }}
          >
            Return to Sacred Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
