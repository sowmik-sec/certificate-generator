"use client";
import { FabricCanvas } from "@/app/page";
import { Pencil, StickyNote, Table } from "lucide-react";
import { useEffect, useState } from "react";

interface ToolsPanelProps {
  canvas: FabricCanvas;
  addStickyNote: () => void;
  addTable: () => void;
}
const ToolsPanel: React.FC<ToolsPanelProps> = ({
  canvas,
  addStickyNote,
  addTable,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = isDrawing;
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;
  }, [isDrawing, brushColor, brushSize, canvas]);

  const toggleDrawing = () => setIsDrawing(!isDrawing);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Tools</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={toggleDrawing}
          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm transition-all ${
            isDrawing ? "bg-blue-200" : "bg-white hover:bg-gray-50"
          }`}
        >
          <Pencil size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Draw</span>
        </button>
        <button
          onClick={addStickyNote}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        >
          <StickyNote size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Sticky Note</span>
        </button>
        <button
          onClick={addTable}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        >
          <Table size={40} className="text-gray-700" />
          <span className="mt-2 text-sm text-gray-600">Table</span>
        </button>
      </div>
      {isDrawing && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg space-y-3">
          <h4 className="font-semibold">Drawing Options</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brush Size: {brushSize}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
              className="mt-1 block w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ToolsPanel;
