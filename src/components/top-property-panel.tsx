/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Settings,
  Droplets,
  Sparkles,
  Play,
  Move,
  Copy,
  ChevronDown,
  Minus,
  Plus,
  Type,
  MoveHorizontal,
} from "lucide-react";

interface TopPropertyPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
}

const TopPropertyPanel: React.FC<TopPropertyPanelProps> = ({
  selectedObject,
  canvas,
}) => {
  const {
    attributes,
    syncFromFabricObject,
    applyToFabricObject,
    isTextObject,
    isShapeObject,
    isLineObject,
  } = usePropertiesStore();

  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState("left");
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showOpacityCard, setShowOpacityCard] = useState(false);
  const [hasStrikethrough, setHasStrikethrough] = useState(false);

  // Font options
  const fontOptions = [
    "Poppins",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
  ];

  // Sync attributes when selected object changes
  useEffect(() => {
    syncFromFabricObject(selectedObject);

    // Set text case state
    if (isTextObject() && attributes.text) {
      setIsUpperCase(attributes.text === attributes.text.toUpperCase());
    }

    // Set alignment state
    setCurrentAlignment(attributes.textAlign || "left");

    // Set strikethrough state
    setHasStrikethrough(attributes.linethrough || false);
  }, [
    selectedObject,
    syncFromFabricObject,
    isTextObject,
    attributes.text,
    attributes.textAlign,
    attributes.linethrough,
  ]);

  const handlePropertyChange = (prop: keyof typeof attributes, value: any) => {
    applyToFabricObject(selectedObject, canvas, prop, value);
  };

  const handleFontSizeChange = (increment: boolean) => {
    const currentSize = attributes.fontSize || 14;
    const newSize = increment ? currentSize + 2 : Math.max(8, currentSize - 2);
    handlePropertyChange("fontSize", newSize);
  };

  const handleTextCaseToggle = () => {
    if (isTextObject() && attributes.text) {
      const newText = isUpperCase
        ? attributes.text.toLowerCase()
        : attributes.text.toUpperCase();
      handlePropertyChange("text", newText);
      setIsUpperCase(!isUpperCase);
    }
  };

  const handleAlignmentClick = () => {
    const alignments = ["left", "center", "right", "justify"];
    const currentIndex = alignments.indexOf(currentAlignment);
    const nextAlignment = alignments[(currentIndex + 1) % alignments.length];
    setCurrentAlignment(nextAlignment);
    handlePropertyChange("textAlign", nextAlignment);
  };

  const getAlignmentIcon = () => {
    switch (currentAlignment) {
      case "center":
        return <AlignCenter className="w-4 h-4" />;
      case "right":
        return <AlignRight className="w-4 h-4" />;
      case "justify":
        return <AlignJustify className="w-4 h-4" />;
      default:
        return <AlignLeft className="w-4 h-4" />;
    }
  };

  const handleCopyStyle = () => {
    // TODO: Implement copy style functionality
    console.log("Copy style clicked");
  };

  const renderTextControls = () => (
    <>
      {/* Font Family Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors max-w-[100px]"
          title="Font Family"
        >
          <span className="font-medium truncate">
            {attributes.fontFamily || "Poppins"}
          </span>
          {/* <ChevronDown className="w-3 h-3 flex-shrink-0" /> */}
        </button>
        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[160px] max-h-64 overflow-y-auto">
            {fontOptions.map((font) => (
              <button
                key={font}
                onClick={() => {
                  handlePropertyChange("fontFamily", font);
                  setShowFontDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  attributes.fontFamily === font
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFontSizeChange(false)}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Decrease Font Size"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-2 py-1 text-sm font-medium min-w-[32px] text-center">
          {Math.round(attributes.fontSize || 14)}
        </span>
        <button
          onClick={() => handleFontSizeChange(true)}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Increase Font Size"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Font Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Text Color"
        >
          <div className="relative flex flex-col items-center">
            {/* Text "A" icon above color */}
            {/* <Type className="w-3 h-3 text-gray-600 mb-0.5" /> */}
            <span className="font-semibold">A</span>
            <div
              className="w-6 h-1 rounded border-2 border-gray-200 group-hover:border-gray-300 transition-colors shadow-sm"
              style={{ backgroundColor: attributes.fill || "#000000" }}
            />
          </div>
          <input
            type="color"
            value={attributes.fill || "#000000"}
            onChange={(e) => handlePropertyChange("fill", e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => {
            const newWeight =
              attributes.fontWeight === "bold" ? "normal" : "bold";
            handlePropertyChange("fontWeight", newWeight);
          }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            attributes.fontWeight === "bold"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const newStyle =
              attributes.fontStyle === "italic" ? "normal" : "italic";
            handlePropertyChange("fontStyle", newStyle);
          }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            attributes.fontStyle === "italic"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            handlePropertyChange("underline", !attributes.underline)
          }
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            attributes.underline
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            handlePropertyChange("linethrough", !attributes.linethrough);
            setHasStrikethrough(!hasStrikethrough);
          }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            attributes.linethrough
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Text Case Toggle */}
      <button
        onClick={handleTextCaseToggle}
        className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
          isUpperCase
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        title="Toggle Text Case"
      >
        aA
      </button>

      {/* Text Alignment */}
      <button
        onClick={handleAlignmentClick}
        className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
        title="Text Alignment"
      >
        {getAlignmentIcon()}
      </button>

      {/* List Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowListDropdown(!showListDropdown)}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
          title="List"
        >
          <List className="w-4 h-4" />
        </button>
        {showListDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
            <button
              onClick={() => {
                // TODO: Implement bullet list
                console.log("Bullet list clicked");
                setShowListDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Bullet List
            </button>
            <button
              onClick={() => {
                // TODO: Implement numbered list
                console.log("Numbered list clicked");
                setShowListDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 last:rounded-b-lg flex items-center gap-2"
            >
              <ListOrdered className="w-4 h-4" />
              Numbered List
            </button>
          </div>
        )}
      </div>
    </>
  );

  const renderShapeControls = () => (
    <>
      {/* Shape Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Shape Color"
        >
          <div className="relative">
            <div
              className="w-7 h-7 rounded border-2 border-gray-200 group-hover:border-gray-300 transition-colors shadow-sm"
              style={{ backgroundColor: attributes.fill || "#000000" }}
            />
            <div className="absolute inset-0 rounded border border-white pointer-events-none" />
          </div>
          <input
            type="color"
            value={attributes.fill || "#000000"}
            onChange={(e) => handlePropertyChange("fill", e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Stroke Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Border Color"
        >
          <div className="relative">
            <div
              className="w-7 h-7 rounded border-2 group-hover:border-gray-300 transition-colors shadow-sm"
              style={{
                borderColor: attributes.stroke || "#333333",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <input
            type="color"
            value={attributes.stroke || "#333333"}
            onChange={(e) => handlePropertyChange("stroke", e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            const newWidth = Math.max(0, (attributes.strokeWidth || 1) - 1);
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Decrease Border Width"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-2 py-1 text-sm font-medium min-w-[24px] text-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <button
          onClick={() => {
            const newWidth = (attributes.strokeWidth || 1) + 1;
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Increase Border Width"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </>
  );

  const renderLineControls = () => (
    <>
      {/* Line Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Line Color"
        >
          <div className="relative">
            <div
              className="w-7 h-7 rounded border-2 border-gray-200 group-hover:border-gray-300 transition-colors shadow-sm"
              style={{ backgroundColor: attributes.stroke || "#000000" }}
            />
            <div className="absolute inset-0 rounded border border-white pointer-events-none" />
          </div>
          <input
            type="color"
            value={attributes.stroke || "#000000"}
            onChange={(e) => handlePropertyChange("stroke", e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Line Width */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            const newWidth = Math.max(1, (attributes.strokeWidth || 1) - 1);
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Decrease Line Width"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-2 py-1 text-sm font-medium min-w-[24px] text-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <button
          onClick={() => {
            const newWidth = (attributes.strokeWidth || 1) + 1;
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          title="Increase Line Width"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </>
  );

  const renderCommonControls = () => (
    <>
      {/* Advanced Settings */}
      <button
        onClick={() => {
          // TODO: Open advanced settings panel
          console.log("Advanced settings clicked");
        }}
        className="w-7 h-7 flex flex-col items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
        title="Advanced Settings"
      >
        {/* <Settings className="w-4 h-4" /> */}

        <Type className="w-4 h-4" />
        <MoveHorizontal />
      </button>

      {/* Transparency */}
      <div className="relative">
        <button
          onClick={() => setShowOpacityCard(!showOpacityCard)}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
          title="Transparency"
        >
          <Droplets className="w-4 h-4" />
        </button>

        {showOpacityCard && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 min-w-[140px]">
            <div className="text-xs text-gray-600 font-medium mb-2">
              Transparency
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={attributes.opacity || 1}
                onChange={(e) =>
                  handlePropertyChange("opacity", parseFloat(e.target.value))
                }
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xs text-gray-600 font-medium min-w-[30px] text-center">
                {Math.round((attributes.opacity || 1) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Effects */}
      <button
        onClick={() => {
          // TODO: Open effects panel
          console.log("Effects clicked");
        }}
        className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
        title="Effects"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Animate (ignore for now) */}
      <button
        className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
        title="Animate (Coming Soon)"
        disabled
      >
        <Play className="w-4 h-4" />
      </button>

      {/* Position */}
      <button
        onClick={() => {
          // TODO: Open position panel
          console.log("Position clicked");
        }}
        className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
        title="Position"
      >
        <Move className="w-4 h-4" />
      </button>

      {/* Copy Style */}
      <button
        onClick={handleCopyStyle}
        className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-gray-100 text-gray-700"
        title="Copy Style"
      >
        <Copy className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-xl backdrop-blur-sm">
        {/* Render controls based on object type */}
        {isTextObject() && renderTextControls()}
        {isShapeObject() && renderShapeControls()}
        {isLineObject() && renderLineControls()}

        {/* Separator before common controls */}
        {(isTextObject() || isShapeObject() || isLineObject()) && (
          <div className="w-px h-6 bg-gray-200 mx-1" />
        )}

        {/* Common controls */}
        {renderCommonControls()}
      </div>

      {/* Click outside handler for dropdowns */}
      {(showFontDropdown || showListDropdown || showOpacityCard) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFontDropdown(false);
            setShowListDropdown(false);
            setShowOpacityCard(false);
          }}
        />
      )}
    </div>
  );
};

export default TopPropertyPanel;
