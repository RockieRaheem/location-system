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
  2: "Subcounty",
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
    const id = setTimeout(() => {
      if (query.trim()) {
        setResults(search(data, indexes, query, 20));
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 120);
    return () => clearTimeout(id);
  }, [query, data, indexes]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(r: SearchResult) {
    onSelect(r);
    setQuery(r.name);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 shadow-sm focus-within:border-[#D90000] focus-within:ring-2 focus-within:ring-[#D90000]/20">
        <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={`Search ${country.name} districts, parishes, villages…`}
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          aria-label="Search"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-xl">
          {results.map((r, i) => (
            <li key={`${r.level}-${r.name}-${r.district}-${r.subcounty ?? ""}-${r.parish ?? ""}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(r)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  i === active ? "bg-black/5" : ""
                }`}
              >
                <span className="shrink-0 rounded bg-[#FCDC04]/90 px-1.5 py-0.5 text-[10px] font-bold uppercase text-black">
                  {LEVEL_LABEL[r.level]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-black">{r.name}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {[r.district, r.subcounty, r.parish].filter(Boolean).join(" › ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-3 text-sm text-gray-500 shadow-xl">
          No matches for “{query}”
        </div>
      )}
    </div>
  );
}
