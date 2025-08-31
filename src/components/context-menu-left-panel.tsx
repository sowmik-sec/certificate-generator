/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import {
  Lock,
  Unlock,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Group,
  Ungroup,
  MoveUp,
  MoveDown,
  ArrowUp,
  ArrowDown,
  Layers,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ContextMenuLeftPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
  fabric: any; // Add fabric as a prop
  onLayerAction: (action: string) => void;
  isMobile?: boolean; // Add mobile detection
}

const ContextMenuLeftPanel: React.FC<ContextMenuLeftPanelProps> = ({
  selectedObject,
  canvas,
  fabric,
  onLayerAction,
  isMobile = false,
}) => {
  if (!selectedObject) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Object Actions</h3>
        <p className="text-sm text-gray-500">
          Select an object to see available actions
        </p>
      </div>
    );
  }

  const isLocked = selectedObject.lockMovementX || selectedObject.lockMovementY;
  const isGroup = selectedObject.type === "group";

  const handleLockToggle = () => {
    if (!canvas) return;

    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      selectable: true,
      evented: true,
    });

    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleDuplicate = () => {
    if (!canvas || !fabric) return;

    try {
      // Use toObject/fromJSON method for reliable cloning
      const objData = selectedObject.toObject();

      // Create new object from the data with offset position
      const newData = {
        ...objData,
        left: objData.left + 20,
        top: objData.top + 20,
      };

      // Use fabric.util.enlivenObjects for proper recreation
      fabric.util.enlivenObjects([newData], (objects: any[]) => {
        if (objects && objects.length > 0) {
          const newObject = objects[0];
          canvas.add(newObject);
          canvas.setActiveObject(newObject);
          canvas.renderAll();
        }
      });
    } catch (error) {
      console.error("Duplication failed:", error);
    }
  };

  const handleCopy = () => {
    // Copy functionality - store in localStorage
    const objData = selectedObject.toObject();
    localStorage.setItem("copiedFabricObject", JSON.stringify(objData));
  };

  const handleCut = () => {
    handleCopy();
    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  const handleDelete = () => {
    canvas.remove(selectedObject);
    canvas.renderAll();
  };

  const handleFlipHorizontal = () => {
    selectedObject.set("flipX", !selectedObject.flipX);
    canvas.renderAll();
  };

  const handleFlipVertical = () => {
    selectedObject.set("flipY", !selectedObject.flipY);
    canvas.renderAll();
  };

  const handleRotate = () => {
    const currentAngle = selectedObject.angle || 0;
    selectedObject.set("angle", currentAngle + 90);
    canvas.renderAll();
  };

  return (
    <div
      className={`${isMobile ? "w-full" : "w-80"} ${
        !isMobile ? "bg-white border-r border-gray-200 h-full" : ""
      } overflow-y-auto`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Object Actions</h3>
          <span className="text-sm text-gray-500">
            {selectedObject.type?.charAt(0).toUpperCase() +
              selectedObject.type?.slice(1)}
          </span>
        </div>

        <div
          className={`space-y-3 ${
            isMobile ? "max-h-[60vh] overflow-y-auto" : ""
          }`}
        >
          {/* Lock/Unlock */}
          <Button
            onClick={handleLockToggle}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            {isLocked ? "Unlock Object" : "Lock Object"}
          </Button>

          <Separator />

          {/* Edit Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Edit</h4>

            <div
              className={`${isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}`}
            >
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>

              <Button
                onClick={handleCut}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Scissors className="w-4 h-4" />
                Cut
              </Button>

              <Button
                onClick={handleDuplicate}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <Clipboard className="w-4 h-4" />
                Duplicate
              </Button>

              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          <Separator />

          {/* Transform Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Transform</h4>

            <div
              className={`${isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}`}
            >
              <Button
                onClick={handleFlipHorizontal}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <FlipHorizontal className="w-4 h-4" />
                Flip H
              </Button>

              <Button
                onClick={handleFlipVertical}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <FlipVertical className="w-4 h-4" />
                Flip V
              </Button>

              <Button
                onClick={handleRotate}
                variant="outline"
                className={`w-full justify-start gap-3 ${
                  isMobile ? "col-span-2" : ""
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Rotate 90°
              </Button>
            </div>
          </div>

          <Separator />

          {/* Layer Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Layers</h4>

            <div
              className={`${isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}`}
            >
              <Button
                onClick={() => onLayerAction("bringToFront")}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <ArrowUp className="w-4 h-4" />
                {isMobile ? "To Front" : "Bring to Front"}
              </Button>

              <Button
                onClick={() => onLayerAction("bringForward")}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <MoveUp className="w-4 h-4" />
                {isMobile ? "Forward" : "Bring Forward"}
              </Button>

              <Button
                onClick={() => onLayerAction("sendBackward")}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <MoveDown className="w-4 h-4" />
                {isMobile ? "Backward" : "Send Backward"}
              </Button>

              <Button
                onClick={() => onLayerAction("sendToBack")}
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <ArrowDown className="w-4 h-4" />
                {isMobile ? "To Back" : "Send to Back"}
              </Button>
            </div>
          </div>

          {/* Group Actions - only show if multiple objects or if object is a group */}
          {(isGroup || canvas?.getActiveObjects?.()?.length > 1) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Grouping</h4>

                {isGroup ? (
                  <Button
                    onClick={() => onLayerAction("ungroup")}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Ungroup className="w-4 h-4" />
                    Ungroup Objects
                  </Button>
                ) : (
                  <Button
                    onClick={() => onLayerAction("group")}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Group className="w-4 h-4" />
                    Group Objects
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextMenuLeftPanel;
