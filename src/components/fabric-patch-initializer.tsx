"use client";
import { useEffect } from "react";
import { initializeFabricPatches } from "@/lib/fabricPatches";

/**
 * Component to initialize fabric.js patches
 * This must be included early in the component tree
 */
export default function FabricPatchInitializer() {
  useEffect(() => {
    initializeFabricPatches();
  }, []);

  return null; // This component renders nothing
}
