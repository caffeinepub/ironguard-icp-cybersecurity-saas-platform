import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export default function GlobalLoadingScreen() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const routerState = useRouterState();
  const isNavigating = routerState.status === "pending";

  useEffect(() => {
    let showTimeout: ReturnType<typeof setTimeout> | undefined;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    if (isNavigating) {
      // Small delay before showing loader to avoid flash on fast navigations
      showTimeout = setTimeout(() => {
        setShouldRender(true);
        // Fade in after render
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, 100);
    } else {
      // Clear show timeout if navigation completes quickly
      if (showTimeout) {
        clearTimeout(showTimeout);
      }

      // Start fade out
      setIsVisible(false);

      // Remove from DOM after fade out animation
      hideTimeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isNavigating]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: "var(--loader-bg)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      aria-live="polite"
      aria-busy={isVisible}
      aria-hidden="true"
    >
      {/* Geometric Animation Container */}
      <div className="flex flex-col items-center gap-6">
        {/* Rotating Triangle/Shield Animation */}
        <div className="relative h-16 w-16" aria-hidden="true">
          {/* Outer rotating ring */}
          <div
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDuration: "3s" }}
          >
            <svg
              viewBox="0 0 64 64"
              className="h-full w-full"
              role="img"
              aria-label="Loading animation"
              style={{
                filter: "drop-shadow(0 0 8px var(--loader-accent-glow))",
              }}
            >
              <path
                d="M32 4 L56 52 L8 52 Z"
                fill="none"
                stroke="var(--loader-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Inner counter-rotating triangle */}
          <div
            className="absolute inset-2 animate-spin-reverse"
            style={{ animationDuration: "2s" }}
          >
            <svg
              viewBox="0 0 64 64"
              className="h-full w-full"
              role="img"
              aria-label="Loading animation"
            >
              <path
                d="M32 12 L48 44 L16 44 Z"
                fill="none"
                stroke="var(--loader-accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Center node/dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-2 w-2 rounded-full animate-pulse"
              style={{
                background: "var(--loader-accent)",
                boxShadow: "0 0 12px var(--loader-accent-glow)",
              }}
            />
          </div>
        </div>

        {/* Optional Status Text */}
        <p
          className="text-sm font-medium tracking-wide"
          style={{ color: "var(--loader-text)" }}
        >
          Verifying security…
        </p>
      </div>
    </div>
  );
}
