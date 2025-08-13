/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";

// Simplified types to prevent build-time type resolution errors on the server.
export type FabricModule = any;
export type FabricObject = any;
export type FabricCanvas = any;

export const useFabricCanvas = () => {
  const {
    fabric,
    canvas,
    selectedObject,
    selectedObjects,
    setCanvas,
    setSelectedObject,
    loadFabric,
  } = useCanvasStore();

  // Load Fabric.js using store method
  useEffect(() => {
    if (!fabric && typeof window !== 'undefined') {
      loadFabric().catch((error) => {
        console.error("Failed to load fabric.js from CDN:", error);
      });
    }
  }, [fabric, loadFabric]);

  const handleSetCanvas = useCallback((canvasInstance: any) => {
    setCanvas(canvasInstance);
  }, [setCanvas]);

  return {
    fabric,
    canvas,
    selectedObject,
    selectedObjects,
    setSelectedObject,
    handleSetCanvas,
  };
};
