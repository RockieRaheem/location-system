import { useEffect, useState } from "react";

export function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "" || hash === "/") return "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(() => currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}
