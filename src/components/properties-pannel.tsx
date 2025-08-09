/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas } from "@/app/page";
import { FabricObject } from "fabric";
import { Sparkles } from "lucide-react";
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
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    if (selectedObject) {
      setAttributes({
        fill: selectedObject.fill || "#000000",
        fontFamily: selectedObject.fontFamily || "Arial",
        fontSize: selectedObject.fontSize || 40,
        opacity: selectedObject.opacity ?? 1,
        stroke: selectedObject.stroke || "#333333",
        strokeWidth: selectedObject.strokeWidth || 4,
      });
    }
  }, [selectedObject]);

  const handlePropertyChange = (prop: string, value: any) => {
    if (!canvas || !selectedObject) return;
    setAttributes((prev) => ({ ...prev, [prop]: value }));
    if (selectedObject.type === "group") {
      selectedObject.forEachObject((obj: any) => {
        if (prop === "stroke") {
          obj.set("stroke", value);
          if (obj.type === "triangle") obj.set("fill", value);
        } else {
          obj.set(prop, value);
        }
      });
    } else {
      selectedObject.set(prop, value);
    }
    canvas.renderAll();
  };

  const handleImproveWording = async () => {
    if (!canvas || !selectedObject || selectedObject.type !== "textbox") return;
    const currentText = (selectedObject as any).text;
    const prompt = `You are a creative assistant for designing certificates. A user has a text box with the text "${currentText}". Suggest a more professional and inspiring version of this text. Respond with only the improved text, keeping it concise.`;
    setIsImproving(true);
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API call failed`);
      const result = await response.json();
      const newText = result.candidates?.[0]?.content?.parts?.[0]?.text.trim();
      if (newText) {
        selectedObject.set("text", newText);
        canvas.renderAll();
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    } finally {
      setIsImproving(false);
    }
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
      {isText && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <button
            onClick={handleImproveWording}
            disabled={isImproving}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            {isImproving ? (
              <span className="animate-pulse">Improving...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>✨ Improve Wording</span>
              </>
            )}
          </button>
        </div>
      )}
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
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 rounded-md"
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
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
