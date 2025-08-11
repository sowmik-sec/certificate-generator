/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useCanvasFrames = (
  canvas: any,
  fabric: any,
  saveToHistory: () => void
) => {
  const addSimpleFrame = useCallback(
    (options: { stroke?: string; strokeWidth?: number } = {}) => {
      if (!canvas || !fabric) return;
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        width: 600,
        height: 400,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: options.strokeWidth || 4,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDoubleFrame = useCallback(
    (options: { stroke?: string; strokeWidth?: number } = {}) => {
      if (!canvas || !fabric) return;
      const outerRect = new fabric.Rect({
        left: 30,
        top: 30,
        width: 640,
        height: 440,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: options.strokeWidth || 4,
      });
      const innerRect = new fabric.Rect({
        left: 50,
        top: 50,
        width: 600,
        height: 400,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: (options.strokeWidth || 4) / 2,
      });
      const group = new fabric.Group([outerRect, innerRect], {
        left: 100,
        top: 100,
      });
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDecorativeFrame = useCallback(
    (options: { stroke?: string; strokeWidth?: number } = {}) => {
      if (!canvas || !fabric) return;
      const outerRect = new fabric.Rect({
        left: 20,
        top: 20,
        width: 660,
        height: 460,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: options.strokeWidth || 6,
      });
      const innerRect = new fabric.Rect({
        left: 40,
        top: 40,
        width: 620,
        height: 420,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: (options.strokeWidth || 6) / 3,
      });

      // Add decorative corners
      const cornerSize = 20;
      const topLeft = new fabric.Rect({
        left: 30,
        top: 30,
        width: cornerSize,
        height: cornerSize,
        fill: options.stroke || "#D4AF37",
      });
      const topRight = new fabric.Rect({
        left: 650 - cornerSize,
        top: 30,
        width: cornerSize,
        height: cornerSize,
        fill: options.stroke || "#D4AF37",
      });
      const bottomLeft = new fabric.Rect({
        left: 30,
        top: 470 - cornerSize,
        width: cornerSize,
        height: cornerSize,
        fill: options.stroke || "#D4AF37",
      });
      const bottomRight = new fabric.Rect({
        left: 650 - cornerSize,
        top: 470 - cornerSize,
        width: cornerSize,
        height: cornerSize,
        fill: options.stroke || "#D4AF37",
      });
      const group = new fabric.Group(
        [outerRect, innerRect, topLeft, topRight, bottomLeft, bottomRight],
        { left: 50, top: 50 }
      );
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addRoundedFrame = useCallback(
    (options: { stroke?: string; strokeWidth?: number } = {}) => {
      if (!canvas || !fabric) return;
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        width: 600,
        height: 400,
        fill: "transparent",
        stroke: options.stroke || "#8B4513",
        strokeWidth: options.strokeWidth || 4,
        rx: 20,
        ry: 20,
      });
      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  return {
    addSimpleFrame,
    addDoubleFrame,
    addDecorativeFrame,
    addRoundedFrame,
  };
};
