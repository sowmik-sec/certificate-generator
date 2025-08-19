"use client";

import { useEffect, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

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
import { FabricObject } from "@/types/fabric";

const AdvancedSettingsPanel = () => {
  const canvas = useCanvasStore((state) => state.canvas);
  const { attributes, applyToFabricObject, syncFromFabricObject } =
    usePropertiesStore();
  const { charSpacing, lineHeight, textAlign } = attributes;
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

  if (
    !activeObject ||
    (activeObject.type !== "i-text" && activeObject.type !== "textbox")
  ) {
    return null;
  }

  return (
    <div className="absolute top-full -left-24 mt-3 w-72 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="space-y-4">
        <div className="">
          <Label htmlFor="letter-spacing" className="col-span-1">
            Letter spacing
          </Label>
          <div className="flex">
            <Slider
              id="letter-spacing"
              min={-200}
              max={800}
              step={1}
              value={[charSpacing]}
              onValueChange={(val) =>
                handlePropertyChange("charSpacing", val[0])
              }
              className=""
            />
            <Input
              type="number"
              min={-200}
              max={800}
              value={charSpacing}
              onChange={(e) =>
                handlePropertyChange("charSpacing", Number(e.target.value))
              }
              className="ml-3 max-w-20 h-8"
            />
          </div>
        </div>
        <div className="">
          <Label htmlFor="line-spacing" className="col-span-1">
            Line spacing
          </Label>
          <div className="flex">
            <Slider
              id="line-spacing"
              min={0.5}
              max={3}
              step={0.01}
              value={[lineHeight]}
              onValueChange={(val) =>
                handlePropertyChange("lineHeight", val[0])
              }
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
              className="ml-3 max-w-20 h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label className="col-span-1">Anchor text box</Label>
          <div className="col-span-2 flex items-center justify-start gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "left" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handlePropertyChange("textAlign", "left")}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Left</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "center" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handlePropertyChange("textAlign", "center")}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Center</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={textAlign === "right" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => handlePropertyChange("textAlign", "right")}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Right</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <Button className="w-full mt-2 hover:cursor-pointer" variant="secondary">
        More Settings
      </Button>
    </div>
  );
};

export default AdvancedSettingsPanel;
