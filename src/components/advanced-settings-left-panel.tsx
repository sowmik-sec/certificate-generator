"use client";

import { useEffect, useState } from "react";
import {
  X,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ArrowDown,
  Minus,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { FabricObject } from "@/types/fabric";

const AdvancedSettingsLeftPanel = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const { attributes, applyToFabricObject, syncFromFabricObject } =
    usePropertiesStore();
  const { setEditorMode } = useEditorStore();
  const {
    charSpacing,
    lineHeight,
    textAlign,
    textPosition,
    kerning,
    ligatures,
  } = attributes;
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);

  useEffect(() => {
    if (canvas) {
      const updateActiveObject = () => {
        const obj = canvas.getActiveObject();
        setActiveObject(obj);
        if (obj) {
          syncFromFabricObject(obj);
        }
      };
      const handleSelection = (e: { selected?: FabricObject[] }) => {
        const obj = e.selected ? e.selected[0] : null;
        setActiveObject(obj);
        if (obj) {
          syncFromFabricObject(obj);
        }
      };

      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", () => setActiveObject(null));
      canvas.on("object:modified", updateActiveObject);

      updateActiveObject();

      return () => {
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.off("selection:cleared");
        canvas.off("object:modified", updateActiveObject);
      };
    }
  }, [canvas, syncFromFabricObject]);

  const handlePropertyChange = (
    property: keyof typeof attributes,
    value: string | number
  ) => {
    if (canvas && activeObject) {
      applyToFabricObject(activeObject, canvas, property, value);
    }
  };

  const handleTextPositionChange = (
    position: "superscript" | "normal" | "subscript"
  ) => {
    if (canvas && activeObject) {
      applyToFabricObject(activeObject, canvas, "textPosition", position);
    }
  };

  const handleKerningChange = (enabled: boolean) => {
    if (canvas && activeObject) {
      applyToFabricObject(activeObject, canvas, "kerning", enabled);
    }
  };

  const handleLigaturesChange = (enabled: boolean) => {
    if (canvas && activeObject) {
      applyToFabricObject(activeObject, canvas, "ligatures", enabled);
    }
  };

  const handleClose = () => {
    setEditorMode(null);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Advanced settings
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Spacing Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Spacing</h3>

          {/* Letter spacing */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Letter spacing
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                min={-200}
                max={800}
                step={1}
                value={[charSpacing]}
                onValueChange={(val) =>
                  handlePropertyChange("charSpacing", val[0])
                }
                className="flex-1"
              />
              <Input
                type="number"
                min={-200}
                max={800}
                value={charSpacing}
                onChange={(e) =>
                  handlePropertyChange("charSpacing", Number(e.target.value))
                }
                className="w-12 h-8 text-xs"
              />
            </div>
          </div>

          {/* Line spacing */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Line spacing
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                min={0.5}
                max={3}
                step={0.01}
                value={[lineHeight]}
                onValueChange={(val) =>
                  handlePropertyChange("lineHeight", val[0])
                }
                className="flex-1"
              />
              <Input
                type="number"
                min={0.5}
                max={3}
                step={0.01}
                value={lineHeight}
                onChange={(e) =>
                  handlePropertyChange("lineHeight", Number(e.target.value))
                }
                className="w-12 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Anchor text box */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Anchor text box
          </Label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={textAlign === "left" ? "secondary" : "outline"}
              size="sm"
              className="h-10 flex items-center justify-center"
              onClick={() => handlePropertyChange("textAlign", "left")}
            >
              <AlignStartVertical className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "center" ? "secondary" : "outline"}
              size="sm"
              className="h-10 flex items-center justify-center"
              onClick={() => handlePropertyChange("textAlign", "center")}
            >
              <AlignCenterVertical className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "right" ? "secondary" : "outline"}
              size="sm"
              className="h-10 flex items-center justify-center"
              onClick={() => handlePropertyChange("textAlign", "right")}
            >
              <AlignEndVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Formatting Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Formatting</h3>

          {/* Text position */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Text position
            </Label>
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant={textPosition === "superscript" ? "default" : "outline"}
                size="sm"
                className={`h-10 flex items-center justify-center text-base font-semibold ${
                  textPosition === "superscript"
                    ? "bg-purple-200 text-black border-purple-300 hover:bg-purple-300 hover:text-black"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleTextPositionChange("superscript")}
              >
                A²
              </Button>
              <Button
                variant={textPosition === "normal" ? "default" : "outline"}
                size="sm"
                className={`h-10 flex items-center justify-center text-base font-semibold ${
                  textPosition === "normal"
                    ? "bg-purple-200 text-black border-purple-300 hover:bg-purple-300 hover:text-black"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleTextPositionChange("normal")}
              >
                A°
              </Button>
              <Button
                variant={textPosition === "subscript" ? "default" : "outline"}
                size="sm"
                className={`h-10 flex items-center justify-center text-base font-semibold ${
                  textPosition === "subscript"
                    ? "bg-purple-200 text-black border-purple-300 hover:bg-purple-300 hover:text-black"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleTextPositionChange("subscript")}
              >
                A₂
              </Button>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Typography</h3>

          {/* Kerning */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Kerning
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Refine letter spacing for visual balance
              </p>
            </div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                kerning ? "bg-purple-200" : "bg-gray-100"
              } hover:bg-purple-100`}
              onClick={() => handleKerningChange(!kerning)}
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">
                  <Minus className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700 flex flex-col items-center">
                  <span>VA</span>
                  <ArrowLeft className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Ligatures */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Ligatures
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Combine specific characters elegantly
              </p>
            </div>
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                ligatures ? "bg-purple-200" : "bg-gray-100"
              } hover:bg-purple-100`}
              onClick={() => handleLigaturesChange(!ligatures)}
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">fi</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">fi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsLeftPanel;
