/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useCanvasLines = (
  canvas: any,
  fabric: any,
  saveToHistory: () => void
) => {
  const addLine = useCallback(
    (options = {}) => {
      if (!canvas || !fabric) return;
      const line = new fabric.Line([50, 50, 250, 50], {
        left: 200,
        top: 200,
        stroke: "#333333",
        strokeWidth: 4,
        ...options,
      });
      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDashedLine = useCallback(
    (options = {}) => addLine({ strokeDashArray: [10, 5], ...options }),
    [addLine]
  );

  const addArrowLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const line = new fabric.Line([50, 50, 250, 50], {
        stroke: strokeColor,
        strokeWidth: 4,
      });
      const arrowhead = new fabric.Triangle({
        width: 15,
        height: 20,
        fill: strokeColor,
        left: 250,
        top: 50,
        originX: "center",
        originY: "center",
        angle: 90,
      });
      const group = new fabric.Group([line, arrowhead], {
        left: 200,
        top: 200,
      });
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addZigzagLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const zigzagPath =
        "M 50 50 L 75 25 L 100 50 L 125 25 L 150 50 L 175 25 L 200 50";
      const zigzag = new fabric.Path(zigzagPath, {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        fill: "",
      });
      canvas.add(zigzag);
      canvas.setActiveObject(zigzag);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addWavyLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const wavyPath = "M 50 50 Q 75 25, 100 50 T 150 50 T 200 50";
      const wavy = new fabric.Path(wavyPath, {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        fill: "",
      });
      canvas.add(wavy);
      canvas.setActiveObject(wavy);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDottedLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const line = new fabric.Line([50, 50, 250, 50], {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        strokeDashArray: [2, 8],
      });
      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDoubleLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const line1 = new fabric.Line([50, 45, 250, 45], {
        stroke: strokeColor,
        strokeWidth: 3,
      });
      const line2 = new fabric.Line([50, 55, 250, 55], {
        stroke: strokeColor,
        strokeWidth: 3,
      });
      const group = new fabric.Group([line1, line2], { left: 200, top: 200 });
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addCurvedLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const curvedPath = "M 50 50 Q 125 10, 200 50";
      const curved = new fabric.Path(curvedPath, {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        fill: "",
      });
      canvas.add(curved);
      canvas.setActiveObject(curved);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addStepsLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const stepsPath =
        "M 50 50 L 75 50 L 75 35 L 100 35 L 100 50 L 125 50 L 125 35 L 150 35 L 150 50 L 175 50 L 175 35 L 200 35";
      const steps = new fabric.Path(stepsPath, {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        fill: "",
      });
      canvas.add(steps);
      canvas.setActiveObject(steps);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addThickLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const line = new fabric.Line([50, 50, 250, 50], {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 12,
      });
      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  const addDashDotLine = useCallback(
    (options: { stroke?: string } = {}) => {
      if (!canvas || !fabric) return;
      const defaultStroke = "#333333";
      const strokeColor = options.stroke || defaultStroke;

      const line = new fabric.Line([50, 50, 250, 50], {
        left: 200,
        top: 200,
        stroke: strokeColor,
        strokeWidth: 4,
        strokeDashArray: [15, 5, 3, 5],
      });
      canvas.add(line);
      canvas.setActiveObject(line);
      canvas.renderAll();
      saveToHistory();
    },
    [canvas, fabric, saveToHistory]
  );

  return {
    addLine,
    addDashedLine,
    addArrowLine,
    addZigzagLine,
    addWavyLine,
    addDottedLine,
    addDoubleLine,
    addCurvedLine,
    addStepsLine,
    addThickLine,
    addDashDotLine,
  };
};
