"use client";
import { useHistoryStore } from "@/stores/useHistoryStore";

/**
 * useCanvasStore() returns { json, setJson } exactly as specified
 */
export const useCanvasStore = () => {
  const json = useHistoryStore((state) => state.json);
  const setJson = useHistoryStore((state) => state.setJson);

  return {
    json,
    setJson,
  };
};
