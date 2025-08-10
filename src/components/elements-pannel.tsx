"use client";
import { Circle, Minus, Square, Triangle } from "lucide-react";
import { useState } from "react";

interface ElementsPanelProps {
  addSquare: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: (options?: { stroke?: string; strokeDashArray?: number[] }) => void;
  addDashedLine: (options?: { stroke?: string }) => void;
  addArrowLine: (options?: { stroke?: string }) => void;
  addZigzagLine: (options?: { stroke?: string }) => void;
  addWavyLine: (options?: { stroke?: string }) => void;
}
const ElementsPanel: React.FC<ElementsPanelProps> = ({
  addSquare,
  addCircle,
  addTriangle,
  addLine,
  addDashedLine,
  addArrowLine,
  addZigzagLine,
  addWavyLine,
}) => {
  const [lineColor, setLineColor] = useState("#333333");

  const shapes = [
    {
      name: "Square",
      icon: <Square size={40} className="text-gray-700" />,
      action: addSquare,
    },
    {
      name: "Circle",
      icon: <Circle size={40} className="text-gray-700" />,
      action: addCircle,
    },
    {
      name: "Triangle",
      icon: <Triangle size={40} className="text-gray-700" />,
      action: addTriangle,
    },
  ];

  const lines = [
    {
      name: "Line",
      icon: <Minus size={40} className="text-gray-700" />,
      action: () => addLine({ stroke: lineColor }),
    },
    {
      name: "Dashed Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 20 H 15 M 25 20 H 35"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addDashedLine({ stroke: lineColor }),
    },
    {
      name: "Arrow",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 20 H 30 L 25 15 M 30 20 L 25 25"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: () => addArrowLine({ stroke: lineColor }),
    },
    {
      name: "Zigzag Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 35 L10 5 L20 35 L30 5 L35 35"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addZigzagLine({ stroke: lineColor }),
    },
    {
      name: "Wavy Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 20 Q10 5, 15 20 T25 20 T35 20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addWavyLine({ stroke: lineColor }),
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lines</h3>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Line Color
          </label>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className="w-full h-10 rounded-md border-gray-300 shadow-sm cursor-pointer text-gray-700"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {lines.map((line) => (
            <button
              key={line.name}
              onClick={line.action}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
            >
              {line.icon}
              <span className="mt-2 text-sm text-center text-gray-600">
                {line.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Shapes</h3>
        <div className="grid grid-cols-2 gap-4">
          {shapes.map((shape) => (
            <button
              key={shape.name}
              onClick={shape.action}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
            >
              {shape.icon}
              <span className="mt-2 text-sm text-gray-600">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel;
