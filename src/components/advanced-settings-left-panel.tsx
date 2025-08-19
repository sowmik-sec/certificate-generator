"use client";

import { useEffect, useState } from "react";
import {
  X,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
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
  const { charSpacing, lineHeight, textAlign } = attributes;
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);

  // Advanced settings state
  const [textPosition, setTextPosition] = useState<
    "superscript" | "normal" | "subscript"
  >("normal");
  const [ligatures, setLigatures] = useState(false);

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
    setTextPosition(position);
    // In a real implementation, you'd apply this to the fabric object
    // For now, we'll just update the state
  };

  const handleClose = () => {
    setEditorMode(null);
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Spacing Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Spacing</h3>

          {/* Letter spacing */}
          <div className="space-y-3">
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
                className="w-16 h-8"
              />
            </div>
          </div>

          {/* Line spacing */}
          <div className="space-y-3">
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
                className="w-16 h-8"
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
              className="h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => handlePropertyChange("textAlign", "left")}
            >
              <AlignStartVertical className="h-5 w-5" />
            </Button>
            <Button
              variant={textAlign === "center" ? "secondary" : "outline"}
              size="sm"
              className="h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => handlePropertyChange("textAlign", "center")}
            >
              <AlignCenterVertical className="h-5 w-5" />
            </Button>
            <Button
              variant={textAlign === "right" ? "secondary" : "outline"}
              size="sm"
              className="h-12 flex flex-col items-center justify-center gap-1"
              onClick={() => handlePropertyChange("textAlign", "right")}
            >
              <AlignEndVertical className="h-5 w-5" />
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
                variant={
                  textPosition === "superscript" ? "secondary" : "outline"
                }
                size="sm"
                className="h-12 flex items-center justify-center"
                onClick={() => handleTextPositionChange("superscript")}
              >
                <span className="text-sm font-medium">A</span>
                <span className="text-xs font-medium align-super">2</span>
              </Button>
              <Button
                variant={textPosition === "normal" ? "secondary" : "outline"}
                size="sm"
                className="h-12 flex items-center justify-center"
                onClick={() => handleTextPositionChange("normal")}
              >
                <span className="text-sm font-medium relative">
                  A<span className="absolute -top-1 -right-1 text-xs">°</span>
                </span>
              </Button>
              <Button
                variant={textPosition === "subscript" ? "secondary" : "outline"}
                size="sm"
                className="h-12 flex items-center justify-center"
                onClick={() => handleTextPositionChange("subscript")}
              >
                <span className="text-sm font-medium">A</span>
                <span className="text-xs font-medium align-sub">2</span>
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-8 bg-purple-100 border-purple-200"
                >
                  <span className="text-sm">-</span>
                </Button>
                <div className="text-right">
                  <span className="text-sm font-medium">VA</span>
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
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Button
                  variant={ligatures ? "secondary" : "outline"}
                  size="sm"
                  className="h-10 px-8 bg-purple-100 border-purple-200"
                  onClick={() => setLigatures(!ligatures)}
                >
                  <span className="text-sm italic">fi</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-8"
                  onClick={() => setLigatures(!ligatures)}
                >
                  <span className="text-sm">fi</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsLeftPanel;
