import { useEffect, useState } from "react";
import type { CountryConfig, Selection, UgandaData } from "../types";
import {
  getDistricts,
  getParishes,
  getSubcounties,
  getVillages,
  districtStats,
} from "../lib/uganda";
import type { UnitPath } from "../lib/admin";
import type { Theme } from "../theme";

interface Props {
  country: CountryConfig;
  theme: Theme;
  data: UgandaData;
  selection: Selection | null;
  onSelect: (level: number, name: string) => void;
  onReset: () => void;
  isAdmin: boolean;
  onRename: (path: UnitPath, newName: string) => void;
  onAddChild: (parentPath: UnitPath, level: number, name: string) => void;
  onDelete: (path: UnitPath) => void;
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

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-black/5 hover:text-black"
    >
      {children}
    </button>
  );
}

export function SidePanel({
  country,
  theme,
  data,
  selection,
  onSelect,
  onReset,
  isAdmin,
  onRename,
  onAddChild,
  onDelete,
}: Props) {
  const depth = selection
    ? selection.village
      ? 4
      : selection.parish
        ? 3
        : selection.subcounty
          ? 2
          : 1
    : 0;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState("");

  const selectionKey = selection
    ? `${selection.district}|${selection.subcounty ?? ""}|${selection.parish ?? ""}|${selection.village ?? ""}`
    : "";
  useEffect(() => {
    setEditing(false);
    setAdding(false);
  }, [selectionKey]);

  let title: string;
  let badge: string;
  let stats: Array<{ label: string; value: number }> = [];
  let rows: Array<{ name: string; meta?: string }> = [];
  let onRowClick: (name: string) => void = () => {};

  if (depth === 0) {
    const c = data.meta.counts;
    title = country.name;
    badge = "Country";
    stats = [
      { label: "Districts", value: c.districts },
      { label: "Subcounties", value: c.subcounties },
      { label: "Parishes", value: c.parishes },
      { label: "Villages", value: c.villages },
    ];
    rows = getDistricts(data).map((d) => ({ name: d, meta: undefined }));
    onRowClick = (name) => onSelect(1, name);
  } else if (depth === 1) {
    const d = selection!.district;
    const st = districtStats(data, d);
    title = d;
    badge = "District";
    stats = [
      { label: "Subcounties", value: st.subcounties },
      { label: "Parishes", value: st.parishes },
      { label: "Villages", value: st.villages },
    ];
    rows = getSubcounties(data, d).map((sc) => {
      const p = getParishes(data, d, sc);
      const v = p.reduce((n, par) => n + getVillages(data, d, sc, par).length, 0);
      return { name: sc, meta: `${p.length} parishes · ${v} villages` };
    });
    onRowClick = (name) => onSelect(2, name);
  } else if (depth === 2) {
    const { district: d, subcounty: sc } = selection!;
    const ps = getParishes(data, d, sc!);
    stats = [
      { label: "Parishes", value: ps.length },
      {
        label: "Villages",
        value: ps.reduce((n, p) => n + getVillages(data, d, sc!, p).length, 0),
      },
    ];
    title = sc!;
    badge = "Subcounty";
    rows = ps.map((p) => ({
      name: p,
      meta: `${getVillages(data, d, sc!, p).length} villages`,
    }));
    onRowClick = (name) => onSelect(3, name);
  } else if (depth === 3) {
    const { district: d, subcounty: sc, parish: p } = selection!;
    const vs = getVillages(data, d, sc!, p!);
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

  const unitPath: UnitPath = selection
    ? {
        district: selection.district,
        subcounty: selection.subcounty,
        parish: selection.parish,
        village: selection.village,
      }
    : { district: "" };

  const addChildLevel = depth < 4 ? depth + 1 : 0;
  const addChildLabel = addChildLevel ? country.levels[addChildLevel - 1].label : "";

  function submitRename() {
    const v = editValue.trim().toUpperCase();
    if (v) onRename(unitPath, v);
    setEditing(false);
  }

  function submitAdd() {
    const v = addValue.trim().toUpperCase();
    if (v && addChildLevel) onAddChild(unitPath, addChildLevel, v);
    setAdding(false);
    setAddValue("");
  }

  function submitDelete() {
    if (!selection) return;
    const label = badge.toLowerCase();
    if (window.confirm(`Delete ${label} "${title}" and all of its children?`)) {
      onDelete(unitPath);
    }
  }

  function goUp() {
    if (!selection) return;
    if (selection.village) onSelect(3, selection.parish!);
    else if (selection.parish) onSelect(2, selection.subcounty!);
    else if (selection.subcounty) onSelect(1, selection.district);
    else onReset();
  }

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="border-b border-black/10 px-4 py-3" style={{ background: theme.primarySoft }}>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                if (e.key === "Escape") setEditing(false);
              }}
              className="min-w-0 flex-1 rounded-md border border-black/20 px-2 py-1 text-sm font-semibold text-black outline-none focus:border-[#D90000]"
              aria-label="Rename"
            />
            <button
              type="button"
              onClick={submitRename}
              className="rounded-md bg-[#D90000] px-2 py-1 text-xs font-bold text-white hover:bg-[#B00000]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ background: theme.accent }}
            >
              {badge}
            </span>
            <h2 className="truncate text-base font-bold text-black">{title}</h2>
            {isAdmin && depth > 0 && (
              <IconButton onClick={() => { setEditValue(title); setEditing(true); }} title="Rename">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </IconButton>
            )}
          </div>
        )}
        {isAdmin && (
          <p className="mt-1 text-[11px] text-gray-500">
            <span className="font-semibold text-[#D90000]">Admin mode</span>
          </p>
        )}
        {!editing && depth > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={goUp}
              className="shrink-0 rounded-md bg-black/5 px-2 py-1 text-xs font-semibold text-gray-700 transition hover:bg-black/10"
              title={depth > 1 ? `Back to ${country.levels[depth - 2].label.toLowerCase()}` : "Back to all districts"}
            >
              ← Back
            </button>
            <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-[11px] text-gray-500">
              <button
                type="button"
                onClick={onReset}
                className="shrink-0 font-semibold text-gray-400 transition hover:text-black"
              >
                All districts
              </button>
              {depth >= 2 && <span className="shrink-0 text-gray-300">›</span>}
              {depth >= 2 && (
                <button
                  type="button"
                  onClick={() => onSelect(1, selection!.district)}
                  className="shrink-0 truncate font-medium transition hover:text-black"
                >
                  {selection!.district}
                </button>
              )}
              {depth >= 3 && <span className="shrink-0 text-gray-300">›</span>}
              {depth >= 3 && (
                <button
                  type="button"
                  onClick={() => onSelect(2, selection!.subcounty!)}
                  className="shrink-0 truncate font-medium transition hover:text-black"
                >
                  {selection!.subcounty}
                </button>
              )}
              {depth >= 4 && <span className="shrink-0 text-gray-300">›</span>}
              {depth >= 4 && (
                <button
                  type="button"
                  onClick={() => onSelect(3, selection!.parish!)}
                  className="shrink-0 truncate font-medium transition hover:text-black"
                >
                  {selection!.parish}
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-b border-black/10 px-4 py-3">
          {stats.map((s) => (
            <StatChip key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {isAdmin && addChildLevel > 0 && (
        <div className="border-b border-black/10 px-4 py-2">
          {adding ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitAdd();
                  if (e.key === "Escape") setAdding(false);
                }}
                placeholder={`New ${addChildLabel} name…`}
                className="min-w-0 flex-1 rounded-md border border-black/20 px-2 py-1 text-sm outline-none focus:border-[#D90000]"
                aria-label={`New ${addChildLabel}`}
              />
              <button
                type="button"
                onClick={submitAdd}
                className="rounded-md bg-[#D90000] px-2 py-1 text-xs font-bold text-white hover:bg-[#B00000]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 rounded-md border border-dashed border-[#D90000]/50 px-3 py-1.5 text-sm font-semibold text-[#D90000] transition hover:bg-[#D90000]/5"
            >
              <span className="text-base leading-none">＋</span> Add {addChildLabel}
            </button>
          )}
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

      {isAdmin && depth > 0 && (
        <div className="border-t border-black/10 p-3">
          <button
            type="button"
            onClick={submitDelete}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#D90000]/40 px-3 py-1.5 text-sm font-semibold text-[#D90000] transition hover:bg-[#D90000]/5"
          >
            Delete this {badge.toLowerCase()}
          </button>
        </div>
      )}
    </aside>
  );
}
