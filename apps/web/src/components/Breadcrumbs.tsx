export interface Crumb {
  label: string;
  onClick: () => void;
}

interface Props {
  crumbs: Crumb[];
  onReset: () => void;
}

export function Breadcrumbs({ crumbs, onReset }: Props) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-4 py-2 text-sm" aria-label="Breadcrumb">
      <button
        type="button"
        onClick={onReset}
        className="rounded px-1.5 py-0.5 font-medium text-gray-500 transition hover:bg-black/5 hover:text-black"
      >
        Uganda
      </button>
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex shrink-0 items-center gap-1">
          <span className="text-gray-300">/</span>
          <button
            type="button"
            onClick={c.onClick}
            className={
              i === crumbs.length - 1
                ? "rounded px-1.5 py-0.5 font-semibold text-[#D90000]"
                : "rounded px-1.5 py-0.5 font-medium text-gray-500 transition hover:bg-black/5 hover:text-black"
            }
          >
            {c.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
