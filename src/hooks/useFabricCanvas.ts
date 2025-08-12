/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback } from "react";
import { useScript } from "./useScript";

// Simplified types to prevent build-time type resolution errors on the server.
export type FabricModule = any;
export type FabricObject = any;
export type FabricCanvas = any;

export const useFabricCanvas = () => {
  const [fabric, setFabric] = useState<FabricModule | null>(null);
  const [canvas, setCanvas] = useState<FabricCanvas>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject>(null);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);

  // Load Fabric.js script
  useScript(
    "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js",
    {
      onLoad: () => {
        setFabric((window as any).fabric);
      },
      onError: (error) => {
        console.error("Failed to load fabric.js from CDN:", error);
      },
    }
  );

  const handleSetCanvas = useCallback((canvasInstance: any) => {
    setCanvas(canvasInstance);

    // Set up selection tracking for alignment toolbar
    if (canvasInstance) {
      canvasInstance.on("selection:created", (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObjects(selectedObjs);
      });

      canvasInstance.on("selection:updated", (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObjects(selectedObjs);
      });

      canvasInstance.on("selection:cleared", () => {
        setSelectedObjects([]);
      });
    }
  }, []);

  return {
    fabric,
    canvas,
    selectedObject,
    selectedObjects,
    setSelectedObject,
    setSelectedObjects,
    handleSetCanvas,
  };
};
