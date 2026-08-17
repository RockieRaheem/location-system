import { Component, type ReactNode } from "react";
import { clearAllStorage } from "../lib/storage";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private resetData = () => {
    clearAllStorage();
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#f7f7f5] p-6 text-center">
          <span className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-sm border border-black/20 bg-white">
            <img
              src="/uganda-flag.png"
              alt="Uganda flag"
              className="h-full w-full object-cover"
            />
          </span>
          <h1 className="text-lg font-bold text-black">Something went wrong</h1>
          <p className="max-w-md text-sm text-gray-600">{this.state.error.message}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-md bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.resetData}
              className="rounded-md border border-black/15 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-black/5"
            >
              Reset stored data & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
