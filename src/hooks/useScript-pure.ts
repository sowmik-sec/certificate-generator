"use client";
import { useEffect, useState } from "react";

interface UseScriptPureOptions {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useScriptPure = (
  src: string,
  options: UseScriptPureOptions = {}
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof globalThis === "undefined") {
      setLoading(false);
      return;
    }

    // For truly DOM-free approach, we could use dynamic imports or fetch
    // But since external scripts need to be in the DOM, let's use a different approach

    // Check if the script's functionality is already available
    // This assumes the script exposes some global variable/function
    const checkScriptLoaded = () => {
      // You would customize this based on what the script provides
      // For example, if loading Fabric.js, check for window.fabric
      const scriptName = src.split("/").pop()?.split(".")[0];

      if (
        scriptName === "fabric" &&
        typeof (globalThis as Record<string, unknown>).fabric !== "undefined"
      ) {
        return true;
      }

      // Add other script checks as needed
      return false;
    };

    if (checkScriptLoaded()) {
      setLoading(false);
      if (options.onLoad) {
        options.onLoad();
      }
      return;
    }

    // Alternative approach: Use import() for ES modules
    if (src.includes(".mjs") || src.includes("module")) {
      import(src)
        .then(() => {
          setLoading(false);
          setError(null);
          if (options.onLoad) {
            options.onLoad();
          }
        })
        .catch(() => {
          const error = new Error(`Failed to load module: ${src}`);
          setError(error);
          setLoading(false);
          if (options.onError) {
            options.onError(error);
          }
        });
      return;
    }

    // For traditional scripts, we still need the DOM
    // But we can make it more explicit and controlled
    console.warn(
      `Script loading for ${src} requires DOM manipulation. Consider using ES modules instead.`
    );

    // Emit custom event for parent to handle
    const event = new CustomEvent("script-load-requested", {
      detail: { src, options },
    });
    globalThis.dispatchEvent?.(event);

    setLoading(false);
    setError(new Error("Script loading requires DOM manipulation"));
  }, [src, options]);

  return { loading, error };
};
