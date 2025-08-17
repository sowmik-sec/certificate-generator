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
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect } from "react";
import { useGridAlignmentStore } from "@/stores/useGridAlignmentStore";

interface AlignmentToolbarProps {
  canvas: FabricCanvas;
  selectedObjects?: any[];
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  canvas,
  selectedObjects = [],
}) => {
  // Use zustand store for grid and alignment state
  const {
    showGrid,
    snapToGrid,
    gridSize,
    showAlignmentGuides,
    snapToObjects,
    toggleGrid,
    setGridSize,
    setShowAlignmentGuides,
    setSnapToObjects,
    setSnapToGrid,
    applyGridToCanvas,
    setupCanvasSnapping,
    removeCanvasSnapping,
    alignObjects,
    distributeObjects,
  } = useGridAlignmentStore();

  const hasSelection = selectedObjects.length > 0;

  // Grid and alignment functionality using zustand store
  const handleToggleGrid = () => {
    toggleGrid();
    applyGridToCanvas(canvas);
  };

  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    if (showGrid) {
      // Redraw grid with new size
      setTimeout(() => applyGridToCanvas(canvas), 0);
    }
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

    if (snapToGrid) {
      setupCanvasSnapping(canvas);
    } else {
      removeCanvasSnapping(canvas);
    }

    return () => {
      removeCanvasSnapping(canvas);
    };
  }, [canvas, snapToGrid, setupCanvasSnapping, removeCanvasSnapping]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Grid and Snap Controls */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={handleToggleGrid}
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
            onClick={() => {
              setSnapToGrid(!snapToGrid);
              if (!snapToGrid) {
                setupCanvasSnapping(canvas);
              } else {
                removeCanvasSnapping(canvas);
              }
            }}
            className={`p-2 rounded transition-colors ${
              snapToGrid
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Snap to Grid"
          >
            <Move size={16} />
          </button>

          <button
            onClick={() => setSnapToObjects(!snapToObjects)}
            className={`p-2 rounded transition-colors ${
              snapToObjects
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Snap to Objects"
          >
            <Move size={16} />
          </button>

          <button
            onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
            className={`p-2 rounded transition-colors ${
              showAlignmentGuides
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Show Alignment Guides"
          >
            {showAlignmentGuides ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <input
            type="range"
            min="10"
            max="50"
            value={gridSize}
            onChange={(e) => {
              handleGridSizeChange(parseInt(e.target.value));
            }}
            className="w-16"
            title={`Grid Size: ${gridSize}px`}
          />
        </div>

        {/* Horizontal Alignment */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <button
            onClick={() => alignObjects(canvas, "left")}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>

          <button
            onClick={() => alignObjects(canvas, "center")}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Center Horizontally"
          >
            <AlignCenter size={16} />
          </button>

          <button
            onClick={() => alignObjects(canvas, "right")}
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
            onClick={() => alignObjects(canvas, "top")}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Top"
          >
            <AlignStartVertical size={16} />
          </button>

          <button
            onClick={() => alignObjects(canvas, "middle")}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Center Vertically"
          >
            <AlignCenterVertical size={16} />
          </button>

          <button
            onClick={() => alignObjects(canvas, "bottom")}
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
            onClick={() => distributeObjects(canvas, "horizontal")}
            disabled={selectedObjects.length < 3}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Distribute Horizontally"
          >
            H-Dist
          </button>

          <button
            onClick={() => distributeObjects(canvas, "vertical")}
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
