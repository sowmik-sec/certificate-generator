/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas, FabricModule } from "@/app/page";
import { FabricObject } from "fabric";
import { useCallback, useEffect, useRef } from "react";

interface CanvasComponentProps {
  fabric: FabricModule;
  setCanvas: (canvas: any) => void;
  setSelectedObject: (obj: FabricObject | null) => void;
}
const CanvasComponent: React.FC<CanvasComponentProps> = ({
  fabric,
  setCanvas,
  setSelectedObject,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = useCallback((canvasInstance: FabricCanvas) => {
    if (!containerRef.current || !canvasInstance) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scale = Math.min(width / 800, height / 566);
    canvasInstance.setDimensions({ width: 800 * scale, height: 566 * scale });
    canvasInstance.setZoom(scale);
    canvasInstance.renderAll();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !fabric) return;
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 566,
      backgroundColor: "#ffffff",
    });

    canvasInstance.on("selection:created", (e: any) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvasInstance.on("selection:updated", (e: any) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvasInstance.on("selection:cleared", () => setSelectedObject(null));
    canvasInstance.on("object:modified", () => canvasInstance.renderAll());

    // Add double-click event listener for editing text in groups
    canvasInstance.on("mouse:dblclick", (options: any) => {
      const target = options.target;
      if (target && target.isType("group")) {
        const group = target;
        const subTarget =
          options.subTargets &&
          options.subTargets.find((o: any) => o.isType("textbox"));

        if (subTarget) {
          const textbox = subTarget;
          const items = group.getObjects();

          group.toActiveSelection();
          canvasInstance.setActiveObject(textbox);
          textbox.enterEditing();
          textbox.selectAll();

          textbox.once("editing:exited", () => {
            const newGroup = new fabric.Group(items, {
              left: group.left,
              top: group.top,
            });
            canvasInstance.remove(...items);
            canvasInstance.add(newGroup);
            canvasInstance.setActiveObject(newGroup);
          });
        }
      }
    });

    setCanvas(canvasInstance);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas(canvasInstance);
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      canvasInstance.dispose();
    };
  }, [fabric, setCanvas, setSelectedObject, resizeCanvas]);

  return (
    <div ref={containerRef} className="w-full h-full shadow-lg">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasComponent;
