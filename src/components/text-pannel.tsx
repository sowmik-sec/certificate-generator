/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";

type TextAlign = "left" | "center" | "right" | "justify";
type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

interface TextOptions {
  fontFamily: string;
  fontWeight: string;
  textAlign: TextAlign;
  fill: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontStyle: string;
  underline: boolean;
  textTransform: TextTransform;
  stroke: string;
  strokeWidth: number;
  backgroundColor: string;
  shadow: boolean;
}

interface TextPanelProps {
  addHeading: (options?: object) => void;
  addSubheading: (options?: object) => void;
  addBodyText: (options?: object) => void;
  selectedObject?: object;
  canvas?: object;
}

const TextPanel: React.FC<TextPanelProps> = ({
  addHeading,
  addSubheading,
  addBodyText,
  selectedObject,
  canvas,
}) => {
  const [textOptions, setTextOptions] = useState<TextOptions>({
    fontFamily: "Arial",
    fontWeight: "normal",
    textAlign: "left",
    fill: "#000000",
    fontSize: 24,
    lineHeight: 1.2,
    letterSpacing: 0,
    fontStyle: "normal",
    underline: false,
    textTransform: "none",
    stroke: "",
    strokeWidth: 0,
    backgroundColor: "",
    shadow: false,
  });

  // Define a type for Fabric.js text objects
  interface FabricTextObject {
    type: "textbox" | "text" | "i-text";
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: TextAlign;
    fill?: string;
    fontSize?: number;
    lineHeight?: number;
    charSpacing?: number;
    fontStyle?: string;
    underline?: boolean;
    text?: string;
    stroke?: string;
    strokeWidth?: number;
    backgroundColor?: string;
    shadow?: any;
    set: (props: Record<string, unknown>) => void;
  }

  // Check if selected object is a text object
  const isSelectedTextObject =
    selectedObject &&
    ((selectedObject as FabricTextObject).type === "textbox" ||
      (selectedObject as FabricTextObject).type === "text" ||
      (selectedObject as FabricTextObject).type === "i-text");

  // Sync text options with selected object when selection changes
  React.useEffect(() => {
    if (isSelectedTextObject && selectedObject) {
      const obj = selectedObject as any;
      setTextOptions({
        fontFamily: obj.fontFamily || "Arial",
        fontWeight: obj.fontWeight || "normal",
        textAlign: obj.textAlign || "left",
        fill: obj.fill || "#000000",
        fontSize: obj.fontSize || 24,
        lineHeight: obj.lineHeight || 1.2,
        letterSpacing: (obj.charSpacing || 0) / 50, // Convert from Fabric.js scale
        fontStyle: obj.fontStyle || "normal",
        underline: obj.underline || false,
        textTransform: "none", // This is handled differently in Fabric.js
        stroke: obj.stroke || "",
        strokeWidth: obj.strokeWidth || 0,
        backgroundColor: obj.backgroundColor || "",
        shadow: obj.shadow ? true : false,
      });
    }
  }, [selectedObject, isSelectedTextObject]);

  // Update selected object when text options change
  const updateSelectedObject = (
    key: string,
    value: string | number | boolean
  ) => {
    if (!isSelectedTextObject || !selectedObject || !canvas) return;

    const obj = selectedObject as any;
    const canvasObj = canvas as any;
    const updateObj: Record<string, unknown> = {};

    if (key === "letterSpacing") {
      updateObj["charSpacing"] = (value as number) * 50; // Convert to Fabric.js scale
    } else if (key === "textTransform") {
      // For text transform, we need to modify the actual text content
      const currentText = obj.text || "";
      let transformedText = currentText;

      switch (value) {
        case "uppercase":
          transformedText = currentText.toUpperCase();
          break;
        case "lowercase":
          transformedText = currentText.toLowerCase();
          break;
        case "capitalize":
          transformedText = currentText.replace(
            /\w\S*/g,
            (txt: string) =>
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
        case "none":
        default:
          // Keep original text - we'd need to store original somewhere for this to work perfectly
          break;
      }

      updateObj["text"] = transformedText;
    } else if (key === "shadow") {
      updateObj["shadow"] = value ? "rgba(0,0,0,0.3) 2px 2px 4px" : null;
    } else {
      updateObj[key] = value;
    }

    obj.set(updateObj);
    canvasObj.renderAll();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            {isSelectedTextObject ? "Add New Text" : "Quick Add"}
          </h4>

          {isSelectedTextObject && (
            <p className="text-xs text-gray-500 mb-3">
              Click below to add new text with current settings, or modify
              properties above to edit selected text.
            </p>
          )}

          <button
            onClick={() => addHeading()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left hover:cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 truncate">
                  Add Heading
                </p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => addSubheading()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:cursor-pointer text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold text-gray-700 truncate">
                  Add Subheading
                </p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => addBodyText()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:cursor-pointer text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 truncate">Add Body Text</p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
