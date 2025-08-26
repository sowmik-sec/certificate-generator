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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "./ui/button";

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
    <Card className="border-b px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Grid and Snap Controls */}
        <div className="flex items-center space-x-1 pr-2">
          <Button
            onClick={handleToggleGrid}
            variant={showGrid ? "default" : "outline"}
            size="sm"
            className="p-2 h-auto"
            title="Toggle Grid"
          >
            <Grid3x3 size={16} />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />

          <Button
            onClick={() => {
              setSnapToGrid(!snapToGrid);
              if (!snapToGrid) {
                setupCanvasSnapping(canvas);
              } else {
                removeCanvasSnapping(canvas);
              }
            }}
            variant={snapToGrid ? "default" : "outline"}
            size="sm"
            className="p-2 h-auto"
            title="Snap to Grid"
          >
            <Move size={16} />
          </Button>

          <Button
            onClick={() => setSnapToObjects(!snapToObjects)}
            variant={snapToObjects ? "default" : "outline"}
            size="sm"
            className="p-2 h-auto"
            title="Snap to Objects"
          >
            <Move size={16} />
          </Button>

          <Button
            onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
            variant={showAlignmentGuides ? "default" : "outline"}
            size="sm"
            className="p-2 h-auto"
            title="Show Alignment Guides"
          >
            {showAlignmentGuides ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>

          <Slider
            value={[gridSize]}
            onValueChange={(value) => handleGridSizeChange(value[0])}
            min={10}
            max={50}
            step={1}
            className="w-16"
            title={`Grid Size: ${gridSize}px`}
          />
        </div>

        {/* Horizontal Alignment */}
        <div className="flex items-center space-x-1 pr-2">
          <Button
            onClick={() => alignObjects(canvas, "left")}
            disabled={!hasSelection}
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </Button>

          <Button
            onClick={() => alignObjects(canvas, "center")}
            disabled={!hasSelection}
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            title="Center Horizontally"
          >
            <AlignCenter size={16} />
          </Button>

          <Button
            onClick={() => alignObjects(canvas, "right")}
            disabled={!hasSelection}
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            title="Align Right"
          >
            <AlignRight size={16} />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
        </div>

        {/* Vertical Alignment */}
        <div className="flex items-center space-x-1 pr-2">
          <Button
            onClick={() => alignObjects(canvas, "top")}
            disabled={!hasSelection}
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            title="Align Top"
          >
            <AlignStartVertical size={16} />
          </Button>

          <Button
            onClick={() => alignObjects(canvas, "middle")}
            disabled={!hasSelection}
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            title="Center Vertically"
          >
            <AlignCenterVertical size={16} />
          </Button>

          <Button
            onClick={() => alignObjects(canvas, "bottom")}
            disabled={!hasSelection}
            className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Align Bottom"
          >
            <AlignEndVertical size={16} />
          </Button>
        </div>

        {/* Distribution */}
        <div className="flex items-center space-x-1 pr-2 border-r border-gray-300">
          <Button
            onClick={() => distributeObjects(canvas, "horizontal")}
            disabled={selectedObjects.length < 3}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Distribute Horizontally"
          >
            H-Dist
          </Button>

          <Button
            onClick={() => distributeObjects(canvas, "vertical")}
            disabled={selectedObjects.length < 3}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Distribute Vertically"
          >
            V-Dist
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center space-x-1">
          <Button
            onClick={bringToFront}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bring to Front"
          >
            Front
          </Button>

          <Button
            onClick={bringForward}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bring Forward"
          >
            +1
          </Button>

          <Button
            onClick={sendBackward}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Backward"
          >
            -1
          </Button>

          <Button
            onClick={sendToBack}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send to Back"
          >
            Back
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AlignmentToolbar;
