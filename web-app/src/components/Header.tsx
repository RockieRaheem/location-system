import type { CountryConfig } from "../types";

interface Props {
  country: CountryConfig;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function Header({ country, title, subtitle, children }: Props) {
  return (
    <header className="border-b border-black/10 bg-white shadow-sm">
      <div className="flex h-1.5">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-[#FCDC04]" />
        <div className="flex-1 bg-[#D90000]" />
      </div>
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        <div
          className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-black/20"
          aria-label={`${country.name} flag`}
        >
          <div className="flex h-full w-full flex-col">
            <div className="flex-1" style={{ background: country.flagColors.primary }} />
            <div className="flex-1" style={{ background: country.flagColors.secondary }} />
            <div className="flex-1" style={{ background: country.flagColors.accent }} />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-black sm:text-xl">{title}</h1>
          <p className="truncate text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
