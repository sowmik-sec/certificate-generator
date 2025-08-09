"use client";
import { Circle, Minus, Square, Triangle } from "lucide-react";

interface ElementsPanelProps {
  addSquare: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addDottedLine: () => void;
  addArrowLine: () => void;
}
const ElementsPanel: React.FC<ElementsPanelProps> = ({
  addSquare,
  addCircle,
  addTriangle,
  addLine,
  addDottedLine,
  addArrowLine,
}) => {
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
      action: addLine,
    },
    {
      name: "Dotted Line",
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
      action: addDottedLine,
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
      action: addArrowLine,
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lines</h3>
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
