/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FabricCanvas } from "@/types/fabric";
import { FabricObject } from "fabric";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { EditorMode } from "@/components/sidebar-navigation";
import MobilePropertyPanel from "./mobile-property-panel";
import { useResponsive } from "@/hooks/useResponsive";
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
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TopPropertyPanelProps {
  selectedObject: FabricObject;
  canvas: FabricCanvas;
  setEditorMode: (mode: EditorMode) => void;
  isMobilePropertyOpen?: boolean;
  onMobilePropertyClose?: () => void;
}

const TopPropertyPanel: React.FC<TopPropertyPanelProps> = ({
  selectedObject,
  canvas,
  setEditorMode,
  isMobilePropertyOpen = false,
  onMobilePropertyClose = () => {},
}) => {
  const { isMobile } = useResponsive();
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

  const renderTextControls = () => (
    <div className="flex items-center gap-3">
      {/* Font Family Dropdown */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors max-w-[100px]"
              >
                <span className="font-medium truncate">
                  {attributes.fontFamily || "Poppins"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[160px] max-h-64"
              style={{ zIndex: 70 }}
            >
              {fontOptions.map((font) => (
                <DropdownMenuItem
                  key={font}
                  onClick={() => handlePropertyChange("fontFamily", font)}
                  className={`cursor-pointer ${
                    attributes.fontFamily === font
                      ? "bg-[var(--color-accent)] text-[var(--color-primary)]"
                      : "text-[var(--color-foreground)]"
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Font Family</p>
        </TooltipContent>
      </Tooltip>

      {/* Font Size Controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFontSizeChange(false)}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Minus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease Font Size</p>
          </TooltipContent>
        </Tooltip>
        <span className="px-3 py-2 text-base font-semibold min-w-[40px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.fontSize || 14)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFontSizeChange(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase Font Size</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Font Color */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="flex items-center cursor-pointer group">
              <div className="w-10 h-10 flex flex-col items-center justify-center relative">
                {/* Text "A" icon above color */}
                <span className="font-bold text-base text-[var(--color-foreground)]">
                  A
                </span>
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
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Text Color</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newWeight =
                  attributes.fontWeight === "bold" ? "normal" : "bold";
                handlePropertyChange("fontWeight", newWeight);
              }}
              className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
                attributes.fontWeight === "bold"
                  ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                  : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              }`}
            >
              <Bold className="w-5 h-5 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newStyle =
                  attributes.fontStyle === "italic" ? "normal" : "italic";
                handlePropertyChange("fontStyle", newStyle);
              }}
              className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
                attributes.fontStyle === "italic"
                  ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                  : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              }`}
            >
              <Italic className="w-5 h-5 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                handlePropertyChange("underline", !attributes.underline)
              }
              className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
                attributes.underline
                  ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                  : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              }`}
            >
              <Underline className="w-5 h-5 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Underline</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                handlePropertyChange("linethrough", !attributes.linethrough);
                setHasStrikethrough(!hasStrikethrough);
              }}
              className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
                attributes.linethrough
                  ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                  : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              }`}
            >
              <Strikethrough className="w-5 h-5 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Strikethrough</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Text Case Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTextCaseToggle}
            className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer text-sm font-bold rounded-md transition-colors ${
              isUpperCase
                ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
            }`}
          >
            aA
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle Text Case</p>
        </TooltipContent>
      </Tooltip>

      {/* Text Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAlignmentClick}
            className="w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
          >
            {getAlignmentIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Text Alignment</p>
        </TooltipContent>
      </Tooltip>

      {/* List Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleListTypeToggle}
            className={`w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors ${
              currentListType !== "none"
                ? "bg-[var(--color-accent)] text-[var(--color-primary)] border border-[var(--color-border)]"
                : "hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
            }`}
          >
            {getListIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            List Style:{" "}
            {currentListType === "none"
              ? "None"
              : currentListType === "bullet"
              ? "Bullet"
              : "Numbered"}
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Advanced Settings - Only for Text */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 flex flex-col items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              >
                <Type className="w-4 h-3" />
                <MoveHorizontal className="w-6 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-4" align="start">
              <DropdownMenuLabel className="text-sm font-medium text-[var(--color-foreground)] mb-3">
                Advanced Text Settings
              </DropdownMenuLabel>

              {/* Letter Spacing */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-[var(--color-foreground)]">
                  Letter spacing
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    min={-200}
                    max={800}
                    step={1}
                    value={[attributes.charSpacing || 0]}
                    onValueChange={(val) =>
                      handlePropertyChange("charSpacing", val[0])
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={-200}
                    max={800}
                    value={attributes.charSpacing || 0}
                    onChange={(e) =>
                      handlePropertyChange(
                        "charSpacing",
                        Number(e.target.value)
                      )
                    }
                    className="w-16 h-8"
                  />
                </div>
              </div>

              {/* Line Spacing */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-[var(--color-foreground)]">
                  Line spacing
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.01}
                    value={[attributes.lineHeight || 1.16]}
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
                    value={attributes.lineHeight || 1.16}
                    onChange={(e) =>
                      handlePropertyChange("lineHeight", Number(e.target.value))
                    }
                    className="w-16 h-8"
                  />
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-[var(--color-foreground)]">
                  Text alignment
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    variant={
                      attributes.textAlign === "left" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "left")}
                  >
                    <AlignStartVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      attributes.textAlign === "center" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "center")}
                  >
                    <AlignCenterVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      attributes.textAlign === "right" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="px-2 py-1 h-8"
                    onClick={() => handlePropertyChange("textAlign", "right")}
                  >
                    <AlignEndVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* More Settings Button */}
              <Button
                className="w-full mt-2 hover:cursor-pointer font-semibold"
                variant="secondary"
                onClick={() => setEditorMode("advanced-settings")}
              >
                More Settings
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Advanced Settings</p>
        </TooltipContent>
      </Tooltip>
      {/* Separator */}
      <Separator orientation="vertical" className="h-7 mx-1" />

      {/* Effects */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={() => setEditorMode("effects")}
            className="px-2 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
          >
            {/* <Sparkles className="w-5 h-5" />*/}
            Effects
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Effects</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const renderShapeControls = () => (
    <div className="flex items-center gap-3">
      {/* Shape Color */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="flex items-center cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center">
                <div
                  className="w-7 h-7 rounded border-2 border-[var(--color-border)] group-hover:border-[var(--color-border)] transition-colors shadow-md"
                  style={{ backgroundColor: attributes.fill || "#000000" }}
                />
              </div>
              <input
                type="color"
                value={attributes.fill || "#000000"}
                onChange={(e) => handlePropertyChange("fill", e.target.value)}
                className="sr-only"
              />
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shape Color</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Stroke Color */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center">
                <div
                  className="w-7 h-7 rounded border-2 group-hover:border-[var(--color-border)] transition-colors shadow-md"
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Border Color</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newWidth = Math.max(0, (attributes.strokeWidth || 1) - 1);
                handlePropertyChange("strokeWidth", newWidth);
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Minus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease Border Width</p>
          </TooltipContent>
        </Tooltip>
        <span className="px-3 py-2 text-base font-semibold min-w-[32px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newWidth = (attributes.strokeWidth || 1) + 1;
                handlePropertyChange("strokeWidth", newWidth);
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase Border Width</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  const renderLineControls = () => (
    <div className="flex items-center gap-3">
      {/* Line Color */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center">
                <div
                  className="w-7 h-7 rounded border-2 border-[var(--color-border)] group-hover:border-[var(--color-border)] transition-colors shadow-md"
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Line Color</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Line Width */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newWidth = Math.max(1, (attributes.strokeWidth || 1) - 1);
                handlePropertyChange("strokeWidth", newWidth);
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Minus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease Line Width</p>
          </TooltipContent>
        </Tooltip>
        <span className="px-3 py-2 text-base font-semibold min-w-[32px] text-center h-10 flex items-center justify-center">
          {Math.round(attributes.strokeWidth || 1)}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newWidth = (attributes.strokeWidth || 1) + 1;
                handlePropertyChange("strokeWidth", newWidth);
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-accent)] hover:cursor-pointer rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 font-bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase Line Width</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  const renderCommonControls = () => (
    <div className="flex items-center gap-3">
      {/* Separator */}
      <Separator orientation="vertical" className="h-7 mx-1" />

      {/* Transparency */}
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
              >
                <Droplets className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-4" align="start">
              <DropdownMenuLabel className="text-sm font-medium text-[var(--color-foreground)] mb-3">
                Transparency
              </DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[attributes.opacity || 1]}
                  onValueChange={(val) =>
                    handlePropertyChange("opacity", val[0])
                  }
                  className="flex-1"
                />
                <span className="text-sm text-[var(--color-foreground)] font-semibold min-w-[35px] text-center">
                  {Math.round((attributes.opacity || 1) * 100)}%
                </span>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Transparency</p>
        </TooltipContent>
      </Tooltip>

      {/* Separator */}
      <Separator orientation="vertical" className="h-7 mx-1" />

      {/* Position (open only on click) */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={() => setEditorMode("position")}
            className="px-2 h-10 flex items-center justify-center hover:cursor-pointer rounded-md transition-colors hover:bg-[var(--color-accent)] text-[var(--color-foreground)] border border-transparent"
          >
            Position
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Position</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  // If mobile, render the mobile property panel
  if (isMobile) {
    return (
      <MobilePropertyPanel
        selectedObject={selectedObject}
        canvas={canvas}
        setEditorMode={setEditorMode}
        isOpen={isMobilePropertyOpen}
        onClose={onMobilePropertyClose}
      />
    );
  }

  // Desktop version
  return (
    <TooltipProvider>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60">
        <Card className="flex flex-row items-center gap-3 px-5 py-2 backdrop-blur-sm bg-[var(--color-card)] border shadow-lg">
          {/* Render controls based on object type */}
          {isTextObject() && renderTextControls()}
          {isShapeObject() && renderShapeControls()}
          {isLineObject() && renderLineControls()}

          {/* Common controls */}
          {renderCommonControls()}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default TopPropertyPanel;
