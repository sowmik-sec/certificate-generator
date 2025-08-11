/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dna,
  Image as ImageIcon,
  Type,
  Download,
  Trash2,
  Wrench,
  Component,
  Group,
  Ungroup,
  MoveUp,
  MoveDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import TemplatesPanel from "@/components/templates-pannel";
import ElementsPanel from "@/components/elements-pannel";
import ToolsPanel from "@/components/tools-pannel";
import CanvasComponent from "@/components/canvas-component";
import PropertiesPanel from "@/components/properties-pannel";
import TextPanel from "@/components/text-pannel";
import AlignmentToolbar from "@/components/alignment-toolbar";
import LayerPanel from "@/components/layer-panel";
import jsPDF from "jspdf";

// Simplified types to `any` to prevent build-time type resolution errors on the server.
export type FabricModule = any;
export type FabricObject = any;
export type FabricCanvas = any;
export type EditorMode = "templates" | "elements" | "text" | "tools";

// Main App Component
export default function CertificateGeneratorPage() {
  const [fabric, setFabric] = useState<FabricModule | null>(null);
  const [canvas, setCanvas] = useState<FabricCanvas>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject>(null);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [editorMode, setEditorMode] = useState<EditorMode>("templates");
  const [copiedObject, setCopiedObject] = useState<FabricObject>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    if (!canvas) return;
    const state = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [canvas, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [canvas, history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [canvas, history, historyIndex]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, redo, undo]);

  // Dynamically load Fabric.js from a CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
    script.async = true;

    script.onload = () => {
      setFabric((window as any).fabric);
    };

    script.onerror = () => {
      console.error("Failed to load fabric.js from CDN");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSetCanvas = useCallback((canvasInstance: any) => {
    setCanvas(canvasInstance);
    
    // Set up selection tracking for alignment toolbar
    if (canvasInstance) {
      canvasInstance.on('selection:created', (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObjects(selectedObjs);
      });
      
      canvasInstance.on('selection:updated', (e: any) => {
        const selectedObjs = e.selected || [e.target].filter(Boolean);
        setSelectedObjects(selectedObjs);
      });
      
      canvasInstance.on('selection:cleared', () => {
        setSelectedObjects([]);
      });
    }
  }, []);

  const addText = (text: string, options: any) => {
    if (!canvas || !fabric) return;

    // Convert letterSpacing to charSpacing for Fabric.js
    const fabricOptions = { ...options };
    if (fabricOptions.letterSpacing !== undefined) {
      fabricOptions.charSpacing = fabricOptions.letterSpacing * 50; // Fabric.js uses different scale
      delete fabricOptions.letterSpacing;
    }

    // Handle underline
    if (fabricOptions.underline) {
      fabricOptions.underline = true;
      delete fabricOptions.underline;
    }

    // Handle text transform (apply to text directly since Fabric.js doesn't have this CSS property)
    let processedText = text;
    if (fabricOptions.textTransform) {
      switch (fabricOptions.textTransform) {
        case "uppercase":
          processedText = text.toUpperCase();
          break;
        case "lowercase":
          processedText = text.toLowerCase();
          break;
        case "capitalize":
          processedText = text.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
      }
      delete fabricOptions.textTransform;
    }

    // Handle shadow
    if (fabricOptions.shadow) {
      fabricOptions.shadow = "rgba(0,0,0,0.3) 2px 2px 4px";
      delete fabricOptions.shadow;
    }

    // Handle background color
    if (fabricOptions.backgroundColor) {
      fabricOptions.backgroundColor = fabricOptions.backgroundColor;
    }

    const textObject = new fabric.Textbox(processedText, {
      left: 150,
      top: 200,
      width: 400,
      fontFamily: "Arial",
      fill: "#000000",
      lineHeight: 1.2,
      id: `text-${Date.now()}`, // Add unique ID
      ...fabricOptions,
    });
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
    saveToHistory(); // Save state after adding text
  };
  const addHeading = (customOptions: object = {}) =>
    addText("Add a heading", {
      fontSize: 88,
      fontWeight: "bold",
      textAlign: "center",
      ...customOptions,
    });

  const addSubheading = (customOptions: object = {}) =>
    addText("Add a subheading", {
      fontSize: 44,
      fontWeight: "600",
      textAlign: "center",
      ...customOptions,
    });

  const addBodyText = (customOptions: object = {}) =>
    addText("Add a little bit of body text", {
      fontSize: 24,
      fontWeight: "normal",
      textAlign: "left",
      ...customOptions,
    });

  const addImageFromURL = (url: string) => {
    if (!canvas || !fabric) return;
    fabric.Image.fromURL(
      url,
      (img: any) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          id: `image-${Date.now()}`, // Add unique ID
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveToHistory(); // Save state after adding image
      },
      { crossOrigin: "anonymous" }
    );
  };

  const addSquare = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 150,
      fill: options.fill || "#4A90E2",
      width: 150,
      height: 150,
      id: `rect-${Date.now()}`, // Add unique ID
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveToHistory(); // Save state after adding square
  };

  const addCircle = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 150,
      fill: options.fill || "#E91E63",
      radius: 75,
      id: `circle-${Date.now()}`, // Add unique ID
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveToHistory(); // Save state after adding circle
  };

  const addTriangle = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const triangle = new fabric.Triangle({
      left: 200,
      top: 150,
      fill: options.fill || "#FFC107",
      width: 150,
      height: 150,
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
    saveToHistory(); // Save state after adding triangle
  };

  const addLine = (options = {}) => {
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
    saveToHistory(); // Save state after adding line
  };

  const addDashedLine = (options = {}) =>
    addLine({ strokeDashArray: [10, 5], ...options });

  const addArrowLine = (options: { stroke?: string } = {}) => {
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
    const group = new fabric.Group([line, arrowhead], { left: 200, top: 200 });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const addZigzagLine = (options: { stroke?: string } = {}) => {
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
  };

  const addWavyLine = (options: { stroke?: string } = {}) => {
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
  };

  const addDottedLine = (options: { stroke?: string } = {}) => {
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
  };

  const addDoubleLine = (options: { stroke?: string } = {}) => {
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
  };

  const addCurvedLine = (options: { stroke?: string } = {}) => {
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
  };

  const addStepsLine = (options: { stroke?: string } = {}) => {
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
  };

  const addThickLine = (options: { stroke?: string } = {}) => {
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
  };

  const addDashDotLine = (options: { stroke?: string } = {}) => {
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
  };

  // Frame functions
  const addSimpleFrame = (
    options: { stroke?: string; strokeWidth?: number } = {}
  ) => {
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
  };

  const addDoubleFrame = (
    options: { stroke?: string; strokeWidth?: number } = {}
  ) => {
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
  };

  const addDecorativeFrame = (
    options: { stroke?: string; strokeWidth?: number } = {}
  ) => {
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
  };

  const addRoundedFrame = (
    options: { stroke?: string; strokeWidth?: number } = {}
  ) => {
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
  };

  const addRectangle = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 150,
      fill: options.fill || "#8E24AA",
      width: 200,
      height: 100,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addEllipse = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const ellipse = new fabric.Ellipse({
      left: 200,
      top: 150,
      fill: options.fill || "#FF7043",
      rx: 100,
      ry: 60,
    });
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.renderAll();
  };

  const addStar = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const starPath =
      "M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z";
    const star = new fabric.Path(starPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#FFD700",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
  };

  const addHeart = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const heartPath =
      "M 50 25 C 50 15, 35 10, 25 25 C 15 10, 0 15, 0 25 C 0 35, 25 60, 50 85 C 75 60, 100 35, 100 25 C 100 15, 85 10, 75 25 C 65 10, 50 15, 50 25 Z";
    const heart = new fabric.Path(heartPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#E91E63",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(heart);
    canvas.setActiveObject(heart);
    canvas.renderAll();
  };

  const addHexagon = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const hexPath = "M 50 0 L 93.3 25 L 93.3 75 L 50 100 L 6.7 75 L 6.7 25 Z";
    const hexagon = new fabric.Path(hexPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#4CAF50",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(hexagon);
    canvas.setActiveObject(hexagon);
    canvas.renderAll();
  };

  const addPentagon = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const pentPath = "M 50 0 L 95 35 L 80 90 L 20 90 L 5 35 Z";
    const pentagon = new fabric.Path(pentPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#FF9800",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(pentagon);
    canvas.setActiveObject(pentagon);
    canvas.renderAll();
  };

  const addDiamond = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const diamondPath = "M 50 0 L 100 50 L 50 100 L 0 50 Z";
    const diamond = new fabric.Path(diamondPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#9C27B0",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(diamond);
    canvas.setActiveObject(diamond);
    canvas.renderAll();
  };

  const addArrowShape = (options: { fill?: string } = {}) => {
    if (!canvas || !fabric) return;
    const arrowPath =
      "M 0 40 L 60 40 L 60 20 L 100 50 L 60 80 L 60 60 L 0 60 Z";
    const arrow = new fabric.Path(arrowPath, {
      left: 200,
      top: 150,
      fill: options.fill || "#2196F3",
      scaleX: 1.5,
      scaleY: 1.5,
    });
    canvas.add(arrow);
    canvas.setActiveObject(arrow);
    canvas.renderAll();
  };

  const addStickyNote = () => {
    if (!canvas || !fabric) return;
    const noteBg = new fabric.Rect({
      width: 200,
      height: 200,
      fill: "#FFF9C4",
      shadow: "rgba(0,0,0,0.2) 2px 2px 5px",
    });
    const noteText = new fabric.Textbox("Your note here...", {
      width: 180,
      top: 10,
      left: 10,
      fontSize: 20,
      fontFamily: "Georgia",
      fill: "#000000",
      textAlign: "center",
    });

    const group = new fabric.Group([noteBg, noteText], {
      left: 150,
      top: 150,
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const addTable = (rows: number, cols: number) => {
    if (!canvas || !fabric) return;
    const cellPadding = 10;
    const cellWidth = 150;
    const cellHeight = 50;
    const tableObjects = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = new fabric.Rect({
          width: cellWidth,
          height: cellHeight,
          fill: "transparent",
          stroke: "#000",
          left: j * cellWidth,
          top: i * cellHeight,
        });

        const text = new fabric.Textbox(`Cell ${i}-${j}`, {
          width: cellWidth - cellPadding,
          height: cellHeight - cellPadding,
          left: j * cellWidth + cellPadding / 2,
          top: i * cellHeight + cellPadding / 2,
          fontSize: 16,
          fill: "#000000",
          fontFamily: "Arial",
          textAlign: "center",
        });

        tableObjects.push(cell, text);
      }
    }

    const group = new fabric.Group(tableObjects, {
      left: 150,
      top: 150,
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    saveToHistory(); // Save state after deletion
  }, [canvas, selectedObject, saveToHistory]);

  const handleCopy = useCallback(() => {
    if (!selectedObject) return;

    // Create a safe copy by extracting properties manually
    const createSafeCopy = (obj: any) => {
      const safeCopy: any = {
        type: obj.type,
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width,
        height: obj.height,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
        angle: obj.angle || 0,
        opacity: obj.opacity || 1,
        visible: obj.visible !== false,
        flipX: obj.flipX || false,
        flipY: obj.flipY || false,
        skewX: obj.skewX || 0,
        skewY: obj.skewY || 0,
      };

      // Handle different object types
      switch (obj.type) {
        case "textbox":
        case "text":
          safeCopy.text = obj.text || "Text";
          safeCopy.fontSize = obj.fontSize || 20;
          safeCopy.fontFamily = obj.fontFamily || "Arial";
          safeCopy.fontWeight = obj.fontWeight || "normal";
          safeCopy.fontStyle = obj.fontStyle || "normal";
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.textAlign = obj.textAlign || "left";
          safeCopy.lineHeight = obj.lineHeight || 1.16;
          if (obj.type === "textbox") {
            safeCopy.width = obj.width || 200;
          }
          break;

        case "rect":
        case "triangle":
        case "circle":
        case "ellipse":
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.stroke = obj.stroke;
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          if (obj.type === "circle") {
            safeCopy.radius = obj.radius || 50;
          }
          if (obj.type === "ellipse") {
            safeCopy.rx = obj.rx || 50;
            safeCopy.ry = obj.ry || 30;
          }
          break;

        case "line":
          safeCopy.x1 = obj.x1 || 0;
          safeCopy.y1 = obj.y1 || 0;
          safeCopy.x2 = obj.x2 || 100;
          safeCopy.y2 = obj.y2 || 0;
          safeCopy.stroke = obj.stroke || "#000000";
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          safeCopy.strokeDashArray = obj.strokeDashArray;
          break;

        case "path":
          safeCopy.path = obj.path;
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.stroke = obj.stroke;
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          break;

        case "image":
          safeCopy.src = obj.getSrc ? obj.getSrc() : obj.src;
          break;

        case "group":
          // For groups, store basic info and mark for special handling
          safeCopy.objects = [];
          if (obj.getObjects) {
            obj.getObjects().forEach((subObj: any) => {
              safeCopy.objects.push(createSafeCopy(subObj));
            });
          }
          break;
      }

      return safeCopy;
    };

    try {
      // First try the normal clone method
      selectedObject.clone((cloned: any) => {
        setCopiedObject(cloned);
      });
    } catch (error) {
      console.log("Normal cloning failed, using safe copy method:", error);
      // Use our safe copy method
      const safeCopy = createSafeCopy(selectedObject);
      setCopiedObject(safeCopy);
    }
  }, [selectedObject]);

  const handlePaste = useCallback(() => {
    if (!copiedObject || !canvas) return;

    const createFabricObject = (objData: any) => {
      const baseProps = {
        left: (objData.left || 0) + 10,
        top: (objData.top || 0) + 10,
        scaleX: objData.scaleX || 1,
        scaleY: objData.scaleY || 1,
        angle: objData.angle || 0,
        opacity: objData.opacity || 1,
        flipX: objData.flipX || false,
        flipY: objData.flipY || false,
        skewX: objData.skewX || 0,
        skewY: objData.skewY || 0,
      };

      let fabricObj;

      switch (objData.type) {
        case "textbox":
          fabricObj = new fabric.Textbox(objData.text || "Text", {
            ...baseProps,
            width: objData.width || 200,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
            lineHeight: objData.lineHeight || 1.16,
          });
          break;

        case "text":
          fabricObj = new fabric.Text(objData.text || "Text", {
            ...baseProps,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
          });
          break;

        case "rect":
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "circle":
          fabricObj = new fabric.Circle({
            ...baseProps,
            radius: objData.radius || 50,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "triangle":
          fabricObj = new fabric.Triangle({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "ellipse":
          fabricObj = new fabric.Ellipse({
            ...baseProps,
            rx: objData.rx || 50,
            ry: objData.ry || 30,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "line":
          fabricObj = new fabric.Line(
            [
              objData.x1 || 0,
              objData.y1 || 0,
              objData.x2 || 100,
              objData.y2 || 0,
            ],
            {
              ...baseProps,
              stroke: objData.stroke || "#000000",
              strokeWidth: objData.strokeWidth || 1,
              strokeDashArray: objData.strokeDashArray,
            }
          );
          break;

        case "path":
          fabricObj = new fabric.Path(objData.path, {
            ...baseProps,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "group":
          // Handle groups by recreating individual objects and grouping them
          if (objData.objects && objData.objects.length > 0) {
            const groupObjects = objData.objects
              .map((subObj: any) => {
                return createFabricObject({
                  ...subObj,
                  left: subObj.left || 0,
                  top: subObj.top || 0,
                });
              })
              .filter(Boolean);

            if (groupObjects.length > 0) {
              fabricObj = new fabric.Group(groupObjects, baseProps);
            }
          }
          break;

        default:
          console.warn("Unknown object type for pasting:", objData.type);
          // Fallback to rectangle
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: 100,
            height: 100,
            fill: "#cccccc",
          });
      }

      return fabricObj;
    };

    try {
      // Check if it's a proper Fabric object with clone method
      if (copiedObject.clone && typeof copiedObject.clone === "function") {
        copiedObject.clone((clonedObj: any) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          if (clonedObj.type === "activeSelection") {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj: any) => {
              canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          setSelectedObject(clonedObj);
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        });
      } else {
        // Use our safe copy data to recreate the object
        const fabricObj = createFabricObject(copiedObject);

        if (fabricObj) {
          canvas.discardActiveObject();
          canvas.add(fabricObj);
          setSelectedObject(fabricObj);
          canvas.setActiveObject(fabricObj);
          canvas.requestRenderAll();
        }
      }
    } catch (error) {
      console.error("Error pasting object:", error);
      // Final fallback - create a simple text or rectangle
      try {
        let fallbackObj;
        if (copiedObject.type === "textbox" || copiedObject.type === "text") {
          fallbackObj = new fabric.Textbox(copiedObject.text || "Copied Text", {
            left: (copiedObject.left || 0) + 10,
            top: (copiedObject.top || 0) + 10,
            fontSize: 20,
            fontFamily: "Arial",
            fill: "#000000",
          });
        } else {
          fallbackObj = new fabric.Rect({
            left: (copiedObject.left || 0) + 10,
            top: (copiedObject.top || 0) + 10,
            width: 100,
            height: 100,
            fill: "#cccccc",
          });
        }

        canvas.add(fallbackObj);
        setSelectedObject(fallbackObj);
        canvas.setActiveObject(fallbackObj);
        canvas.requestRenderAll();
      } catch (fallbackError) {
        console.error("All paste methods failed:", fallbackError);
      }
    }
  }, [copiedObject, canvas, fabric]);

  // Add keyboard event listener for copy, paste, and delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas?.getActiveObject();
      const isEditing =
        activeObject &&
        (activeObject.isEditing ||
          (activeObject.type === "textbox" && activeObject.isEditing));

      if (isEditing) return; // Don't interfere with text input

      if ((e.key === "Delete" || e.key === "Backspace") && selectedObject) {
        e.preventDefault();
        deleteSelected();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedObject) {
        e.preventDefault();
        handleCopy();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedObject, deleteSelected, handleCopy, handlePaste, canvas]);

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
    if (!activeObject || activeObject.type !== 'group') return;
    
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
  useEffect(() => {
    const handleLayerShortcuts = (e: KeyboardEvent) => {
      // Layer management shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        groupObjects();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
        e.preventDefault();
        ungroupObjects();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        e.preventDefault();
        bringForward();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault();
        sendBackward();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "]") {
        e.preventDefault();
        bringToFront();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "[") {
        e.preventDefault();
        sendToBack();
      }
    };
    window.addEventListener("keydown", handleLayerShortcuts);
    return () => window.removeEventListener("keydown", handleLayerShortcuts);
  }, [groupObjects, ungroupObjects, bringForward, sendBackward, bringToFront, sendToBack]);

  const exportAsPNG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    const pdf = new jsPDF({ orientation: "landscape" });
    const imgProps = pdf.getImageProperties(dataURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataURL, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("certificate.pdf");
  };

  const loadTemplate = (templateJson: any) => {
    if (!canvas) return;
    canvas.loadFromJSON(templateJson, () => {
      canvas.renderAll();
    });
  };

  const handleBackgroundImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || !fabric) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.Image.fromURL(data, (img: any) => {
          canvas.clear();
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
          });
        });
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleImageElementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        addImageFromURL(data);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  if (!fabric) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Loading Editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 font-sans overflow-hidden">
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden text-gray-700"
        onChange={handleImageElementUpload}
      />

      {/* Left Sidebar - Navigation */}
      <aside className="w-full md:w-20 bg-gray-800 text-white flex md:flex-col items-center p-2 md:py-4 flex-shrink-0">
        <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8">CG</div>
        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-4">
          <button
            onClick={() => setEditorMode("templates")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "templates" ? "bg-blue-500" : "hover:bg-gray-700"
            }`}
            title="Templates"
          >
            <Dna size={24} />
          </button>

          <button
            onClick={() => setEditorMode("tools")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "tools" ? "bg-indigo-500" : "hover:bg-gray-700"
            }`}
            title="Tools"
          >
            <Wrench size={24} />
          </button>
          <button
            onClick={() => setEditorMode("text")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "text" ? "bg-yellow-500" : "hover:bg-gray-700"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className={`p-2 rounded-lg hover:bg-gray-700 transition-colors`}
            title="Add Image"
          >
            <ImageIcon size={24} />
          </button>
          <button
            onClick={() => setEditorMode("elements")}
            className={`p-2 rounded-lg transition-colors ${
              editorMode === "elements" ? "bg-green-500" : "hover:bg-gray-700"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </button>
        </nav>
      </aside>

      {/* Left Panel - Tools */}
      <aside className="w-full md:w-80 bg-gray-200 p-4 overflow-y-auto h-64 md:h-screen flex-shrink-0">
        {editorMode === "templates" && (
          <TemplatesPanel
            onSelectTemplate={loadTemplate}
            onImageUpload={handleBackgroundImageUpload}
            canvas={canvas}
          />
        )}

        {editorMode === "elements" && (
          <ElementsPanel
            addSquare={addSquare}
            addCircle={addCircle}
            addTriangle={addTriangle}
            addRectangle={addRectangle}
            addEllipse={addEllipse}
            addStar={addStar}
            addHeart={addHeart}
            addHexagon={addHexagon}
            addPentagon={addPentagon}
            addDiamond={addDiamond}
            addArrowShape={addArrowShape}
            addLine={addLine}
            addDashedLine={addDashedLine}
            addArrowLine={addArrowLine}
            addZigzagLine={addZigzagLine}
            addWavyLine={addWavyLine}
            addDottedLine={addDottedLine}
            addDoubleLine={addDoubleLine}
            addCurvedLine={addCurvedLine}
            addStepsLine={addStepsLine}
            addThickLine={addThickLine}
            addDashDotLine={addDashDotLine}
          />
        )}
        {editorMode === "text" && (
          <TextPanel
            addHeading={addHeading}
            addSubheading={addSubheading}
            addBodyText={addBodyText}
            selectedObject={selectedObject}
            canvas={canvas}
          />
        )}
        {editorMode === "tools" && (
          <ToolsPanel
            canvas={canvas}
            addStickyNote={addStickyNote}
            addTable={addTable}
            addSimpleFrame={addSimpleFrame}
            addDoubleFrame={addDoubleFrame}
            addDecorativeFrame={addDecorativeFrame}
            addRoundedFrame={addRoundedFrame}
          />
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md z-10 flex justify-between items-center p-2 space-x-2 flex-shrink-0">
          {/* Layer Management Controls */}
          <div className="flex items-center space-x-2">
            {selectedObjects.length > 1 && (
              <button
                onClick={groupObjects}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Group Objects"
              >
                <Group size={16} />
                <span className="text-sm">Group</span>
              </button>
            )}
            {selectedObjects.length === 1 && selectedObjects[0]?.type === 'group' && (
              <button
                onClick={ungroupObjects}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ungroup Objects"
              >
                <Ungroup size={16} />
                <span className="text-sm">Ungroup</span>
              </button>
            )}
            {selectedObjects.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  onClick={bringToFront}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Bring to Front"
                >
                  <MoveUp size={16} />
                </button>
                <button
                  onClick={bringForward}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Bring Forward"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={sendBackward}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Send Backward"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={sendToBack}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Send to Back"
                >
                  <MoveDown size={16} />
                </button>
              </>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {selectedObject && (
              <button
                onClick={deleteSelected}
                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={exportAsPNG}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={20} />
              <span>Export PNG</span>
            </button>
            <button
              onClick={exportAsPDF}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={20} />
              <span>Export PDF</span>
            </button>
          </div>
        </header>

        {/* Alignment Toolbar */}
        <AlignmentToolbar 
          canvas={canvas} 
          selectedObjects={selectedObjects}
        />

        {/* Canvas and Properties Panel Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-300 overflow-hidden min-w-0">
            <CanvasComponent
              fabric={fabric}
              setCanvas={handleSetCanvas}
              setSelectedObject={setSelectedObject}
            />
          </div>

          {/* Right Panels */}
          <aside className="w-80 bg-white border-l border-gray-200 overflow-hidden shadow-lg flex-shrink-0 flex flex-col">
            {/* Layer Panel */}
            <div className="flex-1 overflow-hidden">
              <LayerPanel
                canvas={canvas}
                selectedObjects={selectedObjects}
                onSelectionChange={setSelectedObjects}
              />
            </div>
            
            {/* Properties Panel - Only show when object is selected */}
            {selectedObject && (
              <div className="border-t border-gray-200 max-h-96 overflow-y-auto p-4">
                <PropertiesPanel
                  selectedObject={selectedObject}
                  canvas={canvas}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
