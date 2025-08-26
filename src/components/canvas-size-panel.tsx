"use client";
import React, { useState } from "react";
import { RotateCcw, Settings } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
  orientation: "portrait" | "landscape";
}

export const PRESET_SIZES: Record<string, CanvasSize> = {
  A4: {
    width: 794,
    height: 1123,
    name: "A4 (210×297mm)",
    orientation: "portrait",
  },
  A4_LANDSCAPE: {
    width: 1123,
    height: 794,
    name: "A4 Landscape",
    orientation: "landscape",
  },
  LETTER: {
    width: 816,
    height: 1056,
    name: "Letter (8.5×11in)",
    orientation: "portrait",
  },
  LETTER_LANDSCAPE: {
    width: 1056,
    height: 816,
    name: "Letter Landscape",
    orientation: "landscape",
  },
  A3: {
    width: 1123,
    height: 1587,
    name: "A3 (297×420mm)",
    orientation: "portrait",
  },
  A3_LANDSCAPE: {
    width: 1587,
    height: 1123,
    name: "A3 Landscape",
    orientation: "landscape",
  },
  LEGAL: {
    width: 816,
    height: 1344,
    name: "Legal (8.5×14in)",
    orientation: "portrait",
  },
  LEGAL_LANDSCAPE: {
    width: 1344,
    height: 816,
    name: "Legal Landscape",
    orientation: "landscape",
  },
  TABLOID: {
    width: 1056,
    height: 1632,
    name: "Tabloid (11×17in)",
    orientation: "portrait",
  },
  TABLOID_LANDSCAPE: {
    width: 1632,
    height: 1056,
    name: "Tabloid Landscape",
    orientation: "landscape",
  },
  SQUARE: {
    width: 800,
    height: 800,
    name: "Square (800×800px)",
    orientation: "portrait",
  },
  SOCIAL_MEDIA: {
    width: 1080,
    height: 1080,
    name: "Social Media Square",
    orientation: "portrait",
  },
  FACEBOOK_COVER: {
    width: 1640,
    height: 859,
    name: "Facebook Cover",
    orientation: "landscape",
  },
  INSTAGRAM_POST: {
    width: 1080,
    height: 1080,
    name: "Instagram Post",
    orientation: "portrait",
  },
  INSTAGRAM_STORY: {
    width: 1080,
    height: 1920,
    name: "Instagram Story",
    orientation: "portrait",
  },
  TWITTER_HEADER: {
    width: 1500,
    height: 500,
    name: "Twitter Header",
    orientation: "landscape",
  },
  LINKEDIN_BANNER: {
    width: 1584,
    height: 396,
    name: "LinkedIn Banner",
    orientation: "landscape",
  },
  CUSTOM: { width: 800, height: 566, name: "Custom", orientation: "landscape" },
};

interface CanvasSizePanelProps {
  currentSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
  shouldShow?: boolean; // Whether the panel should be visible
}

