import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>
                    <h2 style={{ color: 'var(--danger)' }}>Something went wrong.</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1rem' }}>The application encountered an unexpected error.</p>
                    <pre style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1rem',
                        borderRadius: '8px',
                        overflow: 'auto',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        marginBottom: '1rem'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        className="btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
