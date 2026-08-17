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

function NavIcon({ map }: { map?: boolean }) {
  return map ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6" />
    </svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h10M4 19h7" />
      <circle cx="18" cy="12" r="2.5" />
    </svg>
  );
}

export function Header({ country, title, subtitle, page = "explorer", onNavigate, children }: Props) {
  const tabClass = (active: boolean) =>
    `inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${
      active
        ? "bg-slate-950 text-white shadow-sm"
        : "text-slate-500 hover:bg-white hover:text-slate-950"
    }`;

  return (
    <header className="relative z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="h-1 bg-[linear-gradient(90deg,#111827_0_33%,#fcdc04_33%_66%,#d90000_66%)]" />
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1 shadow-sm">
            <img src="/uganda-flag.png" alt={`${country.name} flag`} className="h-7 w-9 rounded-[3px] object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-950 sm:text-base">{title}</h1>
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 sm:inline">Live</span>
            </div>
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <nav className="order-3 flex w-full items-center gap-1 rounded-2xl bg-slate-100 p-1 sm:order-none sm:w-auto" aria-label="Primary navigation">
          <button type="button" onClick={() => onNavigate?.("explorer")} className={`${tabClass(page === "explorer")} flex-1 sm:flex-none`} aria-current={page === "explorer" ? "page" : undefined}>
            <NavIcon /> Hierarchy
          </button>
          <button type="button" onClick={() => onNavigate?.("map")} className={`${tabClass(page === "map")} flex-1 sm:flex-none`} aria-current={page === "map" ? "page" : undefined}>
            <NavIcon map /> Map workspace
          </button>
        </nav>

        <div className="ml-auto flex min-w-0 items-center justify-end gap-2">{children}</div>
      </div>
    </header>
  );
}
