"use client";
import { FabricCanvas } from "@/app/page";
import { Pencil, StickyNote, Table } from "lucide-react";
import { useEffect, useState } from "react";

interface ToolsPanelProps {
  canvas: FabricCanvas;
  addStickyNote: () => void;
  addTable: (rows: number, cols: number) => void;
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

  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
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
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <Table size={40} className="text-gray-700" />
            <span className="mt-2 text-sm text-gray-600">Table</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Rows:</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Cols:</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
          </div>
          <button
            onClick={() => addTable(rows, cols)}
            className="w-full mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Table
          </button>
        </div>
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
              className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
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
