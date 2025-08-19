/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import AdvancedSettingsPanel from "./advanced-settings-panel";
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
  Droplets,
  Minus,
  Plus,
  Type,
  MoveHorizontal,
  PaintRoller,
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
  const [showOpacityCard, setShowOpacityCard] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [hasStrikethrough, setHasStrikethrough] = useState(false);
  const [currentListType, setCurrentListType] = useState<
    "none" | "bullet" | "number"
  >("none");

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

    // Set list type state
    setCurrentListType(attributes.listType || "none");
  }, [
    selectedObject,
    syncFromFabricObject,
    isTextObject,
    attributes.text,
    attributes.textAlign,
    attributes.linethrough,
    attributes.listType,
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

  const handleListTypeToggle = () => {
    const listTypes: ("none" | "bullet" | "number")[] = [
      "none",
      "bullet",
      "number",
    ];
    const currentIndex = listTypes.indexOf(currentListType);
    const nextListType = listTypes[(currentIndex + 1) % listTypes.length];

    // Transform the text based on list type
    const currentText = attributes.text || "";
    let transformedText = currentText;

    // First, remove any existing list formatting
    const cleanText = currentText
      .split("\n")
      .map((line) => line.replace(/^(\s*)(•\s|[\d]+\.\s)/, "$1"))
      .join("\n");

    // Apply new list formatting
    switch (nextListType) {
      case "bullet":
        transformedText = cleanText
          .split("\n")
          .map((line) => (line.trim() ? `• ${line.replace(/^\s*/, "")}` : line))
          .join("\n");
        break;
      case "number":
        transformedText = cleanText
          .split("\n")
          .map((line, index) =>
            line.trim() ? `${index + 1}. ${line.replace(/^\s*/, "")}` : line
          )
          .join("\n");
        break;
      case "none":
        transformedText = cleanText;
        break;
    }

    // Update both the list type and the text content
    setCurrentListType(nextListType);
    handlePropertyChange("listType", nextListType);

    if (transformedText !== currentText) {
      handlePropertyChange("text", transformedText);
    }
  };

  const getAlignmentIcon = () => {
    switch (currentAlignment) {
      case "center":
        return <AlignCenter className="w-5 h-5" />;
      case "right":
        return <AlignRight className="w-5 h-5" />;
      case "justify":
        return <AlignJustify className="w-5 h-5" />;
      default:
        return <AlignLeft className="w-5 h-5" />;
    }
  };

  const getListIcon = () => {
    switch (currentListType) {
      case "bullet":
        return <List className="w-5 h-5" />;
      case "number":
        return <ListOrdered className="w-5 h-5" />;
      default:
        return <List className="w-5 h-5 opacity-50" />; // Faded icon for no list
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
          className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer rounded-md transition-colors max-w-[100px]"
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
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:cursor-pointer first:rounded-t-lg last:rounded-b-lg transition-colors ${
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
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Decrease Font Size"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
        <span className="px-3 py-2 text-base font-semibold min-w-[40px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.fontSize || 14)}
        </span>
        <button
          onClick={() => handleFontSizeChange(true)}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Increase Font Size"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
      </div>

      {/* Font Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Text Color"
        >
          <div className="w-10 h-10 flex flex-col items-center justify-center relative">
            {/* Text "A" icon above color */}
            <span className="font-bold text-base text-gray-800">A</span>
            <div
              className="w-6 h-1 rounded-sm transition-colors shadow-sm"
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
          className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
            attributes.fontWeight === "bold"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "hover:bg-gray-100 text-gray-800 border border-transparent"
          }`}
          title="Bold"
        >
          <Bold className="w-5 h-5 font-bold" />
        </button>

        <button
          onClick={() => {
            const newStyle =
              attributes.fontStyle === "italic" ? "normal" : "italic";
            handlePropertyChange("fontStyle", newStyle);
          }}
          className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
            attributes.fontStyle === "italic"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "hover:bg-gray-100 text-gray-800 border border-transparent"
          }`}
          title="Italic"
        >
          <Italic className="w-5 h-5 font-bold" />
        </button>

        <button
          onClick={() =>
            handlePropertyChange("underline", !attributes.underline)
          }
          className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
            attributes.underline
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "hover:bg-gray-100 text-gray-800 border border-transparent"
          }`}
          title="Underline"
        >
          <Underline className="w-5 h-5 font-bold" />
        </button>

        <button
          onClick={() => {
            handlePropertyChange("linethrough", !attributes.linethrough);
            setHasStrikethrough(!hasStrikethrough);
          }}
          className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
            attributes.linethrough
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "hover:bg-gray-100 text-gray-800 border border-transparent"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-5 h-5 font-bold" />
        </button>
      </div>

      {/* Text Case Toggle */}
      <button
        onClick={handleTextCaseToggle}
        className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer text-sm font-bold rounded-md transition-colors ${
          isUpperCase
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "hover:bg-gray-100 text-gray-800 border border-transparent"
        }`}
        title="Toggle Text Case"
      >
        aA
      </button>

      {/* Text Alignment */}
      <button
        onClick={handleAlignmentClick}
        className="w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
        title="Text Alignment"
      >
        {getAlignmentIcon()}
      </button>

      {/* List Toggle */}
      <button
        onClick={handleListTypeToggle}
        className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
          currentListType !== "none"
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "hover:bg-gray-100 text-gray-800 border border-transparent"
        }`}
        title={`List Style: ${
          currentListType === "none"
            ? "None"
            : currentListType === "bullet"
            ? "Bullet"
            : "Numbered"
        }`}
      >
        {getListIcon()}
      </button>
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
          <div className="w-10 h-10 flex items-center justify-center">
            <div
              className="w-7 h-7 rounded border-2 border-gray-300 group-hover:border-gray-400 transition-colors shadow-md"
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

      {/* Stroke Color */}
      <div className="flex items-center">
        <label
          className="flex items-center cursor-pointer group"
          title="Border Color"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <div
              className="w-7 h-7 rounded border-3 group-hover:border-gray-400 transition-colors shadow-md"
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
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Decrease Border Width"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
        <span className="px-3 py-2 text-base font-semibold min-w-[32px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <button
          onClick={() => {
            const newWidth = (attributes.strokeWidth || 1) + 1;
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Increase Border Width"
        >
          <Plus className="w-4 h-4 font-bold" />
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
          <div className="w-10 h-10 flex items-center justify-center">
            <div
              className="w-7 h-7 rounded border-2 border-gray-300 group-hover:border-gray-400 transition-colors shadow-md"
              style={{ backgroundColor: attributes.stroke || "#000000" }}
            />
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
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Decrease Line Width"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
        <span className="px-3 py-2 text-base font-semibold min-w-[32px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <button
          onClick={() => {
            const newWidth = (attributes.strokeWidth || 1) + 1;
            handlePropertyChange("strokeWidth", newWidth);
          }}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer rounded-md transition-colors"
          title="Increase Line Width"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
      </div>
    </>
  );

  const renderCommonControls = () => (
    <>
      {/* Advanced Settings */}
      <div className="relative">
        <button
          onClick={() => {
            setShowAdvancedSettings(!showAdvancedSettings);
          }}
          className="w-10 h-10 flex flex-col items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
          title="Advanced Settings"
        >
          <Type className="w-4 h-3" />
          <MoveHorizontal className="w-6 h-3" />
        </button>
        {showAdvancedSettings && <AdvancedSettingsPanel />}
      </div>

      {/* Separator */}
      <div className="w-px h-7 bg-gray-300 mx-1" />

      {/* Transparency */}
      <div className="relative">
        <button
          onClick={() => setShowOpacityCard(!showOpacityCard)}
          className="w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
          title="Transparency"
        >
          <Droplets className="w-5 h-5" />
        </button>

        {showOpacityCard && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 min-w-[150px]">
            <div className="text-sm text-gray-700 font-semibold mb-3">
              Transparency
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={attributes.opacity || 1}
                onChange={(e) =>
                  handlePropertyChange("opacity", parseFloat(e.target.value))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-gray-700 font-semibold min-w-[35px] text-center">
                {Math.round((attributes.opacity || 1) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-7 bg-gray-300 mx-1" />

      {/* Effects */}
      <button
        onClick={() => {
          // TODO: Open effects panel
          console.log("Effects clicked");
        }}
        className="px-2 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
        title="Effects"
      >
        {/* <Sparkles className="w-5 h-5" />*/}
        Effects
      </button>

      {/* Separator */}
      <div className="w-px h-7 bg-gray-300 mx-1" />

      {/* Position */}
      <button
        onClick={() => {
          // TODO: Open position panel
          console.log("Position clicked");
        }}
        className="px-2 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
        title="Position"
      >
        {/* <Move className="w-5 h-5" /> */}
        Position
      </button>

      {/* Separator */}
      <div className="w-px h-7 bg-gray-300 mx-1" />

      {/* Copy Style */}
      <button
        onClick={handleCopyStyle}
        className="w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-gray-100 text-gray-800 border border-transparent"
        title="Copy Style"
      >
        <PaintRoller className="w-5 h-5" />
      </button>
    </>
  );

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-5 py-2 bg-white border border-gray-200 rounded-lg shadow-xl backdrop-blur-sm">
        {/* Render controls based on object type */}
        {isTextObject() && renderTextControls()}
        {isShapeObject() && renderShapeControls()}
        {isLineObject() && renderLineControls()}

        {/* Common controls */}
        {renderCommonControls()}
      </div>

      {/* Click outside handler for dropdowns */}
      {(showFontDropdown || showOpacityCard || showAdvancedSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowFontDropdown(false);
            setShowOpacityCard(false);
            setShowAdvancedSettings(false);
          }}
        />
      )}
    </div>
  );
};

export default TopPropertyPanel;
