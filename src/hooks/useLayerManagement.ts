/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import { useEditorShortcuts } from "./useKeyboardShortcuts";

export const useLayerManagement = (
  canvas: any,
  fabric: any,
  saveToHistory: () => void
) => {
  // Group selected objects
  const groupObjects = useCallback(() => {
    if (!canvas || !fabric) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 2) return;

    const group = new fabric.Group(activeObjects, {
      left: 0,
      top: 0,
    });

    // Remove original objects from canvas
    activeObjects.forEach((obj: any) => canvas.remove(obj));

    // Add grouped object
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
    saveToHistory();
  }, [canvas, fabric, saveToHistory]);

  // Ungroup selected group
  const ungroupObjects = useCallback(() => {
    if (!canvas || !fabric) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "group") return;

    const group = activeObject as any;
    const objects = group._objects.slice(); // Create a copy of the objects array

    // Remove the group from canvas
    canvas.remove(group);

    // Add individual objects back to canvas
    objects.forEach((obj: any) => {
      // Reset object properties
      obj.set({
        left: obj.left + group.left,
        top: obj.top + group.top,
        scaleX: obj.scaleX * group.scaleX,
        scaleY: obj.scaleY * group.scaleY,
        angle: obj.angle + group.angle,
      });
      canvas.add(obj);
    });

    // Select all ungrouped objects
    canvas.discardActiveObject();
    if (objects.length > 1) {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: canvas,
      });
      canvas.setActiveObject(selection);
    } else if (objects.length === 1) {
      canvas.setActiveObject(objects[0]);
    }

    canvas.renderAll();
    saveToHistory();
  }, [canvas, fabric, saveToHistory]);

  // Bring to front
  const bringToFront = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.bringToFront(obj);
    });
    canvas.renderAll();
  }, [canvas]);

  // Send to back
  const sendToBack = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.sendToBack(obj);
    });
    canvas.renderAll();
  }, [canvas]);

  // Bring forward
  const bringForward = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.bringForward(obj);
    });
    canvas.renderAll();
  }, [canvas]);

  // Send backward
  const sendBackward = useCallback(() => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.sendBackward(obj);
    });
    canvas.renderAll();
  }, [canvas]);

  // Add layer management keyboard shortcuts
  useEditorShortcuts({
    onGroup: groupObjects,
    onUngroup: ungroupObjects,
    onBringForward: bringForward,
    onSendBackward: sendBackward,
    onBringToFront: bringToFront,
    onSendToBack: sendToBack,
  });

  return {
    groupObjects,
    ungroupObjects,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  };
};
