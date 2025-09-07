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
  X,
} from "lucide-react";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { alignmentUtils } from "@/lib/alignmentUtils";
import LayerPanel from "./layer-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    alignmentUtils.alignToTop({ canvas, selectedObject, updateAttribute });
  };

  const alignToLeft = () => {
    alignmentUtils.alignToLeft({ canvas, selectedObject, updateAttribute });
  };

  const alignToMiddle = () => {
    alignmentUtils.alignToMiddle({ canvas, selectedObject, updateAttribute });
  };

  const alignToCenter = () => {
    alignmentUtils.alignToCenter({ canvas, selectedObject, updateAttribute });
  };

  const alignToBottom = () => {
    alignmentUtils.alignToBottom({ canvas, selectedObject, updateAttribute });
  };

  const alignToRight = () => {
    alignmentUtils.alignToRight({ canvas, selectedObject, updateAttribute });
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

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 flex-shrink-0 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
          Position
        </h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs Implementation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "arrange" | "layers")}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="arrange"
              className="px-4 py-2 text-sm font-medium"
            >
              Arrange
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              className="px-4 py-2 text-sm font-medium"
            >
              Layers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Arrange Tab Content */}
        <TabsContent value="arrange" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-[600px] w-full">
            <div className="px-6 pb-6">
              {/* Arrange Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
                <Button
                  variant="outline"
                  onClick={bringForward}
                  className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                >
                  <ChevronUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Forward</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={sendBackward}
                  className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                >
                  <ChevronDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Backward</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={bringToFront}
                  className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                >
                  <ChevronUp className="w-5 h-5" />
                  <span className="text-sm font-medium">To front</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={sendToBack}
                  className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                >
                  <ChevronDown className="w-5 h-5" />
                  <span className="text-sm font-medium">To back</span>
                </Button>
              </div>

              <Separator className="mb-6" />

              {/* Align to page Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-4 text-[var(--color-foreground)]">
                  Align to page
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={alignToTop}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignVerticalJustifyStart className="w-5 h-5" />
                    <span className="text-sm font-medium">Top</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={alignToLeft}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignHorizontalJustifyStart className="w-5 h-5" />
                    <span className="text-sm font-medium">Left</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={alignToMiddle}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignVerticalJustifyCenter className="w-5 h-5" />
                    <span className="text-sm font-medium">Middle</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={alignToCenter}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignHorizontalJustifyCenter className="w-5 h-5" />
                    <span className="text-sm font-medium">Center</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={alignToBottom}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignVerticalJustifyEnd className="w-5 h-5" />
                    <span className="text-sm font-medium">Bottom</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={alignToRight}
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors border border-[var(--color-border)]"
                  >
                    <AlignHorizontalJustifyEnd className="w-5 h-5" />
                    <span className="text-sm font-medium">Right</span>
                  </Button>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Advanced Section */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-4 text-[var(--color-foreground)]">
                    Advanced
                  </h4>

                  {/* Width, Height, and Ratio Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        Width
                      </Label>
                      <Input
                        type="number"
                        value={(getDisplayedWidth() / PX_TO_CM).toFixed(2)}
                        onChange={(e) =>
                          handleWidthChange(Number(e.target.value) * PX_TO_CM)
                        }
                        className="w-full"
                        step="0.01"
                        min="0.1"
                      />
                      <span className="text-xs mt-1 block text-[var(--color-muted-foreground)]">
                        cm
                      </span>
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        Height
                      </Label>
                      <Input
                        type="number"
                        value={(getDisplayedHeight() / PX_TO_CM).toFixed(2)}
                        onChange={(e) =>
                          handleHeightChange(Number(e.target.value) * PX_TO_CM)
                        }
                        disabled={isRatioLocked}
                        className={`w-full ${
                          isRatioLocked
                            ? "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                            : "bg-[var(--color-input)]"
                        }`}
                        step="0.01"
                        min="0.1"
                      />
                      <span className="text-xs mt-1 block text-[var(--color-muted-foreground)]">
                        cm
                      </span>
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        Ratio
                      </Label>
                      <Button
                        variant="outline"
                        onClick={toggleRatioLock}
                        title={isRatioLocked ? "Unlock ratio" : "Lock ratio"}
                        className={`w-full h-[42px] rounded-md transition-colors flex items-center justify-center ${
                          isRatioLocked
                            ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-[var(--color-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-muted-foreground)] bg-[var(--color-input)]"
                        }`}
                      >
                        {isRatioLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Unlock className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* X, Y and Rotate Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        X
                      </Label>
                      <Input
                        type="number"
                        value={(attributes.left / PX_TO_CM).toFixed(2)}
                        onChange={(e) =>
                          handleXPositionChange(
                            Number(e.target.value) * PX_TO_CM
                          )
                        }
                        className="w-full"
                        step="0.01"
                      />
                      <span className="text-xs mt-1 block text-[var(--color-muted-foreground)]">
                        cm
                      </span>
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        Y
                      </Label>
                      <Input
                        type="number"
                        value={(attributes.top / PX_TO_CM).toFixed(2)}
                        onChange={(e) =>
                          handleYPositionChange(
                            Number(e.target.value) * PX_TO_CM
                          )
                        }
                        className="w-full"
                        step="0.01"
                      />
                      <span className="text-xs mt-1 block text-[var(--color-muted-foreground)]">
                        cm
                      </span>
                    </div>
                    <div>
                      <Label className="block text-xs font-medium mb-2 text-[var(--color-muted-foreground)]">
                        Rotate
                      </Label>
                      <Input
                        type="number"
                        value={Math.round(attributes.angle || 0)}
                        onChange={(e) =>
                          handleRotationChange(Number(e.target.value))
                        }
                        className="w-full"
                        min="0"
                        max="360"
                        step="1"
                      />
                      <span className="text-xs mt-1 block text-[var(--color-muted-foreground)]">
                        °
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layers Tab Content */}
        <TabsContent value="layers" className="flex-1 m-0">
          <div className="h-[600px] w-full">
            <LayerPanel canvas={canvas} onSelectionChange={() => {}} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PositionLeftPanel;
