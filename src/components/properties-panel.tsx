/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import { useEffect } from "react";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Square,
  Minus,
} from "lucide-react";

interface PropertiesPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  canvas,
}) => {
  // Use zustand store for properties state
  const {
    attributes,
    syncFromFabricObject,
    applyToFabricObject,
    getObjectTypeName,
    isTextObject,
    isShapeObject,
    isLineObject,
    isGroupObject,
    isImageObject,
  } = usePropertiesStore();

  // Sync attributes when selected object changes
  useEffect(() => {
    syncFromFabricObject(selectedObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObject]); // Removed syncFromFabricObject from deps to prevent infinite loop

  const handlePropertyChange = (prop: keyof typeof attributes, value: any) => {
    applyToFabricObject(selectedObject, canvas, prop, value);
  };

  const handleTextChange = (newText: string) => {
    if (!canvas || !selectedObject || selectedObject.type !== "textbox") return;
    (selectedObject as any).set("text", newText);
    handlePropertyChange("text", newText);
  };

  // Helper function to ensure color inputs receive valid hex values
  const getValidColorForInput = (
    color: string,
    fallback: string = "#000000"
  ): string => {
    if (!color || color === "transparent" || color === "") return fallback;
    if (color.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(color)) return color;
    return fallback;
  };

  if (!selectedObject) return null;

  // Determine object types
  const isText =
    selectedObject.type === "textbox" || selectedObject.type === "text";
  const isShape = ["rect", "circle", "triangle", "ellipse", "path"].includes(
    selectedObject.type || ""
  );
  const isLine = selectedObject.type === "line";
  const isGroup = selectedObject.type === "group";
  const isImage = selectedObject.type === "image";

  // Check if group contains text objects for text controls
  const hasTextInGroup =
    isGroup &&
    (selectedObject as any)._objects?.some(
      (obj: any) => obj.type === "textbox"
    );

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* Object Type Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {isText && <Type size={20} />}
          {isShape && <Square size={20} />}
          {isLine && <Minus size={20} />}
          {isImage && <Palette size={20} />}
          {isGroup && <Square size={20} />}
          {getObjectTypeName()}
        </h3>
      </div>

      {/* TEXT CONTROLS */}
      {(isText || hasTextInGroup) && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 border-b pb-1">Text</h4>

          {/* Text Content - Only for single text objects */}
          {isText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={attributes.text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter text..."
              />
            </div>
          )}

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font
            </label>
            <select
              value={attributes.fontFamily}
              onChange={(e) =>
                handlePropertyChange("fontFamily", e.target.value)
              }
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size: {attributes.fontSize}px
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="200"
                value={attributes.fontSize}
                onChange={(e) =>
                  handlePropertyChange("fontSize", parseInt(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                value={attributes.fontSize}
                onChange={(e) =>
                  handlePropertyChange(
                    "fontSize",
                    parseInt(e.target.value) || 12
                  )
                }
                className="w-16 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="8"
                max="200"
              />
            </div>
          </div>

          {/* Font Style Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  handlePropertyChange(
                    "fontWeight",
                    attributes.fontWeight === "bold" ? "normal" : "bold"
                  )
                }
                className={`p-2 rounded border ${
                  attributes.fontWeight === "bold"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() =>
                  handlePropertyChange(
                    "fontStyle",
                    attributes.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className={`p-2 rounded border ${
                  attributes.fontStyle === "italic"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() =>
                  handlePropertyChange("underline", !attributes.underline)
                }
                className={`p-2 rounded border ${
                  attributes.underline
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                title="Underline"
              >
                <Underline size={16} />
              </button>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <div className="flex gap-1">
              {["left", "center", "right"].map((align) => {
                const IconComponent =
                  align === "left"
                    ? AlignLeft
                    : align === "center"
                    ? AlignCenter
                    : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => handlePropertyChange("textAlign", align)}
                    className={`p-2 rounded border ${
                      attributes.textAlign === align
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    title={`Align ${align}`}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidColorForInput(attributes.fill)}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={attributes.fill}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}

      {/* SHAPE CONTROLS */}
      {isShape && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 border-b pb-1">
            Appearance
          </h4>

          {/* Fill Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidColorForInput(attributes.fill)}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={attributes.fill}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidColorForInput(attributes.stroke, "#333333")}
                onChange={(e) => handlePropertyChange("stroke", e.target.value)}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={attributes.stroke}
                onChange={(e) => handlePropertyChange("stroke", e.target.value)}
                className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#333333"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Width: {attributes.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={attributes.strokeWidth}
              onChange={(e) =>
                handlePropertyChange("strokeWidth", parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* LINE CONTROLS */}
      {(isLine || (isGroup && !hasTextInGroup)) && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 border-b pb-1">Line</h4>

          {/* Line Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={getValidColorForInput(attributes.stroke, "#333333")}
                onChange={(e) => handlePropertyChange("stroke", e.target.value)}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={attributes.stroke}
                onChange={(e) => handlePropertyChange("stroke", e.target.value)}
                className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#333333"
              />
            </div>
          </div>

          {/* Line Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width: {attributes.strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={attributes.strokeWidth}
              onChange={(e) =>
                handlePropertyChange("strokeWidth", parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* TRANSFORM CONTROLS */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 border-b pb-1">Transform</h4>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opacity: {Math.round(attributes.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={attributes.opacity}
            onChange={(e) =>
              handlePropertyChange("opacity", parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rotation: {Math.round(attributes.angle)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={attributes.angle}
            onChange={(e) =>
              handlePropertyChange("angle", parseInt(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* POSITION & SIZE */}
      {!isGroup && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 border-b pb-1">
            Position & Size
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                X
              </label>
              <input
                type="number"
                value={Math.round((selectedObject as any).left || 0)}
                onChange={(e) =>
                  handlePropertyChange("left", parseInt(e.target.value) || 0)
                }
                className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Y
              </label>
              <input
                type="number"
                value={Math.round((selectedObject as any).top || 0)}
                onChange={(e) =>
                  handlePropertyChange("top", parseInt(e.target.value) || 0)
                }
                className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {(isShape || isText) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={Math.round(attributes.width)}
                  onChange={(e) =>
                    handlePropertyChange("width", parseInt(e.target.value) || 1)
                  }
                  className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={Math.round(attributes.height)}
                  onChange={(e) =>
                    handlePropertyChange(
                      "height",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
