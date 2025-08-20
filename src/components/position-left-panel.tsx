/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Lock,
  Unlock,
  Layers,
  X,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { useLayerStore } from "@/stores/useLayerStore";

interface PositionLeftPanelProps {
  canvas: any;
  selectedObject: any;
  onClose: () => void;
}

const PositionLeftPanel: React.FC<PositionLeftPanelProps> = ({
  canvas,
  selectedObject,
  onClose,
}) => {
  const { attributes, syncFromFabricObject, updateAttribute } =
    usePropertiesStore();

  const { generateLayerName } = useLayerStore();

  const [isRatioLocked, setIsRatioLocked] = useState(false);
  const [originalRatio, setOriginalRatio] = useState(1);
  const [activeTab, setActiveTab] = useState<"arrange" | "layers">("arrange");

  // Sync attributes when selected object changes
  useEffect(() => {
    if (selectedObject) {
      syncFromFabricObject(selectedObject);
      // Calculate and store the original ratio
      let width, height;

      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        width = selectedObject.width || 0;
        height = selectedObject.height || 0;
      } else {
        width = (selectedObject.width || 0) * (selectedObject.scaleX || 1);
        height = (selectedObject.height || 0) * (selectedObject.scaleY || 1);
      }

      if (width && height) {
        setOriginalRatio(width / height);
      }
    }
  }, [selectedObject, syncFromFabricObject]);

  const PX_TO_CM = 37.795; // 96 DPI standard conversion

  // Helper function to get displayed width/height
  const getDisplayedWidth = () => {
    if (!selectedObject) return 0;
    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      return selectedObject.width || 0;
    }
    return (selectedObject.width || 0) * (selectedObject.scaleX || 1);
  };

  const getDisplayedHeight = () => {
    if (!selectedObject) return 0;
    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      return selectedObject.height || 0;
    }
    return (selectedObject.height || 0) * (selectedObject.scaleY || 1);
  };
  const bringForward = () => {
    if (!selectedObject || !canvas) return;
    canvas.bringForward(selectedObject);
    canvas.renderAll();
  };

  const sendBackward = () => {
    if (!selectedObject || !canvas) return;
    canvas.sendBackwards(selectedObject);
    canvas.renderAll();
  };

  const bringToFront = () => {
    if (!selectedObject || !canvas) return;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();
  };

  const sendToBack = () => {
    if (!selectedObject || !canvas) return;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();
  };

  // Align to page functions
  const alignToTop = () => {
    if (!selectedObject || !canvas) return;

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, align the text content to the top edge
      const boundingRect = selectedObject.getBoundingRect();
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", -topOffset);
    } else {
      // For shapes, align the top edge to canvas top
      selectedObject.set("top", 0);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("top", selectedObject.top);
  };

  const alignToLeft = () => {
    if (!selectedObject || !canvas) return;

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, align the text content to the left edge
      const boundingRect = selectedObject.getBoundingRect();
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", -leftOffset);
    } else {
      // For shapes, align the left edge to canvas left
      selectedObject.set("left", 0);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("left", selectedObject.left);
  };

  const alignToMiddle = () => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text height
      const boundingRect = selectedObject.getBoundingRect();
      const textHeight = boundingRect.height;
      const top = (canvasHeight - textHeight) / 2;

      // Adjust for any offset between the object's top and its bounding rect
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", top - topOffset);
    } else {
      // For shapes, use scaled height
      const objectHeight = selectedObject.getScaledHeight();
      const top = (canvasHeight - objectHeight) / 2;
      selectedObject.set("top", top);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("top", selectedObject.top);
  };

  const alignToCenter = () => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text width
      const boundingRect = selectedObject.getBoundingRect();
      const textWidth = boundingRect.width;
      const left = (canvasWidth - textWidth) / 2;

      // Adjust for any offset between the object's left and its bounding rect
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", left - leftOffset);
    } else {
      // For shapes, use scaled width
      const objectWidth = selectedObject.getScaledWidth();
      const left = (canvasWidth - objectWidth) / 2;
      selectedObject.set("left", left);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("left", selectedObject.left);
  };

  const alignToBottom = () => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text height
      const boundingRect = selectedObject.getBoundingRect();
      const textHeight = boundingRect.height;
      const top = canvasHeight - textHeight;

      // Adjust for any offset between the object's top and its bounding rect
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", top - topOffset);
    } else {
      // For shapes, use scaled height
      const objectHeight = selectedObject.getScaledHeight();
      const top = canvasHeight - objectHeight;
      selectedObject.set("top", top);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("top", selectedObject.top);
  };

  const alignToRight = () => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text width
      const boundingRect = selectedObject.getBoundingRect();
      const textWidth = boundingRect.width;
      const left = canvasWidth - textWidth;

      // Adjust for any offset between the object's left and its bounding rect
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", left - leftOffset);
    } else {
      // For shapes, use scaled width
      const objectWidth = selectedObject.getScaledWidth();
      const left = canvasWidth - objectWidth;
      selectedObject.set("left", left);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("left", selectedObject.left);
  };

  // Advanced controls
  const handleWidthChange = (value: number) => {
    if (!selectedObject || !canvas) return;

    const newWidth = Math.max(1, value);

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      selectedObject.set("width", newWidth);

      // If ratio is locked, also update height
      if (isRatioLocked && originalRatio > 0) {
        const newHeight = newWidth / originalRatio;
        selectedObject.set("height", newHeight);
        updateAttribute("height", newHeight);
      }
    } else {
      // For shapes, we need to adjust scale
      const currentWidth =
        (selectedObject.width || 0) * (selectedObject.scaleX || 1);
      if (currentWidth > 0) {
        const newScaleX = newWidth / (selectedObject.width || 1);
        selectedObject.set("scaleX", newScaleX);

        // If ratio is locked, also update height
        if (isRatioLocked && originalRatio > 0) {
          const newHeight = newWidth / originalRatio;
          const newScaleY = newHeight / (selectedObject.height || 1);
          selectedObject.set("scaleY", newScaleY);
        }
      }
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("width", newWidth);
  };

  const handleHeightChange = (value: number) => {
    if (!selectedObject || !canvas || isRatioLocked) return; // Don't allow height change when ratio is locked

    const newHeight = Math.max(1, value);

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      selectedObject.set("height", newHeight);
    } else {
      // For shapes, we need to adjust scale
      const currentHeight =
        (selectedObject.height || 0) * (selectedObject.scaleY || 1);
      if (currentHeight > 0) {
        const newScaleY = newHeight / (selectedObject.height || 1);
        selectedObject.set("scaleY", newScaleY);
      }
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("height", newHeight);
  };

  const handleXPositionChange = (value: number) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set("left", value);
    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("left", value);
  };

  const handleYPositionChange = (value: number) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set("top", value);
    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("top", value);
  };

  const handleRotationChange = (value: number) => {
    if (!selectedObject || !canvas) return;
    const normalizedAngle = ((value % 360) + 360) % 360;
    selectedObject.set("angle", normalizedAngle);
    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute("angle", normalizedAngle);
  };

  const toggleRatioLock = () => {
    if (!isRatioLocked && selectedObject) {
      // When locking, store current ratio
      const width = getDisplayedWidth();
      const height = getDisplayedHeight();
      if (width && height) {
        setOriginalRatio(width / height);
      }
    }
    setIsRatioLocked(!isRatioLocked);
  };

  // Layer icon helper function
  const getLayerIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "textbox":
      case "text":
        return <Type className="w-5 h-5 text-blue-600" />;
      case "rect":
      case "rectangle":
        return <Square className="w-5 h-5 text-green-600" />;
      case "circle":
      case "ellipse":
        return <Circle className="w-5 h-5 text-orange-600" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <Square className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Position</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Arrange Section */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("arrange")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "arrange"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Arrange
          </button>
          <button
            onClick={() => setActiveTab("layers")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "layers"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Layers
          </button>
        </div>

        {activeTab === "arrange" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={bringForward}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm font-medium">Forward</span>
            </button>
            <button
              onClick={sendBackward}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="text-sm font-medium">Backward</span>
            </button>
            <button
              onClick={bringToFront}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
              <span className="text-sm font-medium">To front</span>
            </button>
            <button
              onClick={sendToBack}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="text-sm font-medium">To back</span>
            </button>
          </div>
        )}

        {activeTab === "layers" && (
          <div className="space-y-2">
            {canvas && canvas.getObjects ? (
              canvas.getObjects().map((obj: any, index: number) => {
                const isSelected = selectedObject === obj;
                const layerIcon = getLayerIcon(obj.type);

                return (
                  <div
                    key={obj.id || index}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-purple-50 border-purple-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      canvas.setActiveObject(obj);
                      canvas.renderAll();
                    }}
                  >
                    <div className="flex-shrink-0">{layerIcon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {generateLayerName(obj, index)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        obj.set("visible", !obj.visible);
                        canvas.renderAll();
                      }}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {obj.visible !== false ? (
                        <Eye className="w-4 h-4 text-gray-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No layers found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Align to page Section */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Align to page
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={alignToTop}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignVerticalJustifyStart className="w-5 h-5" />
            <span className="text-sm font-medium">Top</span>
          </button>
          <button
            onClick={alignToLeft}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignHorizontalJustifyStart className="w-5 h-5" />
            <span className="text-sm font-medium">Left</span>
          </button>
          <button
            onClick={alignToMiddle}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignVerticalJustifyCenter className="w-5 h-5" />
            <span className="text-sm font-medium">Middle</span>
          </button>
          <button
            onClick={alignToCenter}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignHorizontalJustifyCenter className="w-5 h-5" />
            <span className="text-sm font-medium">Center</span>
          </button>
          <button
            onClick={alignToBottom}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignVerticalJustifyEnd className="w-5 h-5" />
            <span className="text-sm font-medium">Bottom</span>
          </button>
          <button
            onClick={alignToRight}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlignHorizontalJustifyEnd className="w-5 h-5" />
            <span className="text-sm font-medium">Right</span>
          </button>
        </div>
      </div>

      {/* Advanced Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced</h4>

        {/* Width, Height, and Ratio Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Width
            </label>
            <input
              type="number"
              value={(getDisplayedWidth() / PX_TO_CM).toFixed(2)} // Convert px to cm
              onChange={(e) =>
                handleWidthChange(Number(e.target.value) * PX_TO_CM)
              } // Convert cm to px
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              step="0.01"
              min="0.1"
            />
            <span className="text-xs text-gray-500 mt-1 block">cm</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Height
            </label>
            <input
              type="number"
              value={(getDisplayedHeight() / PX_TO_CM).toFixed(2)} // Convert px to cm
              onChange={(e) =>
                handleHeightChange(Number(e.target.value) * PX_TO_CM)
              } // Convert cm to px
              disabled={isRatioLocked}
              className={`w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isRatioLocked ? "bg-gray-100 text-gray-500" : "bg-white"
              }`}
              step="0.01"
              min="0.1"
            />
            <span className="text-xs text-gray-500 mt-1 block">cm</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Ratio
            </label>
            <button
              onClick={toggleRatioLock}
              className={`w-full h-[42px] border rounded-md transition-colors flex items-center justify-center ${
                isRatioLocked
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
              }`}
              title={isRatioLocked ? "Unlock ratio" : "Lock ratio"}
            >
              {isRatioLocked ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Unlock className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* X, Y and Rotate Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              X
            </label>
            <input
              type="number"
              value={(attributes.left / PX_TO_CM).toFixed(2)} // Convert px to cm
              onChange={(e) =>
                handleXPositionChange(Number(e.target.value) * PX_TO_CM)
              } // Convert cm to px
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              step="0.01"
            />
            <span className="text-xs text-gray-500 mt-1 block">cm</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Y
            </label>
            <input
              type="number"
              value={(attributes.top / PX_TO_CM).toFixed(2)} // Convert px to cm
              onChange={(e) =>
                handleYPositionChange(Number(e.target.value) * PX_TO_CM)
              } // Convert cm to px
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              step="0.01"
            />
            <span className="text-xs text-gray-500 mt-1 block">cm</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Rotate
            </label>
            <input
              type="number"
              value={Math.round(attributes.angle || 0)}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              min="0"
              max="360"
              step="1"
            />
            <span className="text-xs text-gray-500 mt-1 block">°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionLeftPanel;