const CanvasSizePanel: React.FC<CanvasSizePanelProps> = ({
  currentSize,
  onSizeChange,
  shouldShow = true, // Default to showing the panel
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentSize.width);
  const [customHeight, setCustomHeight] = useState(currentSize.height);
  const [showSizePanel, setShowSizePanel] = useState(false);

  // Use click outside hook to close panel (must be called before conditional return)
  const panelRef = useClickOutside<HTMLDivElement>({
    enabled: showSizePanel && shouldShow,
    onClickOutside: () => {
      setShowSizePanel(false);
      setIsCustomMode(false);
    },
  });

  // Hide the panel if shouldShow is false
  if (!shouldShow) {
    return null;
  }

  const handlePresetSizeChange = (presetKey: string) => {
    const size = PRESET_SIZES[presetKey];
    onSizeChange(size);
    setIsCustomMode(false);
    setShowSizePanel(false);
  };

  const handleCustomSizeChange = () => {
    const customSize: CanvasSize = {
      width: Math.max(100, customWidth),
      height: Math.max(100, customHeight),
      name: `Custom (${customWidth}×${customHeight}px)`,
      orientation: customWidth > customHeight ? "landscape" : "portrait",
    };
    onSizeChange(customSize);
    setShowSizePanel(false);
  };

  const toggleOrientation = () => {
    const newSize: CanvasSize = {
      width: currentSize.height,
      height: currentSize.width,
      name: currentSize.name.includes("Landscape")
        ? currentSize.name.replace(" Landscape", "")
        : currentSize.name + " Landscape",
      orientation:
        currentSize.orientation === "portrait" ? "landscape" : "portrait",
    };
    onSizeChange(newSize);
  };

  // Group presets by category
  const paperSizes = Object.entries(PRESET_SIZES).filter(
    ([key]) =>
      key.includes("A4") ||
      key.includes("A3") ||
      key.includes("LETTER") ||
      key.includes("LEGAL") ||
      key.includes("TABLOID")
  );

  const socialMediaSizes = Object.entries(PRESET_SIZES).filter(
    ([key]) =>
      key.includes("SOCIAL") ||
      key.includes("FACEBOOK") ||
      key.includes("INSTAGRAM") ||
      key.includes("TWITTER") ||
      key.includes("LINKEDIN")
  );

  const otherSizes = Object.entries(PRESET_SIZES).filter(
    ([key]) => key === "SQUARE" || key === "CUSTOM"
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Size Display Button */}
      <Button
        onClick={() => setShowSizePanel(!showSizePanel)}
        variant="outline"
        className="flex items-center space-x-2 px-3 py-2 text-sm"
        title="Canvas Size Settings"
      >
        <Settings size={16} />
        <span>{currentSize.name}</span>
        <span className="text-gray-500">
          {currentSize.width}×{currentSize.height}
        </span>
        <Badge
          variant={
            currentSize.orientation === "portrait" ? "default" : "secondary"
          }
          className={
            currentSize.orientation === "portrait"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }
        >
          {currentSize.orientation === "portrait" ? "📄" : "📰"}
        </Badge>
      </Button>

      {/* Size Panel Dropdown */}
      {showSizePanel && (
        <Card className="absolute top-full left-0 mt-2 w-80 shadow-lg z-50 bg-white border">
          <CardHeader className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Canvas Size</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOrientation}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Orientation"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[400px] w-full">
              <div className="pr-4">
                {/* Paper Sizes */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Paper Sizes
                  </h4>
                  <div className="space-y-1">
                    {paperSizes.map(([key, size]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        onClick={() => handlePresetSizeChange(key)}
                        className={`w-full justify-between text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentSize.name === size.name
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="text-gray-500">
                          {size.width}×{size.height}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Social Media Sizes */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Social Media
                  </h4>
                  <div className="space-y-1">
                    {socialMediaSizes.map(([key, size]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        onClick={() => handlePresetSizeChange(key)}
                        className={`w-full justify-between text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentSize.name === size.name
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="text-gray-500">
                          {size.width}×{size.height}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Other Sizes */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Other
                  </h4>
                  <div className="space-y-1">
                    {otherSizes.map(([key, size]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        onClick={() =>
                          key === "CUSTOM"
                            ? setIsCustomMode(true)
                            : handlePresetSizeChange(key)
                        }
                        className={`w-full justify-between text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          currentSize.name === size.name
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="text-gray-500">
                          {size.width}×{size.height}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Size Input */}
                {isCustomMode && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Custom Size
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="block text-xs text-gray-600 mb-1">
                          Width (px)
                        </Label>
                        <Input
                          type="number"
                          value={customWidth}
                          onChange={(e) =>
                            setCustomWidth(parseInt(e.target.value) || 0)
                          }
                          className="w-full text-sm"
                          min="100"
                          max="5000"
                        />
                      </div>
                      <div>
                        <Label className="block text-xs text-gray-600 mb-1">
                          Height (px)
                        </Label>
                        <Input
                          type="number"
                          value={customHeight}
                          onChange={(e) =>
                            setCustomHeight(parseInt(e.target.value) || 0)
                          }
                          className="w-full text-sm"
                          min="100"
                          max="5000"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCustomSizeChange}
                        className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsCustomMode(false)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CanvasSizePanel;
