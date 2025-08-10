/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas } from "@/app/page";
import { FabricObject } from "fabric";
import { useEffect, useState } from "react";

interface PropertiesPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
}
const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  canvas,
}) => {
  const [attributes, setAttributes] = useState({
    fill: "#000000",
    fontFamily: "Arial",
    fontSize: 40,
    opacity: 1,
    stroke: "#333333",
    strokeWidth: 4,
  });

  useEffect(() => {
    if (selectedObject) {
      setAttributes({
        fill:
          typeof selectedObject.fill === "string"
            ? selectedObject.fill
            : "#000000",
        fontFamily:
          selectedObject.type === "textbox" && "fontFamily" in selectedObject
            ? (selectedObject as any).fontFamily || "Arial"
            : "Arial",
        fontSize:
          selectedObject.type === "textbox" && "fontSize" in selectedObject
            ? (selectedObject as any).fontSize || 40
            : 40,
        opacity: selectedObject.opacity ?? 1,
        stroke:
          typeof selectedObject.stroke === "string"
            ? selectedObject.stroke
            : "#333333",
        strokeWidth: selectedObject.strokeWidth || 4,
      });
    }
  }, [selectedObject]);

  const handlePropertyChange = (prop: string, value: any) => {
    if (!canvas || !selectedObject) return;
    setAttributes((prev) => ({ ...prev, [prop]: value }));
    if (selectedObject.type === "group") {
      // Cast selectedObject to fabric.Group to access forEachObject
      if (
        "forEachObject" in selectedObject &&
        typeof (selectedObject as any).forEachObject === "function"
      ) {
        (selectedObject as any).forEachObject((obj: any) => {
          if (prop === "stroke") {
            obj.set("stroke", value);
            if (obj.type === "triangle") obj.set("fill", value);
          } else {
            obj.set(prop, value);
          }
        });
      } else if (Array.isArray((selectedObject as any)._objects)) {
        // Fallback for group objects
        (selectedObject as any)._objects.forEach((obj: any) => {
          if (prop === "stroke") {
            obj.set("stroke", value);
            if (obj.type === "triangle") obj.set("fill", value);
          } else {
            obj.set(prop, value);
          }
        });
      }
    } else {
      selectedObject.set(prop, value);
    }
    canvas.renderAll();
  };

  if (!selectedObject) return null;
  const isText = selectedObject.type === "textbox";
  const isShape = ["rect", "circle", "triangle"].includes(
    selectedObject.type || ""
  );
  const isLine = selectedObject.type === "line";
  const isArrow = selectedObject.type === "group";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Properties</h3>
      {(isText || isShape) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fill Color
          </label>
          <input
            type="color"
            value={attributes.fill}
            onChange={(e) => handlePropertyChange("fill", e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}
      {(isLine || isArrow) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Line Color
          </label>
          <input
            type="color"
            value={attributes.stroke}
            onChange={(e) => handlePropertyChange("stroke", e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}
      {(isLine || isArrow) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Line Width
          </label>
          <input
            type="number"
            value={attributes.strokeWidth}
            onChange={(e) =>
              handlePropertyChange("strokeWidth", parseInt(e.target.value, 10))
            }
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 rounded-md text-gray-700"
          />
        </div>
      )}
      {isText && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Font
            </label>
            <select
              value={attributes.fontFamily}
              onChange={(e) =>
                handlePropertyChange("fontFamily", e.target.value)
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Georgia</option>
              <option>Courier New</option>
              <option>Verdana</option>
              <option>Lobster</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Font Size
            </label>
            <input
              type="number"
              value={attributes.fontSize}
              onChange={(e) =>
                handlePropertyChange("fontSize", parseInt(e.target.value, 10))
              }
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md  text-gray-700"
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Opacity
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
          className="mt-1 block w-full"
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;
