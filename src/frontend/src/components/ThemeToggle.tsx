import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetThemePreference,
  useSaveThemePreference,
} from "../hooks/useQueries";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { identity } = useInternetIdentity();
  const saveThemePreference = useSaveThemePreference();
  const { data: backendTheme, isSuccess: backendThemeLoaded } =
    useGetThemePreference();
  const [mounted, setMounted] = useState(false);
  const [syncedBackendTheme, setSyncedBackendTheme] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync backend theme preference on mount if user is authenticated
  useEffect(() => {
    if (identity && backendThemeLoaded && backendTheme && !syncedBackendTheme) {
      // Only sync if backend theme differs from current theme
      const currentTheme = theme === "system" ? resolvedTheme : theme;
      if (backendTheme !== currentTheme) {
        setTheme(backendTheme);
      }
      setSyncedBackendTheme(true);
    }
  }, [
    backendTheme,
    backendThemeLoaded,
    identity,
    syncedBackendTheme,
    theme,
    resolvedTheme,
    setTheme,
  ]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!identity) {
      setSyncedBackendTheme(false);
    }
  }, [identity]);

  const toggleTheme = () => {
    // Get the actual resolved theme (light or dark)
    const currentResolvedTheme = theme === "system" ? resolvedTheme : theme;
    const newTheme = currentResolvedTheme === "dark" ? "light" : "dark";

    // Immediately update local theme
    setTheme(newTheme);

    // Save to backend if authenticated (async, non-blocking)
    if (identity) {
      saveThemePreference.mutate(newTheme, {
        onError: (error) => {
          console.error("Failed to save theme preference to backend:", error);
        },
      });
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 transition-all duration-200"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
