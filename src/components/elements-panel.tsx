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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ElementsPanelProps {
  addSquare: (options?: { fill?: string }) => void;
  addCircle: (options?: { fill?: string }) => void;
  addTriangle: (options?: { fill?: string }) => void;
  addRectangle: (options?: { fill?: string }) => void;
  addEllipse: (options?: { fill?: string }) => void;
  addStar: (options?: { fill?: string }) => void;
  addHeart: (options?: { fill?: string }) => void;
  addHexagon: (options?: { fill?: string }) => void;
  addPentagon: (options?: { fill?: string }) => void;
  addDiamond: (options?: { fill?: string }) => void;
  addArrowShape: (options?: { fill?: string }) => void;
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
  const lineColor = "#333333";
  const shapeColor = "#4A90E2";

  const shapes = [
    {
      name: "Square",
      icon: (
        <Square size={32} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addSquare({ fill: shapeColor }),
    },
    {
      name: "Rectangle",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-[var(--color-muted-foreground)]"
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
      action: () => addRectangle({ fill: shapeColor }),
    },
    {
      name: "Circle",
      icon: (
        <Circle size={32} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addCircle({ fill: shapeColor }),
    },
    {
      name: "Ellipse",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-[var(--color-muted-foreground)]"
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
      action: () => addEllipse({ fill: shapeColor }),
    },
    {
      name: "Triangle",
      icon: (
        <Triangle size={32} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addTriangle({ fill: shapeColor }),
    },
    {
      name: "Star",
      icon: <Star size={32} className="text-[var(--color-muted-foreground)]" />,
      action: () => addStar({ fill: shapeColor }),
    },
    {
      name: "Heart",
      icon: (
        <Heart size={32} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addHeart({ fill: shapeColor }),
    },
    {
      name: "Hexagon",
      icon: (
        <Hexagon size={32} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addHexagon({ fill: shapeColor }),
    },
    {
      name: "Pentagon",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-[var(--color-muted-foreground)]"
        >
          <path
            d="M16 4 L28 12 L24 26 L8 26 L4 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: () => addPentagon({ fill: shapeColor }),
    },
    {
      name: "Diamond",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-[var(--color-muted-foreground)]"
        >
          <path
            d="M16 4 L28 16 L16 28 L4 16 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: () => addDiamond({ fill: shapeColor }),
    },
    {
      name: "Arrow",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="text-[var(--color-muted-foreground)]"
        >
          <path
            d="M4 14 L20 14 L20 10 L28 16 L20 22 L20 18 L4 18 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      action: () => addArrowShape({ fill: shapeColor }),
    },
  ];

  const lines = [
    {
      name: "Line",
      icon: (
        <Minus size={40} className="text-[var(--color-muted-foreground)]" />
      ),
      action: () => addLine({ stroke: lineColor }),
    },
    {
      name: "Dashed Line",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
          className="text-[var(--color-muted-foreground)]"
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
    <div className="h-full flex flex-col bg-[var(--color-background)]">
      <TooltipProvider>
        <div className="p-4 space-y-6">
          {/* Lines Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
                <Minus className="w-5 h-5" />
                Lines
                <Badge variant="secondary" className="ml-auto">
                  {lines.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {lines.map((line) => (
                  <Tooltip key={line.name}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={line.action}
                        variant="outline"
                        className="flex flex-col items-center justify-center p-3 h-auto bg-[var(--color-background)] hover:bg-[var(--color-muted)] hover:cursor-pointer transition-colors"
                      >
                        {line.icon}
                        <span className="mt-1 text-xs text-center text-[var(--color-muted-foreground)]">
                          {line.name}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a {line.name.toLowerCase()} to your design</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Shapes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
                <Square className="w-5 h-5" />
                Shapes
                <Badge variant="secondary" className="ml-auto">
                  {shapes.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {shapes.map((shape) => (
                  <Tooltip key={shape.name}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={shape.action}
                        variant="outline"
                        className="flex flex-col items-center justify-center p-3 h-auto bg-[var(--color-background)] hover:bg-[var(--color-muted)] hover:cursor-pointer transition-colors"
                      >
                        {shape.icon}
                        <span className="mt-1 text-xs text-center text-[var(--color-muted-foreground)]">
                          {shape.name}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Add a {shape.name.toLowerCase()} shape to your design
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ElementsPanel;
