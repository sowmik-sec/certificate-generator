"use client";
import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Settings } from "lucide-react";

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
}

const CanvasSizePanel: React.FC<CanvasSizePanelProps> = ({
  currentSize,
  onSizeChange,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentSize.width);
  const [customHeight, setCustomHeight] = useState(currentSize.height);
  const [showSizePanel, setShowSizePanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowSizePanel(false);
        setIsCustomMode(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSizePanel(false);
        setIsCustomMode(false);
      }
    };

    if (showSizePanel) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSizePanel]);

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
      <button
        onClick={() => setShowSizePanel(!showSizePanel)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Canvas Size Settings"
      >
        <Settings size={16} />
        <span>{currentSize.name}</span>
        <span className="text-gray-500">
          {currentSize.width}×{currentSize.height}
        </span>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            currentSize.orientation === "portrait"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {currentSize.orientation === "portrait" ? "📄" : "📰"}
        </span>
      </button>

      {/* Size Panel Dropdown */}
      {showSizePanel && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Canvas Size</h3>
              <button
                onClick={toggleOrientation}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Orientation"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Paper Sizes */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Paper Sizes
              </h4>
              <div className="space-y-1">
                {paperSizes.map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSizeChange(key)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentSize.name === size.name
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{size.name}</span>
                      <span className="text-gray-500">
                        {size.width}×{size.height}
                      </span>
                    </div>
                  </button>
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
                  <button
                    key={key}
                    onClick={() => handlePresetSizeChange(key)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentSize.name === size.name
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{size.name}</span>
                      <span className="text-gray-500">
                        {size.width}×{size.height}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Other Sizes */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Other</h4>
              <div className="space-y-1">
                {otherSizes.map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() =>
                      key === "CUSTOM"
                        ? setIsCustomMode(true)
                        : handlePresetSizeChange(key)
                    }
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentSize.name === size.name
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{size.name}</span>
                      <span className="text-gray-500">
                        {size.width}×{size.height}
                      </span>
                    </div>
                  </button>
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
                    <label className="block text-xs text-gray-600 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) =>
                        setCustomWidth(parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      min="100"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) =>
                        setCustomHeight(parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      min="100"
                      max="5000"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCustomSizeChange}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setIsCustomMode(false)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasSizePanel;
