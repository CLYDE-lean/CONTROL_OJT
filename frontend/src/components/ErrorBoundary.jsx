import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1.5rem',
          margin: '1rem 0',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '10px',
          color: '#991b1b',
          fontSize: '0.85rem'
        }}>
          <strong>⚠️ Se produjo un inconveniente al cargar esta sección.</strong>
          <p style={{ margin: '0.3rem 0 0 0', color: '#7f1d1d' }}>
            {this.state.error?.toString() || 'Ha ocurrido un error inesperado.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
