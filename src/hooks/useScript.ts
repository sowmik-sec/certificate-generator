"use client";
import { useEffect, useState, useCallback, useRef } from "react";

interface UseScriptOptions {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Global cache to prevent loading the same script multiple times
const scriptCache = new Map<string, { loaded: boolean; loading: boolean; error: Error | null }>();

export const useScript = (src: string, options: UseScriptOptions = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref without causing re-renders
  optionsRef.current = options;

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    const cachedScript = scriptCache.get(src);
    if (cachedScript) {
      cachedScript.loaded = true;
      cachedScript.loading = false;
    }
    if (optionsRef.current.onLoad) {
      optionsRef.current.onLoad();
    }
  }, [src]);

  const handleError = useCallback(() => {
    const err = new Error(`Failed to load script: ${src}`);
    setError(err);
    setLoading(false);
    const cachedScript = scriptCache.get(src);
    if (cachedScript) {
      cachedScript.error = err;
      cachedScript.loading = false;
    }
    if (optionsRef.current.onError) {
      optionsRef.current.onError(err);
    }
  }, [src]);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof globalThis === "undefined" || !globalThis.document) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = scriptCache.get(src);
    if (cached) {
      if (cached.loaded) {
        setLoading(false);
        setError(cached.error);
        if (cached.loaded && optionsRef.current.onLoad) {
          optionsRef.current.onLoad();
        }
        return;
      }
      if (cached.loading) {
        // Script is already loading, just wait
        return;
      }
    }

    // Check if script is already in DOM
    const existingScript = globalThis.document.querySelector(
      `script[src="${src}"]`
    );
    if (existingScript) {
      scriptCache.set(src, { loaded: true, loading: false, error: null });
      setLoading(false);
      if (optionsRef.current.onLoad) {
        optionsRef.current.onLoad();
      }
      return;
    }

    // Mark as loading in cache
    scriptCache.set(src, { loaded: false, loading: true, error: null });

    const script = globalThis.document.createElement("script");
    script.src = src;
    script.async = true;

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    globalThis.document.body.appendChild(script);

    // Don't remove script on cleanup to prevent re-loading
    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [src, handleLoad, handleError]);

  return { loading, error };
};
