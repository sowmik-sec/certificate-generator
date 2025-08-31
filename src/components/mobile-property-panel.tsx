/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { EditorMode } from "@/components/sidebar-navigation";
import { toast, Toaster } from "sonner";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus,
  Plus,
  Type,
  PaintRoller,
  X,
  Settings,
  Sparkles,
  Move,
  Palette,
  Strikethrough,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface MobilePropertyPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
  setEditorMode: (mode: EditorMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MobilePropertyPanel: React.FC<MobilePropertyPanelProps> = ({
  selectedObject,
  canvas,
  setEditorMode,
  isOpen,
  onClose,
}) => {
  const {
    attributes,
    syncFromFabricObject,
    applyToFabricObject,
    isTextObject,
    isShapeObject,
    isLineObject,
  } = usePropertiesStore();

  const [isUpperCase, setIsUpperCase] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState("left");
  const [hasStrikethrough, setHasStrikethrough] = useState(false);
  const [currentListType, setCurrentListType] = useState<
    "none" | "bullet" | "number"
  >("none");
  const [activeTab, setActiveTab] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState<
    "text" | "fill" | "stroke" | null
  >(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({
    x: 0,
    y: 0,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Common colors palette for mobile
  const commonColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#C0C0C0",
    "#808080",
    "#FF9999",
    "#FFCC99",
    "#FFFF99",
    "#CCFF99",
    "#99FFCC",
    "#99CCFF",
    "#CC99FF",
    "#FF99CC",
  ];

  // Define comprehensive tabs based on object type
  const getTabsForObjectType = () => {
    if (isTextObject()) {
      return [
        { id: 0, name: "Font", icon: Type },
        { id: 1, name: "Format", icon: Bold },
        { id: 2, name: "Color", icon: Palette },
        { id: 3, name: "Effects", icon: Sparkles },
        { id: 4, name: "Position", icon: Move },
        { id: 5, name: "Advanced", icon: Settings },
      ];
    } else if (isShapeObject()) {
      return [
        { id: 0, name: "Fill", icon: Palette },
        { id: 1, name: "Stroke", icon: Settings },
        { id: 2, name: "Position", icon: Move },
        { id: 3, name: "Advanced", icon: Settings },
      ];
    } else if (isLineObject()) {
      return [
        { id: 0, name: "Style", icon: Settings },
        { id: 1, name: "Position", icon: Move },
        { id: 2, name: "Advanced", icon: Settings },
      ];
    }
    return [];
  };

  const tabs = getTabsForObjectType();

  // Sync attributes when selected object changes - same as desktop
  useEffect(() => {
    if (!selectedObject) return;

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

  // Close color picker when tab changes
  useEffect(() => {
    setShowColorPicker(null);
  }, [activeTab]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && event.target instanceof Element) {
        const colorPicker = event.target.closest("[data-color-picker]");
        if (!colorPicker) {
          setShowColorPicker(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  const handlePropertyChange = (prop: keyof typeof attributes, value: any) => {
    applyToFabricObject(selectedObject, canvas, prop, value);
  };

  const handleColorPickerClick = (
    type: "text" | "fill" | "stroke",
    event: React.MouseEvent
  ) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setColorPickerPosition({
      x: rect.left,
      y: rect.top - 160, // Position above the button with some margin
    });
    setShowColorPicker(showColorPicker === type ? null : type);
  };

  const handleFontSizeChange = (increment: boolean) => {
    const currentSize = attributes.fontSize || 14;
    const newSize = increment ? currentSize + 1 : Math.max(8, currentSize - 1);
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

    const currentText = attributes.text || "";
    let transformedText = currentText;

    // Remove existing list formatting
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

    setCurrentListType(nextListType);
    handlePropertyChange("listType", nextListType);

    if (transformedText !== currentText) {
      handlePropertyChange("text", transformedText);
    }
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

  const getListIcon = () => {
    switch (currentListType) {
      case "bullet":
        return <List className="w-4 h-4" />;
      case "number":
        return <ListOrdered className="w-4 h-4" />;
      default:
        return <List className="w-4 h-4 opacity-50" />;
    }
  };

  const handleCopyStyle = () => {
    if (!selectedObject) return;

    try {
      const safeCopy: any = {
        type: selectedObject.type,
        left: selectedObject.left || 0,
        top: selectedObject.top || 0,
        width: selectedObject.width,
        height: selectedObject.height,
        scaleX: selectedObject.scaleX || 1,
        scaleY: selectedObject.scaleY || 1,
        angle: selectedObject.angle || 0,
        opacity: selectedObject.opacity || 1,
        visible: selectedObject.visible !== false,
        flipX: selectedObject.flipX || false,
        flipY: selectedObject.flipY || false,
        skewX: selectedObject.skewX || 0,
        skewY: selectedObject.skewY || 0,
      };

      localStorage.setItem("copiedObject", JSON.stringify(safeCopy));

      const payload = `CERT-COPY:${JSON.stringify(safeCopy)}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).catch(() => {});
      }

      toast.success("Style copied to clipboard");
    } catch (err) {
      console.error("Failed to copy style:", err);
    }
  };

  // Handle tab change
  const handleTabChange = (tabIndex: number) => {
    const tabs = getTabsForObjectType();
    const selectedTab = tabs[tabIndex];

    if (selectedTab) {
      // Check if this tab should open a left panel directly
      if (selectedTab.name === "Effects") {
        // Effects tab only available for text objects - open effects panel
        setEditorMode("effects");
        return;
      } else if (selectedTab.name === "Position") {
        // Position tab available for all object types - open position panel
        setEditorMode("position");
        return;
      } else if (selectedTab.name === "Advanced") {
        // Advanced tab available for all object types - open advanced settings panel
        setEditorMode("advanced-settings");
        return;
      }
    }

    // For regular tabs (Font, Format, Color, Fill, Stroke, Style), just change the tab
    setActiveTab(tabIndex);
  };

  // Render content based on active tab - ALL desktop functionality
  const renderTabContent = () => {
    if (isTextObject()) {
      switch (activeTab) {
        case 0: // Font
          return (
            <div className="flex items-center gap-3 px-4 overflow-x-auto">
              {/* Font Family - no dropdown, just button that shows current */}
              <Button
                variant="outline"
                className="h-10 px-3 text-sm whitespace-nowrap"
              >
                {attributes.fontFamily || "Poppins"}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleFontSizeChange(false)}
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-3 py-2 bg-gray-100 rounded min-w-[40px] text-center text-sm">
                  {Math.round(attributes.fontSize || 14)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleFontSizeChange(true)}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );

        case 1: // Format - Bold, Italic, Underline, Strikethrough, Case, Alignment, Lists
          return (
            <div className="flex items-center gap-2 px-4 overflow-x-auto">
              <Button
                variant={
                  attributes.fontWeight === "bold" ? "default" : "outline"
                }
                size="icon"
                onClick={() =>
                  handlePropertyChange(
                    "fontWeight",
                    attributes.fontWeight === "bold" ? "normal" : "bold"
                  )
                }
                className="h-10 w-10"
              >
                <Bold className="w-4 h-4" />
              </Button>

              <Button
                variant={
                  attributes.fontStyle === "italic" ? "default" : "outline"
                }
                size="icon"
                onClick={() =>
                  handlePropertyChange(
                    "fontStyle",
                    attributes.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className="h-10 w-10"
              >
                <Italic className="w-4 h-4" />
              </Button>

              <Button
                variant={attributes.underline ? "default" : "outline"}
                size="icon"
                onClick={() =>
                  handlePropertyChange("underline", !attributes.underline)
                }
                className="h-10 w-10"
              >
                <Underline className="w-4 h-4" />
              </Button>

              <Button
                variant={hasStrikethrough ? "default" : "outline"}
                size="icon"
                onClick={() =>
                  handlePropertyChange("linethrough", !hasStrikethrough)
                }
                className="h-10 w-10"
              >
                <Strikethrough className="w-4 h-4" />
              </Button>

              <Button
                variant={isUpperCase ? "default" : "outline"}
                size="icon"
                onClick={handleTextCaseToggle}
                className="h-10 w-10 text-xs font-bold"
              >
                aA
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleAlignmentClick}
                className="h-10 w-10"
              >
                {getAlignmentIcon()}
              </Button>

              <Button
                variant={currentListType !== "none" ? "default" : "outline"}
                size="icon"
                onClick={handleListTypeToggle}
                className="h-10 w-10"
              >
                {getListIcon()}
              </Button>
            </div>
          );

        case 2: // Color - Text color and opacity
          return (
            <div className="flex items-center gap-4 px-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Text
                </span>
                <div className="relative" data-color-picker>
                  <button
                    onClick={(e) => handleColorPickerClick("text", e)}
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: attributes.fill || "#000000" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Opacity
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <Slider
                    value={[Math.round((attributes.opacity || 1) * 100)]}
                    onValueChange={([value]) =>
                      handlePropertyChange("opacity", value / 100)
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1 min-w-[80px]"
                  />
                  <span className="text-xs text-gray-500 min-w-[35px] text-right">
                    {Math.round((attributes.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCopyStyle}
                className="h-10 px-3 whitespace-nowrap"
              >
                <PaintRoller className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          );

        default:
          return null;
      }
    } else if (isShapeObject()) {
      switch (activeTab) {
        case 0: // Fill
          return (
            <div className="flex items-center gap-4 px-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Fill
                </span>
                <div className="relative" data-color-picker>
                  <button
                    onClick={(e) => handleColorPickerClick("fill", e)}
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: attributes.fill || "#000000" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Opacity
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <Slider
                    value={[Math.round((attributes.opacity || 1) * 100)]}
                    onValueChange={([value]) =>
                      handlePropertyChange("opacity", value / 100)
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1 min-w-[80px]"
                  />
                  <span className="text-xs text-gray-500 min-w-[35px] text-right">
                    {Math.round((attributes.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCopyStyle}
                className="h-10 px-3 whitespace-nowrap"
              >
                <PaintRoller className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          );

        case 1: // Stroke
          return (
            <div className="flex items-center gap-3 px-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Color
                </span>
                <div className="relative" data-color-picker>
                  <button
                    onClick={(e) => handleColorPickerClick("stroke", e)}
                    className="w-8 h-8 rounded border-2"
                    style={{ borderColor: attributes.stroke || "#000000" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePropertyChange(
                      "strokeWidth",
                      Math.max(0, (attributes.strokeWidth || 1) - 1)
                    )
                  }
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-3 py-2 bg-gray-100 rounded min-w-[40px] text-center text-sm">
                  {attributes.strokeWidth || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePropertyChange(
                      "strokeWidth",
                      (attributes.strokeWidth || 1) + 1
                    )
                  }
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );

        default:
          return null;
      }
    } else if (isLineObject()) {
      switch (activeTab) {
        case 0: // Style
          return (
            <div className="flex items-center gap-3 px-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Color
                </span>
                <div className="relative" data-color-picker>
                  <button
                    onClick={(e) => handleColorPickerClick("stroke", e)}
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: attributes.stroke || "#000000" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePropertyChange(
                      "strokeWidth",
                      Math.max(1, (attributes.strokeWidth || 2) - 1)
                    )
                  }
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-3 py-2 bg-gray-100 rounded min-w-[40px] text-center text-sm">
                  {attributes.strokeWidth || 2}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePropertyChange(
                      "strokeWidth",
                      (attributes.strokeWidth || 2) + 1
                    )
                  }
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Opacity
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <Slider
                    value={[Math.round((attributes.opacity || 1) * 100)]}
                    onValueChange={([value]) =>
                      handlePropertyChange("opacity", value / 100)
                    }
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1 min-w-[80px]"
                  />
                  <span className="text-xs text-gray-500 min-w-[35px] text-right">
                    {Math.round((attributes.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCopyStyle}
                className="h-10 px-3 whitespace-nowrap"
              >
                <PaintRoller className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          );

        default:
          return null;
      }
    }

    return null;
  };

  if (!isOpen || !selectedObject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <Toaster position="top-center" />

        {/* Color Picker Portal - Positioned absolutely to avoid clipping */}
        {showColorPicker && (
          <div
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-[200] min-w-[180px] pointer-events-auto"
            style={{
              left: `${colorPickerPosition.x}px`,
              top: `${colorPickerPosition.y}px`,
            }}
            data-color-picker
          >
            <div className="grid grid-cols-6 gap-1 mb-2">
              {commonColors.slice(0, 18).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    if (
                      showColorPicker === "text" ||
                      showColorPicker === "fill"
                    ) {
                      handlePropertyChange("fill", color);
                    } else if (showColorPicker === "stroke") {
                      handlePropertyChange("stroke", color);
                    }
                    setShowColorPicker(null);
                  }}
                  className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-gray-200">
              <span className="text-xs text-gray-600">Custom:</span>
              <input
                type="color"
                value={
                  showColorPicker === "text" || showColorPicker === "fill"
                    ? attributes.fill || "#000000"
                    : attributes.stroke || "#000000"
                }
                onChange={(e) => {
                  if (
                    showColorPicker === "text" ||
                    showColorPicker === "fill"
                  ) {
                    handlePropertyChange("fill", e.target.value);
                  } else if (showColorPicker === "stroke") {
                    handlePropertyChange("stroke", e.target.value);
                  }
                  setShowColorPicker(null);
                }}
                className="w-6 h-5 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Canva-style Horizontal Property Panel - No backdrop, just the panel */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-[110] pointer-events-auto"
        >
          {/* Header with tabs - like Canva */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-2">
              {/* Tab scrollable container */}
              <div
                ref={scrollRef}
                className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-2 h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-3">{renderTabContent()}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobilePropertyPanel;
