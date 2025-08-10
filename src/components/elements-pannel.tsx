"use client";
import {
  Circle,
  Minus,
  Square,
  Triangle,
  Star,
  Heart,
  Hexagon,
} from "lucide-react";
import { useState } from "react";

interface ElementsPanelProps {
  addSquare: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addRectangle: () => void;
  addEllipse: () => void;
  addStar: () => void;
  addHeart: () => void;
  addHexagon: () => void;
  addPentagon: () => void;
  addDiamond: () => void;
  addArrowShape: () => void;
  addLine: (options?: { stroke?: string; strokeDashArray?: number[] }) => void;
  addDashedLine: (options?: { stroke?: string }) => void;
  addArrowLine: (options?: { stroke?: string }) => void;
  addZigzagLine: (options?: { stroke?: string }) => void;
  addWavyLine: (options?: { stroke?: string }) => void;
  addDottedLine: (options?: { stroke?: string }) => void;
  addDoubleLine: (options?: { stroke?: string }) => void;
  addCurvedLine: (options?: { stroke?: string }) => void;
  addStepsLine: (options?: { stroke?: string }) => void;
  addThickLine: (options?: { stroke?: string }) => void;
  addDashDotLine: (options?: { stroke?: string }) => void;
}
const ElementsPanel: React.FC<ElementsPanelProps> = ({
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
  addLine,
  addDashedLine,
  addArrowLine,
  addZigzagLine,
  addWavyLine,
  addDottedLine,
  addDoubleLine,
  addCurvedLine,
  addStepsLine,
  addThickLine,
  addDashDotLine,
}) => {
  const [lineColor, setLineColor] = useState("#333333");

  const shapes = [
    {
      name: "Square",
      icon: <Square size={32} className="text-gray-700" />,
      action: addSquare,
    },
    {
      name: "Rectangle",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-gray-700"
        >
          <rect
            x="4"
            y="10"
            width="24"
            height="12"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: addRectangle,
    },
    {
      name: "Circle",
      icon: <Circle size={32} className="text-gray-700" />,
      action: addCircle,
    },
    {
      name: "Ellipse",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-gray-700"
        >
          <ellipse
            cx="16"
            cy="16"
            rx="12"
            ry="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: addEllipse,
    },
    {
      name: "Triangle",
      icon: <Triangle size={32} className="text-gray-700" />,
      action: addTriangle,
    },
    {
      name: "Star",
      icon: <Star size={32} className="text-gray-700" />,
      action: addStar,
    },
    {
      name: "Heart",
      icon: <Heart size={32} className="text-gray-700" />,
      action: addHeart,
    },
    {
      name: "Hexagon",
      icon: <Hexagon size={32} className="text-gray-700" />,
      action: addHexagon,
    },
    {
      name: "Pentagon",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-gray-700"
        >
          <path
            d="M16 4 L28 12 L24 26 L8 26 L4 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: addPentagon,
    },
    {
      name: "Diamond",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-gray-700"
        >
          <path
            d="M16 4 L28 16 L16 28 L4 16 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: addDiamond,
    },
    {
      name: "Arrow",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-gray-700"
        >
          <path
            d="M4 14 L20 14 L20 10 L28 16 L20 22 L20 18 L4 18 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: addArrowShape,
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
      name: "Dotted Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <circle cx="8" cy="20" r="2" fill="currentColor" />
          <circle cx="16" cy="20" r="2" fill="currentColor" />
          <circle cx="24" cy="20" r="2" fill="currentColor" />
          <circle cx="32" cy="20" r="2" fill="currentColor" />
        </svg>
      ),
      action: () => addDottedLine({ stroke: lineColor }),
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
    {
      name: "Double Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 16 H35 M5 24 H35"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addDoubleLine({ stroke: lineColor }),
    },
    {
      name: "Curved Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 30 Q20 5, 35 30"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addCurvedLine({ stroke: lineColor }),
    },
    {
      name: "Steps Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 25 L10 25 L10 15 L15 15 L15 25 L20 25 L20 15 L25 15 L25 25 L30 25 L30 15 L35 15"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addStepsLine({ stroke: lineColor }),
    },
    {
      name: "Thick Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 20 H35"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addThickLine({ stroke: lineColor }),
    },
    {
      name: "Dash-Dot",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-gray-700"
        >
          <path
            d="M5 20 H13 M17 20 H19 M23 20 H31 M35 20 H37"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => addDashDotLine({ stroke: lineColor }),
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Lines</h3>
        <div className="grid grid-cols-3 gap-3">
          {lines.map((line) => (
            <button
              key={line.name}
              onClick={line.action}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
            >
              {line.icon}
              <span className="mt-1 text-xs text-center text-gray-600">
                {line.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Shapes</h3>
        <div className="grid grid-cols-3 gap-3">
          {shapes.map((shape) => (
            <button
              key={shape.name}
              onClick={shape.action}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
            >
              {shape.icon}
              <span className="mt-1 text-xs text-gray-600">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel;
