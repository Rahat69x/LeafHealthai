import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "leafcheck.theme";

function apply(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

const ThemeContext = createContext<{ theme: ThemeChoice; setTheme: (next: ThemeChoice) => void }>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as ThemeChoice | null;
    const next: ThemeChoice = stored === "light" || stored === "dark" ? stored : "system";
    setThemeState(next);
    apply(next);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((window.localStorage.getItem(KEY) ?? "system") === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: ThemeChoice) => {
        setThemeState(next);
        apply(next);
        try {
          window.localStorage.setItem(KEY, next);
        } catch {
          /* storage blocked - theme still works for this visit */
        }
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
