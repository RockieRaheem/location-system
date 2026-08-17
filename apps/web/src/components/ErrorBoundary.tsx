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
        <main className="flex h-screen items-center justify-center bg-slate-100 p-5">
          <section className="surface-card w-full max-w-lg p-8 text-center sm:p-10">
          <span className="mx-auto flex h-12 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <img
              src="/uganda-flag.png"
              alt="Uganda flag"
              className="h-full w-full object-cover"
            />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-red-700">Unable to continue</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">The workspace encountered a problem</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{this.state.error.message}</p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="control-button control-button-primary"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={this.resetData}
              className="control-button"
            >
              Reset stored data & reload
            </button>
          </div>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
