import { Component } from "react";
import { LifeBuoy } from "lucide-react";

/**
 * Last line of defence: without this, one bad render blanks the whole app and a
 * letter looks lost. Class component because React has no hook equivalent.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center py-20 text-center">
        <LifeBuoy className="mb-4 h-10 w-10 text-gold/60" />
        <h1 className="font-display text-3xl text-gold">Taken by the sea</h1>
        <p className="mt-2 max-w-md text-text-secondary">
          Something went overboard on this page. Nothing you've sealed is lost — reload
          and we'll pick the course back up.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-gold transition hover:bg-gold hover:text-ocean"
        >
          Reload the deck
        </button>
      </div>
    );
  }
}
