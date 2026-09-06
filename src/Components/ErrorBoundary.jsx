/* eslint-disable react/prop-types */
import { Component } from "react";

/**
 * Application-level Error Boundary.
 * Catches any unhandled JS errors in the component tree
 * and renders a graceful fallback instead of a blank page.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to a logging service here
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "1rem",
            color: "#f0f0f0",
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: "#cc0000", textTransform: "uppercase" }}>
            Something went wrong
          </p>
          <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", maxWidth: "400px" }}>
            Please refresh the page. If the problem persists, contact the team.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 1.6rem",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "inherit",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
