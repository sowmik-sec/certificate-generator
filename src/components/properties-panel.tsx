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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="h-[600px] w-full">
      <div className="space-y-6 p-4">
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </Label>
                <Textarea
                  value={attributes.text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full p-2 text-sm"
                  rows={2}
                  placeholder="Enter text..."
                />
              </div>
            )}

            {/* Font Family */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Font
              </Label>
              <Select
                value={attributes.fontFamily}
                onValueChange={(value) =>
                  handlePropertyChange("fontFamily", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">
                    Times New Roman
                  </SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Size: {attributes.fontSize}px
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[attributes.fontSize]}
                  onValueChange={(value) =>
                    handlePropertyChange("fontSize", value[0])
                  }
                  min={8}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={attributes.fontSize}
                  onChange={(e) =>
                    handlePropertyChange(
                      "fontSize",
                      parseInt(e.target.value) || 12
                    )
                  }
                  className="w-16 p-1 text-sm"
                  min={8}
                  max={200}
                />
              </div>
            </div>

            {/* Font Style Controls */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </Label>
              <div className="flex gap-1">
                <Button
                  onClick={() =>
                    handlePropertyChange(
                      "fontWeight",
                      attributes.fontWeight === "bold" ? "normal" : "bold"
                    )
                  }
                  variant={
                    attributes.fontWeight === "bold" ? "default" : "outline"
                  }
                  size="icon"
                  className={`p-2 ${
                    attributes.fontWeight === "bold"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Bold"
                >
                  <Bold size={16} />
                </Button>
                <Button
                  onClick={() =>
                    handlePropertyChange(
                      "fontStyle",
                      attributes.fontStyle === "italic" ? "normal" : "italic"
                    )
                  }
                  variant={
                    attributes.fontStyle === "italic" ? "default" : "outline"
                  }
                  size="icon"
                  className={`p-2 ${
                    attributes.fontStyle === "italic"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Italic"
                >
                  <Italic size={16} />
                </Button>
                <Button
                  onClick={() =>
                    handlePropertyChange("underline", !attributes.underline)
                  }
                  variant={attributes.underline ? "default" : "outline"}
                  size="icon"
                  className={`p-2 ${
                    attributes.underline
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  title="Underline"
                >
                  <Underline size={16} />
                </Button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Alignment
              </Label>
              <div className="flex gap-1">
                {["left", "center", "right"].map((align) => {
                  const IconComponent =
                    align === "left"
                      ? AlignLeft
                      : align === "center"
                      ? AlignCenter
                      : AlignRight;
                  return (
                    <Button
                      key={align}
                      onClick={() => handlePropertyChange("textAlign", align)}
                      variant={
                        attributes.textAlign === align ? "default" : "outline"
                      }
                      size="icon"
                      className={`p-2 ${
                        attributes.textAlign === align
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      title={`Align ${align}`}
                    >
                      <IconComponent size={16} />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getValidColorForInput(attributes.fill)}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="w-12 h-8 rounded border border-input bg-background cursor-pointer"
                />
                <Input
                  type="text"
                  value={attributes.fill}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="flex-1 p-1 text-sm"
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
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Fill Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getValidColorForInput(attributes.fill)}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="w-12 h-8 rounded border border-input bg-background cursor-pointer"
                />
                <Input
                  type="text"
                  value={attributes.fill}
                  onChange={(e) => handlePropertyChange("fill", e.target.value)}
                  className="flex-1 p-1 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Border Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getValidColorForInput(attributes.stroke, "#333333")}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  className="w-12 h-8 rounded border border-input bg-background cursor-pointer"
                />
                <Input
                  type="text"
                  value={attributes.stroke}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  className="flex-1 p-1 text-sm"
                  placeholder="#333333"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Border Width: {attributes.strokeWidth}px
              </Label>
              <Slider
                value={[attributes.strokeWidth]}
                onValueChange={(value) =>
                  handlePropertyChange("strokeWidth", value[0])
                }
                min={0}
                max={20}
                step={1}
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
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getValidColorForInput(attributes.stroke, "#333333")}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  className="w-12 h-8 rounded border border-input bg-background cursor-pointer"
                />
                <Input
                  type="text"
                  value={attributes.stroke}
                  onChange={(e) =>
                    handlePropertyChange("stroke", e.target.value)
                  }
                  className="flex-1 p-1 text-sm"
                  placeholder="#333333"
                />
              </div>
            </div>

            {/* Line Width */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Width: {attributes.strokeWidth}px
              </Label>
              <Slider
                value={[attributes.strokeWidth]}
                onValueChange={(value) =>
                  handlePropertyChange("strokeWidth", value[0])
                }
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* TRANSFORM CONTROLS */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 border-b pb-1">
            Transform
          </h4>

          {/* Opacity */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Opacity: {Math.round(attributes.opacity * 100)}%
            </Label>
            <Slider
              value={[attributes.opacity]}
              onValueChange={(value) =>
                handlePropertyChange("opacity", value[0])
              }
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation: {Math.round(attributes.angle)}°
            </Label>
            <Slider
              value={[attributes.angle]}
              onValueChange={(value) => handlePropertyChange("angle", value[0])}
              min={-180}
              max={180}
              step={1}
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
                <Label className="block text-xs font-medium text-gray-600 mb-1">
                  X
                </Label>
                <Input
                  type="number"
                  value={Math.round((selectedObject as any).left || 0)}
                  onChange={(e) =>
                    handlePropertyChange("left", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-1 text-sm"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-600 mb-1">
                  Y
                </Label>
                <Input
                  type="number"
                  value={Math.round((selectedObject as any).top || 0)}
                  onChange={(e) =>
                    handlePropertyChange("top", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-1 text-sm"
                />
              </div>
            </div>

            {(isShape || isText) && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="block text-xs font-medium text-gray-600 mb-1">
                    Width
                  </Label>
                  <Input
                    type="number"
                    value={Math.round(attributes.width)}
                    onChange={(e) =>
                      handlePropertyChange(
                        "width",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full p-1 text-sm"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-gray-600 mb-1">
                    Height
                  </Label>
                  <Input
                    type="number"
                    value={Math.round(attributes.height)}
                    onChange={(e) =>
                      handlePropertyChange(
                        "height",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full p-1 text-sm"
                    min={1}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default PropertiesPanel;
