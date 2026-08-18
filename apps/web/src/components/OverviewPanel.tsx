import type { Selection, UgandaData } from "../types";
import { getBudgetSummary } from "../lib/budget";

interface Props {
  data: UgandaData;
  selection: Selection | null;
  isAdmin: boolean;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="surface-card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

export function OverviewPanel({ data, selection, isAdmin }: Props) {
  const path = selection
    ? [selection.district, selection.subcounty, selection.parish, selection.village].filter(Boolean)
    : ["Uganda"];
  const budgetPath = selection
    ? {
        district: selection.district,
        subcounty: selection.subcounty,
        parish: selection.parish,
        village: selection.village,
      }
    : { district: "" };
  const budget = getBudgetSummary(data, budgetPath);
  const allocatedPercent = budget.unitBudget
    ? Math.min(100, Math.round((budget.childBudget / budget.unitBudget) * 100))
    : 0;
  const levelLabel = selection?.village
    ? "Village / Cell"
    : selection?.parish
      ? "Parish / Ward"
      : selection?.subcounty
        ? "Sub-county / Division"
        : selection?.district
          ? "District / City"
          : "National overview";
  const parentPath = path.slice(0, -1);

  return (
    <section className="min-w-0 space-y-5" aria-label="Administrative overview">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-1 bg-[linear-gradient(90deg,#111827_0_33%,#fcdc04_33%_66%,#d90000_66%)]" />
        <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{levelLabel}</p>
            <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {path[path.length - 1]}
            </h2>
            {selection ? (
              <p className="mt-2 text-sm text-slate-500">
                {parentPath.length > 0 ? parentPath.join(" / ") : "Uganda"}
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse Uganda's administrative structure and review allocations across every level.
              </p>
            )}
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-3 border-t border-slate-100 pt-5 text-sm lg:border-l lg:border-t-0 lg:py-1 lg:pl-8">
            <div>
              <dt className="text-xs text-slate-400">Data source</dt>
              <dd className="mt-1 font-medium text-slate-700">Electoral Commission</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Reference date</dt>
              <dd className="mt-1 font-medium text-slate-700">July 2022</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Districts" value={data.meta.counts.districts.toLocaleString()} detail="Districts and cities" />
        <Metric label="Sub-counties" value={data.meta.counts.subcounties.toLocaleString()} detail="Including divisions" />
        <Metric label="Parishes" value={data.meta.counts.parishes.toLocaleString()} detail="Including wards" />
        <Metric label="Villages" value={data.meta.counts.villages.toLocaleString()} detail="Including cells" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <article className="surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Allocation health</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Budget distribution</h3>
            </div>
            <span className="text-sm font-semibold text-slate-700">{allocatedPercent}% allocated</span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-600 transition-all" style={{ width: `${allocatedPercent}%` }} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><p className="data-label">Approved</p><p className="data-value">UGX {budget.unitBudget.toLocaleString()}</p></div>
            <div><p className="data-label">Distributed</p><p className="data-value">UGX {budget.childBudget.toLocaleString()}</p></div>
            <div><p className="data-label">Available</p><p className="data-value text-emerald-700">UGX {budget.remaining.toLocaleString()}</p></div>
          </div>
          {!budget.unitBudget && (
            <div className="notice mt-5">No allocation has been approved for this level yet.</div>
          )}
        </article>

        <article className="surface-card p-6">
          <p className="eyebrow">Workspace</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{isAdmin ? "Administrator mode" : "Public view"}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {isAdmin
              ? "Changes are staged locally with undo support. Review hierarchy impact and allocation totals before export."
              : "Browse approved units and published allocations. Sign in with authorized credentials to manage records."}
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            <span className={`h-2.5 w-2.5 rounded-full ${isAdmin ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span className="text-sm font-medium text-slate-700">{isAdmin ? "Editing enabled" : "Read-only and safe"}</span>
          </div>
        </article>
      </div>
    </section>
  );
}
