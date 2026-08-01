import type { CountryConfig, Selection } from "../types";
import {
  getDistricts,
  getParishes,
  getSubcounties,
  getVillages,
  districtStats,
  ugData,
} from "../lib/uganda";
import type { Theme } from "../theme";

interface Props {
  country: CountryConfig;
  theme: Theme;
  selection: Selection | null;
  onSelect: (level: number, name: string) => void;
  onReset: () => void;
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2">
      <div className="text-lg font-bold text-black">{value.toLocaleString()}</div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

function UnitRow({
  name,
  meta,
  onClick,
  index,
}: {
  name: string;
  meta?: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-black/5 ${
          index % 2 === 1 ? "bg-black/[0.02]" : ""
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-black group-hover:text-[#D90000]">
            {name}
          </span>
          {meta && <span className="block truncate text-xs text-gray-500">{meta}</span>}
        </span>
        <svg className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-[#D90000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </li>
  );
}

export function SidePanel({ country, theme, selection, onSelect, onReset }: Props) {
  const depth = selection
    ? selection.village
      ? 4
      : selection.parish
        ? 3
        : selection.subcounty
          ? 2
          : 1
    : 0;

  let title: string;
  let badge: string;
  let stats: Array<{ label: string; value: number }>;
  let rows: Array<{ name: string; meta?: string }> = [];
  let onRowClick: (name: string) => void = () => {};

  if (depth === 0) {
    const c = ugData.meta.counts;
    title = country.name;
    badge = "Country";
    stats = [
      { label: "Districts", value: c.districts },
      { label: "Subcounties", value: c.subcounties },
      { label: "Parishes", value: c.parishes },
      { label: "Villages", value: c.villages },
    ];
    rows = getDistricts().map((d) => ({ name: d, meta: undefined }));
    onRowClick = (name) => onSelect(1, name);
  } else if (depth === 1) {
    const d = selection!.district;
    const st = districtStats(d);
    title = d;
    badge = "District";
    stats = [
      { label: "Subcounties", value: st.subcounties },
      { label: "Parishes", value: st.parishes },
      { label: "Villages", value: st.villages },
    ];
    rows = getSubcounties(d).map((sc) => {
      const p = getParishes(d, sc);
      const v = p.reduce((n, par) => n + getVillages(d, sc, par).length, 0);
      return { name: sc, meta: `${p.length} parishes · ${v} villages` };
    });
    onRowClick = (name) => onSelect(2, name);
  } else if (depth === 2) {
    const { district: d, subcounty: sc } = selection!;
    const ps = getParishes(d, sc!);
    stats = [
      { label: "Parishes", value: ps.length },
      {
        label: "Villages",
        value: ps.reduce((n, p) => n + getVillages(d, sc!, p).length, 0),
      },
    ];
    title = sc!;
    badge = "Subcounty";
    rows = ps.map((p) => ({
      name: p,
      meta: `${getVillages(d, sc!, p).length} villages`,
    }));
    onRowClick = (name) => onSelect(3, name);
  } else if (depth === 3) {
    const { district: d, subcounty: sc, parish: p } = selection!;
    const vs = getVillages(d, sc!, p!);
    title = p!;
    badge = "Parish";
    stats = [{ label: "Villages", value: vs.length }];
    rows = vs.map((v) => ({ name: v, meta: "Village" }));
    onRowClick = (name) => onSelect(4, name);
  } else {
    title = selection!.village!;
    badge = "Village";
    stats = [];
    rows = [];
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-3" style={{ background: theme.primarySoft }}>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ background: theme.accent }}
          >
            {badge}
          </span>
          <h2 className="truncate text-base font-bold text-black">{title}</h2>
          {depth > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold text-gray-500 transition hover:bg-black/5 hover:text-black"
            >
              Reset
            </button>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          {country.dataSource} · {country.dataYear}
        </p>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-b border-black/10 px-4 py-3">
          {stats.map((s) => (
            <StatChip key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            {depth === 4
              ? "This is the deepest administrative level. The full path is shown in the breadcrumb above."
              : "No child units."}
          </p>
        ) : (
          <ul className="py-1">
            {rows.map((r, i) => (
              <UnitRow key={r.name} name={r.name} meta={r.meta} index={i} onClick={() => onRowClick(r.name)} />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
