"use client";
import { useEffect, useState } from "react";

interface UseScriptOptions {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useScript = (src: string, options: UseScriptOptions = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      setLoading(false);
      if (options.onLoad) {
        options.onLoad();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    const handleLoad = () => {
      setLoading(false);
      setError(null);
      if (options.onLoad) {
        options.onLoad();
      }
    };

    const handleError = () => {
      const err = new Error(`Failed to load script: ${src}`);
      setError(err);
      setLoading(false);
      if (options.onError) {
        options.onError(err);
      }
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [src, options]);

  return { loading, error };
};
