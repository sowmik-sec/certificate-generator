/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";

interface CanvasStabilityProps {
  canvas: any;
  fabric: any;
}

const CanvasStability: React.FC<CanvasStabilityProps> = ({
  canvas,
  fabric,
}) => {
  useEffect(() => {
    if (!canvas || !fabric) return;

    // Enhanced object controls to reduce shaking
    const enhanceObjectControls = (obj: any) => {
      // Set better defaults for all objects
      obj.set({
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
        // Reduce movement sensitivity
        moveCursor: "move",
        // Better scaling behavior
        uniformScaling: false,
        // Prevent tiny movements
        snapAngle: 45,
        snapThreshold: 5,
      });

      // For lines specifically, add better handling
      if (obj.isType && obj.isType("line")) {
        obj.set({
          strokeUniform: true,
          perPixelTargetFind: true,
          targetFindTolerance: 5,
        });
      }

      // For groups, ensure better handling
      if (obj.isType && obj.isType("group")) {
        obj.set({
          subTargetCheck: true,
          interactive: true,
        });
      }
    };

    // Apply enhanced controls to existing objects
    const applyToExistingObjects = () => {
      canvas.getObjects().forEach((obj: any) => {
        if (
          obj.id !== "grid-line" &&
          obj.id !== "alignment-line" &&
          !obj.excludeFromExport
        ) {
          enhanceObjectControls(obj);
        }
      });
      canvas.renderAll();
    };

    // Apply to newly added objects
    const handleObjectAdded = (e: any) => {
      const obj = e.target;
      if (
        obj &&
        obj.id !== "grid-line" &&
        obj.id !== "alignment-line" &&
        !obj.excludeFromExport
      ) {
        enhanceObjectControls(obj);
      }
    };

    // Smooth object movement
    const handleObjectMoving = (e: any) => {
      const obj = e.target;
      if (!obj) return;

      // Throttle movement updates to reduce jitter
      if (obj._moveThrottled) return;
      obj._moveThrottled = true;

      requestAnimationFrame(() => {
        obj.setCoords();
        obj._moveThrottled = false;
      });
    };

    // Better scaling behavior
    const handleObjectScaling = (e: any) => {
      const obj = e.target;
      if (!obj) return;

      // Throttle scaling updates
      if (obj._scaleThrottled) return;
      obj._scaleThrottled = true;

      requestAnimationFrame(() => {
        obj.setCoords();
        obj._scaleThrottled = false;
      });
    };

    // Clean up throttle flags after modification
    const handleObjectModified = (e: any) => {
      const obj = e.target;
      if (!obj) return;

      delete obj._moveThrottled;
      delete obj._scaleThrottled;
      obj.setCoords();
    };

    // Apply enhanced controls to all existing objects
    applyToExistingObjects();

    // Add event listeners
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);
    canvas.on("object:modified", handleObjectModified);

    return () => {
      // Cleanup
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.off("object:modified", handleObjectModified);
    };
  }, [canvas, fabric]);

  // This component doesn't render anything visible
  return null;
};

export default CanvasStability;
