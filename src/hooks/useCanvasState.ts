/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo } from "react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import {
  restoreCanvasFromHistory,
  isRestoringCanvas,
} from "@/lib/fabricHistory";

/**
 * React provider/hook that returns { json, setJson } exactly as specified
 * Auto-restore canvas on json change (memoized to avoid re-rendering)
 */
export const useCanvasState = (canvas?: any) => {
  const { json, setJson } = useHistoryStore();

  // Auto-restore canvas on json change (memoized to avoid re-rendering)
  const memoizedRestoreEffect = useMemo(() => {
    return () => {
      if (canvas && json && !isRestoringCanvas()) {
        restoreCanvasFromHistory(canvas, json);
      }
    };
  }, [canvas, json]);

  useEffect(() => {
    memoizedRestoreEffect();
  }, [memoizedRestoreEffect]);

  return {
    json,
    setJson,
  };
};
