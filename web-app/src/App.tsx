import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { SearchBox } from "./components/SearchBox";
import { SidePanel } from "./components/SidePanel";
import { MapPage } from "./components/MapPage";
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
import { setBudget } from "./lib/budget";
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
      className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-xs font-bold text-black transition hover:bg-black/5"
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
      setError("Invalid credentials. Try admin@uganda.gov / admin123");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-10 items-center justify-center overflow-hidden rounded-sm border border-black/20 bg-white">
            <img
              src="/uganda-flag.png"
              alt="Uganda flag"
              className="h-full w-full object-cover"
            />
          </span>
          <h2 className="text-lg font-bold text-black">Admin sign in</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">Manage Uganda administrative units (local edits).</p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm font-normal text-black outline-none focus:border-[#D90000]"
            autoFocus
          />
        </label>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm font-normal text-black outline-none focus:border-[#D90000]"
          />
        </label>
        {error && <p className="mt-2 text-xs font-semibold text-[#D90000]">{error}</p>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800"
          >
            Sign in
          </button>
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

  const { page, selection } = useAppRoute();
  const showMap = page === "map";
  const indexes = useMemo(() => buildSearchIndexes(data), [data]);
  const polygonCount = useMemo(() => getDistrictMap().size, []);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

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
      window.alert(`A ${levelLabel(level)} named "${newName}" already exists at this level.`);
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
    if (!ok) window.alert(`A ${levelLabel(level)} named "${name}" already exists here.`);
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

  function handleBudgetUpdate(path: UnitPath, value: number) {
    if (!path.district) return;
    applyEdit((data) => setBudget(data, path, value));
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
        window.alert(
          `Imported ${c.districts} districts, ${c.subcounties} subcounties, ${c.parishes} parishes, ${c.villages} villages.`,
        );
      } catch (err) {
        window.alert(`Import failed: ${(err as Error).message}`);
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
    <div className="flex h-screen flex-col bg-[#f7f7f5] text-gray-900">
      <Header
        country={uganda}
        title="Uganda Admin Explorer"
        subtitle={`${data.districts.length} districts · ${polygonCount} mapped`}
        page={page}
        onNavigate={(p) => navigate({ page: p })}
      >
        <div className="flex items-center gap-2">
          <CopyLinkButton />
          {isAdmin && undoStack.length > 0 && (
            <button
              type="button"
              onClick={undoLast}
              className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-xs font-bold text-black transition hover:bg-black/5"
              title={`Undo last change (${undoStack.length} change${undoStack.length === 1 ? "" : "s"} back)`}
            >
              Undo
            </button>
          )}
          {isAdmin ? (
            <>
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
                className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-xs font-bold text-black transition hover:bg-black/5"
                title="Load an edited data JSON file"
              >
                Import
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="shrink-0 rounded-md bg-black px-3 py-2 text-xs font-bold text-white transition hover:bg-gray-800"
                title="Download edited data as JSON"
              >
                Export
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-xs font-bold text-black transition hover:bg-black/5"
                title="Restore official EC 2022 data"
              >
                Reset data
              </button>
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-black/5"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="shrink-0 rounded-md bg-[#D90000] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#B00000]"
            >
              Admin
            </button>
          )}
          {!showMap && <SearchBox country={uganda} data={data} indexes={indexes} onSelect={onSearchSelect} />}
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
        <div className="relative min-h-0 flex-1">
          <SidePanel
            country={uganda}
            theme={theme}
            data={data}
            selection={selection}
            onSelect={selectByLevel}
            onReset={() => navigate({ selection: null })}
            isAdmin={isAdmin}
            onRename={handleRename}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onBudgetChange={handleBudgetUpdate}
          />
        </div>
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
    </div>
  );
}
