import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { SearchBox } from "./components/SearchBox";
import { SidePanel } from "./components/SidePanel";
import { MapView } from "./components/MapView";
import { uganda } from "./countries/uganda";
import { themeFromFlag } from "./theme";
import { getDistrictMap, polygonNameFor } from "./lib/geo";
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
} from "./lib/storage";
import type { UgandaData, SearchResult, Selection } from "./types";

const ADMIN_EMAIL = "admin@uganda.gov";
const ADMIN_PASSWORD = "admin123";

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
          <span className="flex h-8 w-10 items-center justify-center overflow-hidden rounded-sm border border-black/20">
            <div className="flex h-full w-full flex-col">
              <div className="flex-1 bg-black" />
              <div className="flex-1 bg-[#FCDC04]" />
              <div className="flex-1 bg-[#D90000]" />
            </div>
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
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const indexes = useMemo(() => buildSearchIndexes(data), [data]);
  const polygonCount = useMemo(() => getDistrictMap().size, []);

  function applyEdit(mutator: (d: UgandaData) => UgandaData) {
    setData((prev) => {
      const next = mutator(prev);
      saveSnapshot(next);
      return next;
    });
  }

  function handleRename(path: UnitPath, newName: string) {
    const d = path.district;
    const sc = path.subcounty;
    const p = path.parish;
    const v = path.village;
    if (v && sc && p) {
      applyEdit((data) => renameVillage(data, d, sc, p, v, newName));
      setSelection((prev) => (prev ? { ...prev, village: newName } : prev));
    } else if (p && sc) {
      applyEdit((data) => renameParish(data, d, sc, p, newName));
      setSelection((prev) => (prev ? { ...prev, parish: newName } : prev));
    } else if (sc) {
      applyEdit((data) => renameSubcounty(data, d, sc, newName));
      setSelection((prev) => (prev ? { ...prev, subcounty: newName } : prev));
    } else if (d) {
      applyEdit((data) => renameDistrict(data, d, newName));
      setSelection((prev) => (prev ? { ...prev, district: newName } : prev));
    }
  }

  function handleAddChild(parent: UnitPath, level: number, name: string) {
    const d = parent.district;
    const sc = parent.subcounty;
    const p = parent.parish;
    switch (level) {
      case 1:
        applyEdit((data) => addDistrict(data, name));
        break;
      case 2:
        if (d) applyEdit((data) => addSubcounty(data, d, name));
        break;
      case 3:
        if (d && sc) applyEdit((data) => addParish(data, d, sc, name));
        break;
      case 4:
        if (d && sc && p) applyEdit((data) => addVillage(data, d, sc, p, name));
        break;
    }
  }

  function handleDelete(path: UnitPath) {
    const d = path.district;
    const sc = path.subcounty;
    const p = path.parish;
    const v = path.village;
    if (v && sc && p) {
      applyEdit((data) => deleteVillage(data, d, sc, p, v));
      setSelection({ district: d, subcounty: sc, parish: p });
    } else if (p && sc) {
      applyEdit((data) => deleteParish(data, d, sc, p));
      setSelection({ district: d, subcounty: sc });
    } else if (sc) {
      applyEdit((data) => deleteSubcounty(data, d, sc));
      setSelection({ district: d });
    } else if (d) {
      applyEdit((data) => deleteDistrict(data, d));
      setSelection(null);
    }
  }

  function handleResetData() {
    if (window.confirm("Reset all data back to the official EC 2022 dataset? Your edits will be lost.")) {
      clearSnapshot();
      setData(cloneData());
      setSelection(null);
    }
  }

  function handleExport() {
    downloadData(data, "uganda-admin.json");
  }

  function selectByLevel(level: number, name: string) {
    setSelection((prev) => {
      const base = prev?.district
        ? { district: prev.district, subcounty: prev.subcounty, parish: prev.parish }
        : { district: "" };
      switch (level) {
        case 1:
          return { district: name };
        case 2:
          return { ...base, district: base.district || name, subcounty: name };
        case 3:
          return { ...base, district: base.district || name, subcounty: base.subcounty || name, parish: name };
        case 4:
          return {
            ...base,
            district: base.district || name,
            subcounty: base.subcounty || name,
            parish: base.parish || name,
            village: name,
          };
        default:
          return prev;
      }
    });
  }

  function onSearchSelect(r: SearchResult) {
    setSelection({
      district: r.district,
      subcounty: r.subcounty,
      parish: r.parish,
      village: r.level === 4 ? r.name : undefined,
    });
  }

  function onMapSelect(districtName: string) {
    setSelection({ district: districtName });
  }

  const crumbs = selection
    ? [
        ...(selection.subcounty
          ? [{ label: selection.district, onClick: () => setSelection({ district: selection.district }) }]
          : []),
        ...(selection.parish
          ? [
              {
                label: selection.subcounty!,
                onClick: () =>
                  setSelection({ district: selection.district, subcounty: selection.subcounty }),
              },
            ]
          : []),
        ...(selection.village
          ? [
              {
                label: selection.parish!,
                onClick: () =>
                  setSelection({
                    district: selection.district,
                    subcounty: selection.subcounty,
                    parish: selection.parish,
                  }),
              },
            ]
          : []),
        ...(selection.district && !selection.subcounty
          ? [{ label: selection.district, onClick: () => {} }]
          : []),
      ]
    : [];

  const selectedPolygon = selection ? polygonNameFor(selection.district, getDistrictMap()) : null;

  return (
    <div className="flex h-screen flex-col bg-[#f7f7f5] text-gray-900">
      <Header
        country={uganda}
        title="Uganda Admin Explorer"
        subtitle={`${data.districts.length} districts · ${polygonCount} mapped · ${uganda.dataYear} EC data`}
      >
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
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
          <SearchBox country={uganda} data={data} indexes={indexes} onSelect={onSearchSelect} />
        </div>
      </Header>

      <Breadcrumbs crumbs={crumbs} onReset={() => setSelection(null)} />

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[45vh] flex-1">
          <MapView
            theme={theme}
            center={uganda.map.center}
            zoom={uganda.map.zoom}
            selectedDistrict={selection?.district ?? null}
            onSelectDistrict={onMapSelect}
            onReset={() => setSelection(null)}
          />
          {selectedPolygon && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs shadow">
              <span className="font-semibold text-black">Selected:</span>{" "}
              <span className="font-medium text-[#D90000]">{selection?.district}</span>
              {selection?.district !== selectedPolygon && (
                <span className="ml-1 text-gray-500">(on map: {selectedPolygon})</span>
              )}
            </div>
          )}
        </div>

        <div className="h-[45vh] w-full shrink-0 border-t border-black/10 lg:h-auto lg:w-[400px] lg:border-l lg:border-t-0">
          <SidePanel
            country={uganda}
            theme={theme}
            data={data}
            selection={selection}
            onSelect={selectByLevel}
            onReset={() => setSelection(null)}
            isAdmin={isAdmin}
            onRename={handleRename}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
          />
        </div>
      </div>

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
