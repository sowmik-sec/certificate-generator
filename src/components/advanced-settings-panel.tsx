"use client";

import { useEffect, useState } from "react";
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { FabricObject } from "@/types/fabric";
import { useClickOutside } from "@/hooks/useClickOutside";

interface AdvancedSettingsPanelProps {
  onClose?: () => void;
}

const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({
  onClose,
}) => {
  const canvas = useCanvasStore((state) => state.canvas);
  const { setEditorMode } = useEditorStore();
  const { attributes, applyToFabricObject, syncFromFabricObject } =
    usePropertiesStore();
  const { charSpacing, lineHeight, textAlign } = attributes;
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);

  // Click outside handler
  const panelRef = useClickOutside<HTMLDivElement>({
    onClickOutside: () => {
      if (onClose) {
        onClose();
      }
    },
  });

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

  if (
    !activeObject ||
    (activeObject.type !== "i-text" && activeObject.type !== "textbox")
  ) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-full -left-24 mt-3 w-72 rounded-lg border bg-white p-4 shadow-lg z-70"
    >
      <div className="space-y-4">
        <div className="">
          <Label
            htmlFor="letter-spacing"
            className="text-sm font-medium text-gray-700"
          >
            Letter spacing
          </Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              id="letter-spacing"
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
        <div className="">
          <Label
            htmlFor="line-spacing"
            className="text-sm font-medium text-gray-700"
          >
            Line spacing
          </Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              id="line-spacing"
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
        <div className="">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Anchor text box
          </Label>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "left" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "left")}
                  >
                    <AlignStartVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-slate-900 !text-white !border-slate-700 shadow-lg [&>*]:!text-white"
                  style={{ backgroundColor: "rgb(15, 23, 42)", color: "white" }}
                >
                  <p style={{ color: "white" }}>Anchor start</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "center" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "center")}
                  >
                    <AlignCenterVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-slate-900 !text-white !border-slate-700 shadow-lg [&>*]:!text-white"
                  style={{ backgroundColor: "rgb(15, 23, 42)", color: "white" }}
                >
                  <p style={{ color: "white" }}>Anchor middle</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "right" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "right")}
                  >
                    <AlignEndVertical className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="!bg-slate-900 !text-white !border-slate-700 shadow-lg [&>*]:!text-white"
                  style={{ backgroundColor: "rgb(15, 23, 42)", color: "white" }}
                >
                  <p style={{ color: "white" }}>Anchor end</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4 hover:cursor-pointer font-semibold"
        variant="secondary"
        onClick={() => {
          setEditorMode("advanced-settings");
          if (onClose) {
            onClose();
          }
        }}
      >
        More Settings
      </Button>
    </div>
  );
};

export default AdvancedSettingsPanel;
