"use client";
import { FabricCanvas } from "@/types/fabric";
import {
  Brush,
  Frame,
  Palette,
  Settings,
  Square,
  StickyNote,
} from "lucide-react";
import { useEffect } from "react";
import { useToolsStore } from "@/stores/useToolsStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HexColorPicker } from "react-colorful";

interface ToolsPanelProps {
  canvas: FabricCanvas;
  addStickyNote: () => void;
  addSimpleFrame: (options?: { stroke?: string; strokeWidth?: number }) => void;
  addDoubleFrame: (options?: { stroke?: string; strokeWidth?: number }) => void;
  addDecorativeFrame: (options?: {
    stroke?: string;
    strokeWidth?: number;
  }) => void;
  addRoundedFrame: (options?: {
    stroke?: string;
    strokeWidth?: number;
  }) => void;
}
const ToolsPanel: React.FC<ToolsPanelProps> = ({
  canvas,
  addStickyNote,
  addSimpleFrame,
  addDoubleFrame,
  addDecorativeFrame,
  addRoundedFrame,
}) => {
  // Use zustand store for tools state
  const {
    isDrawing,
    toggleDrawing,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    frameColor,
    setFrameColor,
    frameWidth,
    setFrameWidth,
    applyDrawingSettings,
  } = useToolsStore();

  useEffect(() => {
    applyDrawingSettings(canvas);
  }, [isDrawing, brushColor, brushSize, canvas, applyDrawingSettings]);
  return (
    <div className="h-full flex flex-col bg-[var(--color-background)]">
      <TooltipProvider>
        <div className="p-4 space-y-6">
          {/* Main Tools Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)] flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Tools
                <Badge variant="secondary" className="ml-auto">
                  2 tools
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleDrawing}
                      variant={isDrawing ? "default" : "outline"}
                      className={`flex flex-col items-center justify-center p-4 h-auto hover:cursor-pointer transition-all duration-200 ${
                        isDrawing
                          ? "bg-[var(--color-accent)] ring-2 ring-blue-500 ring-opacity-50 shadow-lg"
                          : "hover:bg-[var(--color-accent)] hover:bg-opacity-10"
                      }`}
                    >
                      <Brush
                        size={40}
                        className={`transition-colors duration-200 ${
                          isDrawing
                            ? "text-white"
                            : "text-[var(--color-muted-foreground)]"
                        }`}
                      />
                      <span
                        className={`mt-2 text-sm transition-colors duration-200 ${
                          isDrawing
                            ? "text-white"
                            : "text-[var(--color-muted-foreground)]"
                        }`}
                      >
                        {isDrawing ? "Drawing..." : "Draw"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isDrawing
                        ? "Exit drawing mode"
                        : "Enter drawing mode - use custom pen cursor"}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={addStickyNote}
                      variant="outline"
                      className="flex flex-col items-center justify-center p-4 h-auto hover:cursor-pointer"
                    >
                      <StickyNote
                        size={40}
                        className="text-[var(--color-muted-foreground)]"
                      />
                      <span className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                        Sticky Note
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a sticky note to your design</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Drawing Options */}
          {isDrawing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--color-foreground)] flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Drawing Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="block text-sm font-medium text-[var(--color-foreground)]">
                    Color
                  </Label>
                  <div className="mt-2">
                    <HexColorPicker
                      color={brushColor}
                      onChange={setBrushColor}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Brush Size: {brushSize}
                  </Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(value) => setBrushSize(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Frames Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)] flex items-center gap-2">
                <Frame className="w-5 h-5" />
                Frames
                <Badge variant="secondary" className="ml-auto">
                  4 types
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Frame Color and Width Controls */}
              <div className="space-y-3">
                <div>
                  <Label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Frame Color
                  </Label>
                  <div className="space-y-2">
                    <HexColorPicker
                      color={frameColor}
                      onChange={setFrameColor}
                      className="w-full"
                    />
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      {frameColor}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Frame Width: {frameWidth}px
                  </Label>
                  <Slider
                    value={[frameWidth]}
                    onValueChange={(value) => setFrameWidth(value[0])}
                    min={1}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              {/* Frame Types */}
              <div className="grid grid-cols-2 gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        addSimpleFrame({
                          stroke: frameColor,
                          strokeWidth: frameWidth,
                        })
                      }
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto hover:cursor-pointer"
                    >
                      <Square
                        size={32}
                        className="text-[var(--color-muted-foreground)] mb-2"
                      />
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        Simple
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a simple frame to your design</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        addDoubleFrame({
                          stroke: frameColor,
                          strokeWidth: frameWidth,
                        })
                      }
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto hover:cursor-pointer"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        className="text-[var(--color-muted-foreground)] mb-2"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="28"
                          height="28"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <rect
                          x="6"
                          y="6"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </svg>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        Double
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a double frame to your design</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        addDecorativeFrame({
                          stroke: frameColor,
                          strokeWidth: frameWidth,
                        })
                      }
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto hover:cursor-pointer"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        className="text-[var(--color-muted-foreground)] mb-2"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="28"
                          height="28"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <rect
                          x="6"
                          y="6"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <rect
                          x="2"
                          y="2"
                          width="3"
                          height="3"
                          fill="currentColor"
                        />
                        <rect
                          x="27"
                          y="2"
                          width="3"
                          height="3"
                          fill="currentColor"
                        />
                        <rect
                          x="2"
                          y="27"
                          width="3"
                          height="3"
                          fill="currentColor"
                        />
                        <rect
                          x="27"
                          y="27"
                          width="3"
                          height="3"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        Decorative
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a decorative frame to your design</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        addRoundedFrame({
                          stroke: frameColor,
                          strokeWidth: frameWidth,
                        })
                      }
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto hover:cursor-pointer"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        className="text-[var(--color-muted-foreground)] mb-2"
                      >
                        <rect
                          x="4"
                          y="4"
                          width="24"
                          height="24"
                          rx="4"
                          ry="4"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        Rounded
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a rounded frame to your design</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </div>
  );
};
export default ToolsPanel;
