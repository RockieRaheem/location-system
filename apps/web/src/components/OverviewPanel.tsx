import { districtStats, getParishes, getVillages } from "../lib/uganda";
import type { Selection, UgandaData } from "../types";

interface Props {
  data: UgandaData;
  selection: Selection | null;
}

interface MetricItem {
  label: string;
  value: number;
}

function Metric({ label, value }: MetricItem) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-950/[0.02]">
      <p className="text-3xl font-semibold tracking-tight text-slate-950">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}

function getMetrics(data: UgandaData, selection: Selection | null): MetricItem[] {
  if (!selection) {
    return [
      { label: "Districts and cities", value: data.meta.counts.districts },
      { label: "Sub-counties and divisions", value: data.meta.counts.subcounties },
      { label: "Parishes and wards", value: data.meta.counts.parishes },
      { label: "Villages and cells", value: data.meta.counts.villages },
    ];
  }

  if (selection.village) return [];

  if (selection.parish && selection.subcounty) {
    return [
      {
        label: "Villages and cells",
        value: getVillages(data, selection.district, selection.subcounty, selection.parish).length,
      },
    ];
  }

  if (selection.subcounty) {
    const parishes = getParishes(data, selection.district, selection.subcounty);
    return [
      { label: "Parishes and wards", value: parishes.length },
      {
        label: "Villages and cells",
        value: parishes.reduce(
          (total, parish) =>
            total + getVillages(data, selection.district, selection.subcounty!, parish).length,
          0,
        ),
      },
    ];
  }

  const stats = districtStats(data, selection.district);
  return [
    { label: "Sub-counties and divisions", value: stats.subcounties },
    { label: "Parishes and wards", value: stats.parishes },
    { label: "Villages and cells", value: stats.villages },
  ];
}

export function OverviewPanel({ data, selection }: Props) {
  const path = selection
    ? [selection.district, selection.subcounty, selection.parish, selection.village].filter(Boolean)
    : ["Uganda"];
  const levelLabel = selection?.village
    ? "Village / Cell"
    : selection?.parish
      ? "Parish / Ward"
      : selection?.subcounty
        ? "Sub-county / Division"
        : selection?.district
          ? "District / City"
          : "Country";
  const parentPath = path.slice(0, -1);
  const metrics = getMetrics(data, selection);

  return (
    <section className="min-w-0 space-y-5" aria-label="Administrative overview">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.02]">
        <div className="h-1 bg-[linear-gradient(90deg,#111827_0_33%,#fcdc04_33%_66%,#d90000_66%)]" />
        <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{levelLabel}</p>
            <h2 className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-950">
              {path[path.length - 1]}
            </h2>
            {parentPath.length > 0 && (
              <p className="mt-2 truncate text-sm text-slate-500">{parentPath.join(" / ")}</p>
            )}
          </div>
          <p className="shrink-0 text-sm text-slate-500">
            Electoral Commission <span aria-hidden="true">·</span> July 2022
          </p>
        </div>
      </header>

      {metrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
      )}
    </section>
  );
}
