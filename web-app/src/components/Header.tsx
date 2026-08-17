import type { CountryConfig } from "../types";
import type { Page } from "../lib/router";

interface Props {
  country: CountryConfig;
  title: string;
  subtitle: string;
  page?: Page;
  onNavigate?: (page: Page) => void;
  children?: React.ReactNode;
}

export function Header({ country, title, subtitle, page = "explorer", onNavigate, children }: Props) {
  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-semibold transition ${
      active ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
    }`;

  return (
    <header className="border-b border-black/10 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        <div
          className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-black/20 bg-white"
          aria-label={`${country.name} flag`}
          title="Official Uganda Flag with Crested Crane"
        >
          <img
            src="/uganda-flag.png"
            alt={`${country.name} flag`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-black sm:text-xl">{title}</h1>
          <p className="truncate text-xs text-gray-500">{subtitle}</p>
        </div>
        <nav className="flex shrink-0 items-center gap-1 rounded-lg border border-black/10 bg-black/5 p-1">
          <button
            type="button"
            onClick={() => onNavigate?.("explorer")}
            className={tabClass(page === "explorer")}
          >
            Explorer
          </button>
          <button type="button" onClick={() => onNavigate?.("map")} className={tabClass(page === "map")}>
            Map
          </button>
        </nav>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
