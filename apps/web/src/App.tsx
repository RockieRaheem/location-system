import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { SearchBox } from "./components/SearchBox";
import { SidePanel } from "./components/SidePanel";
import { MapPage } from "./components/MapPage";
import { OverviewPanel } from "./components/OverviewPanel";
import { uganda } from "./countries/uganda";
import { themeFromFlag } from "./theme";
import { getDistrictMap } from "./lib/geo";
import { useAppRoute, navigate } from "./lib/router";
import { cloneData, buildSearchIndexes } from "./lib/uganda";
import {
  addDistrict,
  addSubcounty,
  addParish,
  addVillage,
  renameDistrict,
  renameSubcounty,
  renameParish,
  renameVillage,
  deleteDistrict,
  deleteSubcounty,
  deleteParish,
  deleteVillage,
  type UnitPath,
} from "./lib/admin";
import {
  loadSnapshot,
  saveSnapshot,
  clearSnapshot,
  downloadData,
  parseImportedData,
} from "./lib/storage";
import type { UgandaData, SearchResult, Selection } from "./types";

const ADMIN_EMAIL = "admin@uganda.gov";
const ADMIN_PASSWORD = "admin123";
const MAX_UNDO = 20;

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    // ignore
  }
  document.body.removeChild(ta);
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        copyText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="control-button"
      title="Copy a link to this view"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError("The email or password was not recognized. Check your details and try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={onClose} role="presentation">
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_32px_100px_rgba(2,6,23,.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <div className="bg-slate-950 p-7 text-white">
          <span className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white">
            <img
              src="/uganda-flag.png"
              alt="Uganda flag"
              className="h-full w-full object-cover"
            />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Secure administration</p>
          <h2 id="admin-login-title" className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Sign in to manage Uganda's administrative location records.</p>
        </div>
        <div className="p-7">
        <label className="block text-sm font-semibold text-slate-700">
          Work email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-normal text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
            autoFocus
          />
        </label>
        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-normal text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
          />
        </label>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700" role="alert">{error}</p>}
        <div className="mt-7 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="control-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="control-button control-button-accent min-w-28"
          >
            Sign in
          </button>
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">Authorized personnel only · Activity is subject to audit</p>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const theme = useMemo(() => themeFromFlag(uganda.flagColors), []);
  const [data, setData] = useState<UgandaData>(() => loadSnapshot() ?? cloneData());
  const [undoStack, setUndoStack] = useState<UgandaData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const { page, selection } = useAppRoute();
  const showMap = page === "map";
  const indexes = useMemo(() => buildSearchIndexes(data), [data]);
  const polygonCount = useMemo(() => getDistrictMap().size, []);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  function notify(message: string, tone: "success" | "error" = "success") {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 4200);
  }

  function commitData(next: UgandaData) {
    if (next === dataRef.current) return;
    setUndoStack((stack) => {
      const s = [...stack, dataRef.current];
      return s.length > MAX_UNDO ? s.slice(s.length - MAX_UNDO) : s;
    });
    setData(next);
    saveSnapshot(next);
  }

  function applyEdit(mutator: (d: UgandaData) => UgandaData | null): boolean {
    const next = mutator(dataRef.current);
    if (!next) return false;
    commitData(next);
    return true;
  }

  function undoLast() {
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    setUndoStack((stack) => stack.slice(0, -1));
    setData(prev);
    saveSnapshot(prev);
  }

  function levelLabel(level: number): string {
    return uganda.levels[level - 1]?.label ?? "unit";
  }

  function handleRename(path: UnitPath, newName: string) {
    const d = path.district;
    const sc = path.subcounty;
    const p = path.parish;
    const v = path.village;
    let ok = false;
    if (v && sc && p) {
      ok = applyEdit((data) => renameVillage(data, d, sc, p, v, newName));
      if (ok) navigate({ selection: { district: d, subcounty: sc, parish: p, village: newName } });
    } else if (p && sc) {
      ok = applyEdit((data) => renameParish(data, d, sc, p, newName));
      if (ok) navigate({ selection: { district: d, subcounty: sc, parish: newName } });
    } else if (sc) {
      ok = applyEdit((data) => renameSubcounty(data, d, sc, newName));
      if (ok) navigate({ selection: { district: d, subcounty: newName } });
    } else if (d) {
      ok = applyEdit((data) => renameDistrict(data, d, newName));
      if (ok) navigate({ selection: { district: newName } });
    }
    if (!ok) {
      const level = v && sc && p ? 4 : p && sc ? 3 : sc ? 2 : d ? 1 : 0;
      notify(`A ${levelLabel(level)} named “${newName}” already exists at this level.`, "error");
    }
  }

  function handleAddChild(parent: UnitPath, level: number, name: string) {
    const d = parent.district;
    const sc = parent.subcounty;
    const p = parent.parish;
    let ok = false;
    switch (level) {
      case 1:
        ok = applyEdit((data) => addDistrict(data, name));
        break;
      case 2:
        if (d) ok = applyEdit((data) => addSubcounty(data, d, name));
        break;
      case 3:
        if (d && sc) ok = applyEdit((data) => addParish(data, d, sc, name));
        break;
      case 4:
        if (d && sc && p) ok = applyEdit((data) => addVillage(data, d, sc, p, name));
        break;
    }
    if (!ok) notify(`A ${levelLabel(level)} named “${name}” already exists here.`, "error");
  }

  function handleDelete(path: UnitPath) {
    const d = path.district;
    const sc = path.subcounty;
    const p = path.parish;
    const v = path.village;
    if (v && sc && p) {
      applyEdit((data) => deleteVillage(data, d, sc, p, v));
      navigate({ selection: { district: d, subcounty: sc, parish: p } });
    } else if (p && sc) {
      applyEdit((data) => deleteParish(data, d, sc, p));
      navigate({ selection: { district: d, subcounty: sc } });
    } else if (sc) {
      applyEdit((data) => deleteSubcounty(data, d, sc));
      navigate({ selection: { district: d } });
    } else if (d) {
      applyEdit((data) => deleteDistrict(data, d));
      navigate({ selection: null });
    }
  }

  function handleResetData() {
    if (window.confirm("Reset all data back to the official EC 2022 dataset? Your edits will be lost.")) {
      clearSnapshot();
      commitData(cloneData());
      navigate({ selection: null });
    }
  }

  function handleExport() {
    downloadData(data, "uganda-admin.json");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const next = parseImportedData(String(reader.result));
        commitData(next);
        navigate({ selection: null });
        const c = next.meta.counts;
        notify(
          `Imported ${c.districts} districts, ${c.subcounties} subcounties, ${c.parishes} parishes, ${c.villages} villages.`,
        );
      } catch (err) {
        notify(`Import failed: ${(err as Error).message}`, "error");
      }
    };
    reader.readAsText(file);
  }

  function selectByLevel(level: number, name: string) {
    const base = selection?.district
      ? { district: selection.district, subcounty: selection.subcounty, parish: selection.parish }
      : { district: "" };
    let next: Selection | null = null;
    switch (level) {
      case 1:
        next = { district: name };
        break;
      case 2:
        next = { ...base, district: base.district || name, subcounty: name };
        break;
      case 3:
        next = { ...base, district: base.district || name, subcounty: base.subcounty || name, parish: name };
        break;
      case 4:
        next = {
          ...base,
          district: base.district || name,
          subcounty: base.subcounty || name,
          parish: base.parish || name,
          village: name,
        };
        break;
    }
    if (next) navigate({ selection: next });
  }

  function onSearchSelect(r: SearchResult) {
    navigate({
      selection: {
        district: r.district,
        subcounty: r.subcounty,
        parish: r.parish,
        village: r.level === 4 ? r.name : undefined,
      },
    });
  }

  function onMapSelect(districtName: string) {
    navigate({ selection: { district: districtName } });
  }

  function handleOpenInExplorer(
    district: string,
    subcounty?: string,
    parish?: string,
    village?: string,
  ) {
    navigate({
      selection: { district, subcounty, parish, village },
      page: "explorer",
    });
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f6f8] text-slate-900">
      <Header
        country={uganda}
        title="Uganda Administration Platform"
        subtitle={`${data.districts.length} districts · ${polygonCount} mapped boundaries`}
        page={page}
        onNavigate={(p) => navigate({ page: p })}
      >
        <div className="flex items-center gap-2">
          <div className="hidden w-[min(32vw,28rem)] xl:block">
            {!showMap && <SearchBox country={uganda} data={data} indexes={indexes} onSelect={onSearchSelect} />}
          </div>
          <div className="hidden sm:block"><CopyLinkButton /></div>
          {isAdmin && undoStack.length > 0 && (
            <button
              type="button"
              onClick={undoLast}
              className="control-button hidden lg:inline-flex"
              title={`Undo last change (${undoStack.length} change${undoStack.length === 1 ? "" : "s"} back)`}
            >
              Undo
            </button>
          )}
          {isAdmin ? (
            <>
              <details className="relative lg:hidden">
                <summary className="control-button list-none cursor-pointer">Actions</summary>
                <div className="absolute right-0 top-12 z-50 w-52 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,.2)]">
                  {undoStack.length > 0 && <button type="button" onClick={undoLast} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Undo last change</button>}
                  <button type="button" onClick={() => importInputRef.current?.click()} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Import data</button>
                  <button type="button" onClick={handleExport} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Export data</button>
                  <button type="button" onClick={handleResetData} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50">Reset baseline</button>
                </div>
              </details>
              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="control-button hidden xl:inline-flex"
                title="Load an edited data JSON file"
              >
                Import
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="control-button control-button-primary hidden lg:inline-flex"
                title="Download edited data as JSON"
              >
                Export
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="control-button hidden 2xl:inline-flex"
                title="Restore official EC 2022 data"
              >
                Reset data
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className="control-button"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="control-button control-button-accent"
            >
              Admin sign in
            </button>
          )}
        </div>
      </Header>

      {showMap ? (
        <MapPage
          country={uganda}
          theme={theme}
          data={data}
          indexes={indexes}
          selection={selection}
          onSearchSelect={onSearchSelect}
          onMapSelect={onMapSelect}
          onClearSelection={() => navigate({ selection: null })}
          onOpenInExplorer={handleOpenInExplorer}
        />
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mb-5 xl:hidden">
              <SearchBox country={uganda} data={data} indexes={indexes} onSelect={onSearchSelect} />
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(22rem,29rem)_minmax(0,1fr)]">
              <div className="surface-card min-h-[42rem] overflow-hidden lg:sticky lg:top-6 lg:h-[calc(100vh-9.5rem)]">
                <SidePanel
                  country={uganda}
                  data={data}
                  selection={selection}
                  onSelect={selectByLevel}
                  onReset={() => navigate({ selection: null })}
                  isAdmin={isAdmin}
                  onRename={handleRename}
                  onAddChild={handleAddChild}
                  onDelete={handleDelete}
                />
              </div>
              <OverviewPanel data={data} selection={selection} isAdmin={isAdmin} />
            </div>
          </div>
        </main>
      )}

      {showLogin && (
        <AdminLogin
          onSuccess={() => {
            setIsAdmin(true);
            setShowLogin(false);
          }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {notice && (
        <div className={`fixed bottom-5 left-1/2 z-[60] flex w-[min(92%,32rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_20px_60px_rgba(15,23,42,.22)] ${notice.tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role="status" aria-live="polite">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notice.tone === "error" ? "bg-red-500" : "bg-emerald-500"}`} />
          <p className="flex-1 text-sm font-medium leading-5">{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} className="text-current opacity-50 transition hover:opacity-100" aria-label="Dismiss notification">×</button>
        </div>
      )}
    </div>
  );
}
