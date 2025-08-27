/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useCanvasShapes = (canvas: any, fabric: any) => {
  const addSquare = useCallback(
    (options: { fill?: string } = {}) => {
      if (!canvas || !fabric) return;
      const rect = new fabric.Rect({
        left: 200,
        top: 150,
        fill: options.fill || "#4A90E2",
        width: 150,
        height: 150,
        id: `rect-${Date.now()}`,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
      });

      canvas.add(rect);
      canvas.setActiveObject(rect);
      rect.setCoords();
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  const addCircle = useCallback(
    (options: { fill?: string } = {}) => {
      if (!canvas || !fabric) return;
      const circle = new fabric.Circle({
        left: 200,
        top: 150,
        fill: options.fill || "#E91E63",
        radius: 75,
        id: `circle-${Date.now()}`,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
      });

      canvas.add(circle);
      canvas.setActiveObject(circle);
      circle.setCoords();
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  const addTriangle = useCallback(
    (options: { fill?: string } = {}) => {
      if (!canvas || !fabric) return;
      const triangle = new fabric.Triangle({
        left: 200,
        top: 150,
        fill: options.fill || "#FFC107",
        width: 150,
        height: 150,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
      });

      canvas.add(triangle);
      canvas.setActiveObject(triangle);
      triangle.setCoords();
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  const addRectangle = useCallback(
    (options: { fill?: string } = {}) => {
      if (!canvas || !fabric) return;
      const rect = new fabric.Rect({
        left: 200,
        top: 150,
        fill: options.fill || "#8E24AA",
        width: 200,
        height: 100,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
      });

      canvas.add(rect);
      canvas.setActiveObject(rect);
      rect.setCoords();
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  const addEllipse = useCallback(
    (options: { fill?: string } = {}) => {
      if (!canvas || !fabric) return;
      const ellipse = new fabric.Ellipse({
        left: 200,
        top: 150,
        fill: options.fill || "#FF7043",
        rx: 100,
        ry: 60,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
      });

      canvas.add(ellipse);
      canvas.setActiveObject(ellipse);
      ellipse.setCoords();
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  const addStar = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  const addHeart = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  const addHexagon = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  const addPentagon = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  const addDiamond = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  const addArrowShape = useCallback(
    (options: { fill?: string } = {}) => {
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
    },
    [canvas, fabric]
  );

  return {
    addSquare,
    addCircle,
    addTriangle,
    addRectangle,
    addEllipse,
    addStar,
    addHeart,
    addHexagon,
    addPentagon,
    addDiamond,
    addArrowShape,
  };
};
