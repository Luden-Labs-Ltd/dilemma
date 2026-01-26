import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1d2b] px-4">
      <div className="max-w-md rounded-2xl bg-white/10 p-8 text-center text-white backdrop-blur-sm">
        <h1 className="mb-4 text-2xl font-bold">{t("error.title", { defaultValue: "Something went wrong" })}</h1>
        <p className="mb-6 text-gray-300">
          {t("error.message", { defaultValue: "An unexpected error occurred. Please refresh the page." })}
        </p>
        {error && import.meta.env.DEV && (
          <details className="mb-4 text-left text-sm text-gray-400">
            <summary className="cursor-pointer font-semibold">Error details</summary>
            <pre className="mt-2 overflow-auto rounded bg-black/20 p-2">{error.message}</pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-white transition-colors hover:bg-cyan-600"
        >
          {t("error.reload", { defaultValue: "Reload page" })}
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
