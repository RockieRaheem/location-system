import { useEffect, useRef, useState } from "react";
import type { CountryConfig, SearchResult, UgandaData } from "../types";
import { search, type SearchIndexes } from "../lib/uganda";

interface Props {
  country: CountryConfig;
  data: UgandaData;
  indexes: SearchIndexes;
  onSelect: (result: SearchResult) => void;
}

const LEVEL_LABEL: Record<number, string> = {
  1: "District",
  2: "Sub-county",
  3: "Parish",
  4: "Village",
};

export function SearchBox({ country, data, indexes, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (query.trim()) {
        setResults(search(data, indexes, query, 20));
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 140);
    return () => window.clearTimeout(id);
  }, [query, data, indexes]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function pick(result: SearchResult) {
    onSelect(result);
    setQuery(result.name);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && active >= 0 && results[active]) {
      pick(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-950/5">
        <svg className="h-[18px] w-[18px] shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Search districts, sub-counties, parishes and villages"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          aria-label={`Search ${country.name} administrative units`}
          aria-expanded={open}
          aria-controls="administrative-search-results"
        />
        <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">/</kbd>
      </div>

      {open && results.length > 0 && (
        <ul id="administrative-search-results" className="absolute z-50 mt-2 max-h-[min(28rem,65vh)] w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,.18)]">
          {results.map((result, index) => (
            <li key={`${result.level}-${result.name}-${result.district}-${result.subcounty ?? ""}-${result.parish ?? ""}-${index}`}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(result)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${index === active ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                  {LEVEL_LABEL[result.level]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{result.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {[result.district, result.subcounty, result.parish].filter(Boolean).join(" / ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 shadow-[0_24px_70px_rgba(15,23,42,.18)]">
          No administrative units match “{query}”.
        </div>
      )}
    </div>
  );
}
