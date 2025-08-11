/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas } from "@/types/fabric";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Grid3x3,
  Move,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AlignmentToolbarProps {
  canvas: FabricCanvas;
  selectedObjects?: any[];
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  canvas,
  selectedObjects = [],
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  const hasSelection = selectedObjects.length > 0;

  // Grid functionality
  const toggleGrid = () => {
    if (!canvas) return;

    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);

    if (newShowGrid) {
      drawGrid();
    } else {
      removeGrid();
    }
    canvas.renderAll();
  };

  const drawGrid = () => {
    if (!canvas) return;

    removeGrid(); // Remove existing grid first

    const canvasWidth = canvas.getWidth() / canvas.getZoom();
    const canvasHeight = canvas.getHeight() / canvas.getZoom();

    const gridGroup = [];

    // Get fabric from global window object since we're in the browser
    const fabric = (window as any).fabric;
    if (!fabric) return;

    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      const line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: "#ddd",
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "grid-line",
      });
      gridGroup.push(line);
    }

    // Horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      const line = new fabric.Line([0, i, canvasWidth, i], {
        stroke: "#ddd",
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "grid-line",
      });
      gridGroup.push(line);
    }

    gridGroup.forEach((line) => {
      canvas.add(line);
      canvas.sendToBack(line);
    });
  };

  const removeGrid = () => {
    if (!canvas) return;
    const objects = canvas
      .getObjects()
      .filter((obj: any) => obj.id === "grid-line");
    objects.forEach((obj: any) => canvas.remove(obj));
  };

  // Snap to grid functionality
  const toggleSnapToGrid = () => {
    setSnapToGrid(!snapToGrid);
  };

  // Alignment functions
  const alignLeft = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const leftmost = Math.min(
      ...activeObjects.map(
        (obj: any) => obj.left - (obj.width * obj.scaleX) / 2
      )
    );

    activeObjects.forEach((obj: any) => {
      obj.set({ left: leftmost + (obj.width * obj.scaleX) / 2 });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const alignCenterHorizontal = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const canvasCenter = canvas.getWidth() / canvas.getZoom() / 2;

    activeObjects.forEach((obj: any) => {
      obj.set({ left: canvasCenter });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const alignRight = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const rightmost = Math.max(
      ...activeObjects.map(
        (obj: any) => obj.left + (obj.width * obj.scaleX) / 2
      )
    );

    activeObjects.forEach((obj: any) => {
      obj.set({ left: rightmost - (obj.width * obj.scaleX) / 2 });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const alignTop = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const topmost = Math.min(
      ...activeObjects.map(
        (obj: any) => obj.top - (obj.height * obj.scaleY) / 2
      )
    );

    activeObjects.forEach((obj: any) => {
      obj.set({ top: topmost + (obj.height * obj.scaleY) / 2 });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const alignCenterVertical = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const canvasMiddle = canvas.getHeight() / canvas.getZoom() / 2;

    activeObjects.forEach((obj: any) => {
      obj.set({ top: canvasMiddle });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const alignBottom = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const bottommost = Math.max(
      ...activeObjects.map(
        (obj: any) => obj.top + (obj.height * obj.scaleY) / 2
      )
    );

    activeObjects.forEach((obj: any) => {
      obj.set({ top: bottommost - (obj.height * obj.scaleY) / 2 });
      obj.setCoords();
    });

    canvas.renderAll();
  };

  const distributeHorizontal = () => {
    if (!canvas || selectedObjects.length < 3) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 3) return;

    const sortedObjects = [...activeObjects].sort(
      (a: any, b: any) => a.left - b.left
    );
    const leftmost = sortedObjects[0].left;
    const rightmost = sortedObjects[sortedObjects.length - 1].left;
    const totalWidth = rightmost - leftmost;
    const spacing = totalWidth / (sortedObjects.length - 1);

    sortedObjects.forEach((obj: any, index: number) => {
      if (index > 0 && index < sortedObjects.length - 1) {
        obj.set({ left: leftmost + spacing * index });
        obj.setCoords();
      }
    });

    canvas.renderAll();
  };

  const distributeVertical = () => {
    if (!canvas || selectedObjects.length < 3) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length < 3) return;

    const sortedObjects = [...activeObjects].sort(
      (a: any, b: any) => a.top - b.top
    );
    const topmost = sortedObjects[0].top;
    const bottommost = sortedObjects[sortedObjects.length - 1].top;
    const totalHeight = bottommost - topmost;
    const spacing = totalHeight / (sortedObjects.length - 1);

    sortedObjects.forEach((obj: any, index: number) => {
      if (index > 0 && index < sortedObjects.length - 1) {
        obj.set({ top: topmost + spacing * index });
        obj.setCoords();
      }
    });

    canvas.renderAll();
  };

  // Layering functions
  const bringToFront = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.bringToFront(obj);
    });
    canvas.renderAll();
  };

  const sendToBack = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.sendToBack(obj);
    });
    canvas.renderAll();
  };

  const bringForward = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.bringForward(obj);
    });
    canvas.renderAll();
  };

  const sendBackward = () => {
    if (!canvas || !hasSelection) return;
    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj: any) => {
      canvas.sendBackward(obj);
    });
    canvas.renderAll();
  };

  // Setup snap to grid when enabled
  useEffect(() => {
    if (!canvas) return;

    const handleObjectMoving = (e: any) => {
      if (!snapToGrid) return;

      const obj = e.target;
      const snapValue = gridSize;

      obj.set({
        left: Math.round(obj.left / snapValue) * snapValue,
        top: Math.round(obj.top / snapValue) * snapValue,
      });
    };

    if (snapToGrid) {
      canvas.on("object:moving", handleObjectMoving);
    }

    return () => {
      canvas.off("object:moving", handleObjectMoving);
    };
  }, [canvas, snapToGrid, gridSize]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Grid and Snap Controls */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={toggleGrid}
            className={`p-2 rounded transition-colors ${
              showGrid
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 size={16} />
          </button>

          <button
            onClick={toggleSnapToGrid}
            className={`p-2 rounded transition-colors ${
              snapToGrid
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Snap to Grid"
          >
            <Move size={16} />
          </button>

          <input
            type="range"
            min="10"
            max="50"
            value={gridSize}
            onChange={(e) => {
              setGridSize(parseInt(e.target.value));
              if (showGrid) {
                setTimeout(drawGrid, 0);
              }
            }}
            className="w-16"
            title={`Grid Size: ${gridSize}px`}
          />
        </div>

        {/* Horizontal Alignment */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={alignLeft}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>

          <button
            onClick={alignCenterHorizontal}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Center Horizontally"
          >
            <AlignCenter size={16} />
          </button>

          <button
            onClick={alignRight}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Vertical Alignment */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={alignTop}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Top"
          >
            <AlignStartVertical size={16} />
          </button>

          <button
            onClick={alignCenterVertical}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Center Vertically"
          >
            <AlignCenterVertical size={16} />
          </button>

          <button
            onClick={alignBottom}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Bottom"
          >
            <AlignEndVertical size={16} />
          </button>
        </div>

        {/* Distribution */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={distributeHorizontal}
            disabled={selectedObjects.length < 3}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Distribute Horizontally"
          >
            H-Dist
          </button>

          <button
            onClick={distributeVertical}
            disabled={selectedObjects.length < 3}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Distribute Vertically"
          >
            V-Dist
          </button>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={bringToFront}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bring to Front"
          >
            Front
          </button>

          <button
            onClick={bringForward}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bring Forward"
          >
            +1
          </button>

          <button
            onClick={sendBackward}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Backward"
          >
            -1
          </button>

          <button
            onClick={sendToBack}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send to Back"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlignmentToolbar;
