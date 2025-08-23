/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { usePropertiesStore } from "@/stores/usePropertiesStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface EffectsLeftPanelProps {
  canvas: any;
  selectedObject: any;
  fabric: any;
  onClose: () => void;
}

interface EffectState {
  type: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  liftIntensity?: number;
  hollowThickness?: number;
  spliceThickness?: number;
  spliceOffsetX?: number;
  spliceOffsetY?: number;
  spliceColor?: string;
  outlineThickness?: number;
  echoOffsetX?: number;
  echoOffsetY?: number;
  echoColor?: string;
  glitchOffsetX?: number;
  glitchOffsetY?: number;
  glitchColor1?: string;
  glitchColor2?: string;
  neonIntensity?: number;
  backgroundRoundness?: number;
  backgroundSpread?: number;
  backgroundOpacity?: number;
  backgroundColor?: string;
  curveIntensity?: number;
}

const EffectsLeftPanel: React.FC<EffectsLeftPanelProps> = ({
  canvas,
  selectedObject,
  fabric,
  onClose,
}) => {
  const { setEditorMode } = useEditorStore();
  const { attributes, syncFromFabricObject } = usePropertiesStore();

  const [selectedEffect, setSelectedEffect] = useState<string>("none");
  const [selectedShape, setSelectedShape] = useState<string>("none");

  // Default state with normal values (no effect applied)
  const [effectState, setEffectState] = useState<EffectState>({
    type: "none",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: "#000000",
    shadowOpacity: 100,
    liftIntensity: 0,
    hollowThickness: 0,
    spliceThickness: 0,
    spliceOffsetX: 0,
    spliceOffsetY: 0,
    spliceColor: "#000000",
    outlineThickness: 0,
    echoOffsetX: 0,
    echoOffsetY: 0,
    echoColor: "#000000",
    glitchOffsetX: 0,
    glitchOffsetY: 0,
    glitchColor1: "#ff0000",
    glitchColor2: "#00ffff",
    neonIntensity: 0,
    backgroundRoundness: 0,
    backgroundSpread: 0,
    backgroundOpacity: 100,
    backgroundColor: "#000000",
    curveIntensity: 0,
  });

  // Helper component for slider with input field
  const SliderWithInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
  }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [inputValue, setInputValue] = useState(value.toString());
    const [isSliding, setIsSliding] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const rafRef = useRef<number | null>(null);
    const inputDebounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (!isSliding) {
        setDisplayValue(value);
        setInputValue(value.toString());
      }
    }, [value, isSliding]);

    // Additional effect to ensure displayValue is updated when value changes externally
    useEffect(() => {
      setDisplayValue(value);
    }, [value]);

    const debouncedOnChange = useCallback(
      (newValue: number) => {
        // Clear any pending debounced call
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Debounce the actual onChange call during sliding
        debounceRef.current = setTimeout(() => {
          onChange(newValue);
          debounceRef.current = null;
        }, 50); // 50ms debounce for smoother performance
      },
      [onChange]
    );

    const handleSliderChange = (val: number[]) => {
      const newValue = val[0];

      // Update display value immediately for ultra-smooth visual feedback
      setDisplayValue(newValue);
      setInputValue(newValue.toString());

      if (isSliding) {
        // Cancel any pending animation frame
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame + debounce for buttery smooth sliding
        rafRef.current = requestAnimationFrame(() => {
          debouncedOnChange(newValue);
          rafRef.current = null;
        });
      } else {
        // Direct onChange when not sliding (click/keyboard)
        onChange(newValue);
      }
    };

    const handleSliderPointerDown = () => {
      setIsSliding(true);
    };

    const handleSliderPointerUp = () => {
      setIsSliding(false);

      // Clean up any pending operations
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Apply final value immediately
      onChange(displayValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      // Provide real-time slider position updates for valid numbers
      const numVal = parseFloat(val);
      if (!isNaN(numVal) && val !== "" && val !== "-") {
        const constrainedValue = Math.min(Math.max(numVal, min), max);
        setDisplayValue(constrainedValue);

        // Clear any pending input debounce
        if (inputDebounceRef.current) {
          clearTimeout(inputDebounceRef.current);
        }

        // Debounce the effect application for smoother typing
        inputDebounceRef.current = setTimeout(() => {
          onChange(constrainedValue);
          inputDebounceRef.current = null;
        }, 300); // 300ms debounce for input typing
      }
    };

    const handleInputBlur = () => {
      // Clear any pending input debounce
      if (inputDebounceRef.current) {
        clearTimeout(inputDebounceRef.current);
        inputDebounceRef.current = null;
      }

      const numVal = parseFloat(inputValue);
      if (isNaN(numVal)) {
        // Reset to current display value if invalid input
        setInputValue(displayValue.toString());
      } else {
        const constrainedValue = Math.min(Math.max(numVal, min), max);
        // Update both display value and apply effect immediately
        setDisplayValue(constrainedValue);
        setInputValue(constrainedValue.toString());
        onChange(constrainedValue);
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        // Clear any pending input debounce
        if (inputDebounceRef.current) {
          clearTimeout(inputDebounceRef.current);
          inputDebounceRef.current = null;
        }

        const numVal = parseFloat(inputValue);
        if (!isNaN(numVal)) {
          const constrainedValue = Math.min(Math.max(numVal, min), max);
          // Update both display value and apply effect immediately
          setDisplayValue(constrainedValue);
          setInputValue(constrainedValue.toString());
          onChange(constrainedValue);
        } else {
          // Reset to current display value if invalid input
          setInputValue(displayValue.toString());
        }
        // Blur the input to remove focus
        e.currentTarget.blur();
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        if (inputDebounceRef.current) {
          clearTimeout(inputDebounceRef.current);
        }
      };
    }, []);

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[displayValue]}
            onValueChange={handleSliderChange}
            onPointerDown={handleSliderPointerDown}
            onPointerUp={handleSliderPointerUp}
            max={max}
            min={min}
            step={step}
            className="flex-1"
          />
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={min}
            max={max}
            step={step}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
    );
  };

  // Handle keyboard events for curved text deletion
  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedObject
      ) {
        if (
          selectedObject._isCurvedText ||
          selectedObject.type === "curved-text"
        ) {
          // Allow deletion of curved text
          event.preventDefault();
          canvas.remove(selectedObject);
          canvas.discardActiveObject();
          canvas.renderAll();

          // Clear selection in parent component
          setTimeout(() => {
            canvas.fire("selection:cleared");
          }, 10);
        }
      }
    };

    const handleCanvasKeyDown = (e: any) => {
      const keyEvent = e.e as KeyboardEvent;
      if (
        (keyEvent.key === "Delete" || keyEvent.key === "Backspace") &&
        selectedObject
      ) {
        if (
          selectedObject._isCurvedText ||
          selectedObject.type === "curved-text"
        ) {
          keyEvent.preventDefault();
          canvas.remove(selectedObject);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    // Add event listeners for both document and canvas
    document.addEventListener("keydown", handleKeyDown);
    canvas.on("keydown", handleCanvasKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.off("keydown", handleCanvasKeyDown);
    };
  }, [canvas, selectedObject]);

  // Sync with selected object on mount and reset effects when object changes
  useEffect(() => {
    if (selectedObject) {
      syncFromFabricObject(selectedObject);

      // Check if this is a curved text and preserve its curve value
      let currentCurveValue = 0;
      let isCurrentlyCurved = false;

      if (
        selectedObject._isCurvedText ||
        selectedObject.type === "curved-text"
      ) {
        currentCurveValue = selectedObject._curveAmount || 0;
        isCurrentlyCurved = true;
      }

      // Reset effect selection for new objects
      setSelectedEffect("none");

      // Set shape selection based on whether text is curved
      if (isCurrentlyCurved && Math.abs(currentCurveValue) > 0.01) {
        setSelectedShape("curve");
      } else {
        setSelectedShape("none");
      }

      // Reset effect state to defaults, preserving curve value for curved text
      setEffectState({
        type: "none",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        shadowColor: "#000000",
        shadowOpacity: 100,
        liftIntensity: 0,
        hollowThickness: 0,
        spliceThickness: 0,
        spliceOffsetX: 0,
        spliceOffsetY: 0,
        spliceColor: "#000000",
        outlineThickness: 0,
        echoOffsetX: 0,
        echoOffsetY: 0,
        echoColor: "#000000",
        glitchOffsetX: 0,
        glitchOffsetY: 0,
        glitchColor1: "#ff0000",
        glitchColor2: "#00ffff",
        neonIntensity: 0,
        backgroundRoundness: 0,
        backgroundSpread: 0,
        backgroundOpacity: 100,
        backgroundColor: "#000000",
        curveIntensity: currentCurveValue, // Use the actual curve value
      });
    }
  }, [selectedObject, syncFromFabricObject]);

  // Optimized state updater function
  const updateEffectState = (key: keyof EffectState, value: any) => {
    // Batch state updates for better performance
    setEffectState((prev) => {
      const newState = { ...prev, [key]: value };
      return newState;
    });

    // Use requestAnimationFrame to defer heavy canvas operations
    requestAnimationFrame(() => {
      // Special handling for curve updates - always re-apply immediately
      if (key === "curveIntensity") {
        // Update the stored curve amount in the object metadata if it exists
        if (selectedObject) {
          if (
            selectedObject._isCurvedText ||
            selectedObject.type === "curved-text"
          ) {
            selectedObject._curveAmount = value;
          }
        }
        // Always re-apply the curve with the new value
        applyCurveEffect(selectedObject, value);
      } else {
        // Re-apply effects only if necessary
        if (selectedEffect !== "none") {
          applyEffect(selectedEffect);
        }
        if (selectedShape !== "none" && selectedShape !== "curve") {
          applyShape(selectedShape);
        }
      }
    });
  };

  const handleClose = () => {
    setEditorMode(null);
    onClose();
  };

  // Don't render if no text object is selected
  if (
    !selectedObject ||
    (selectedObject.type !== "textbox" &&
      selectedObject.type !== "text" &&
      selectedObject.type !== "curved-text" &&
      !selectedObject._isCurvedText)
  ) {
    return (
      <div className="w-full h-full bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Effects</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* No text selected message */}
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">
              Select text to add effects
            </p>
            <p className="text-sm">
              Choose a text element on the canvas to customize its appearance
              with effects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const applyEffect = (effectType: string) => {
    if (!selectedObject || !canvas || !fabric) return;

    // Only apply effects to text objects or curved text groups
    if (
      selectedObject.type !== "textbox" &&
      selectedObject.type !== "text" &&
      selectedObject.type !== "curved-text" &&
      !selectedObject._isCurvedText
    ) {
      console.warn("Effects can only be applied to text objects");
      return;
    }

    // If it's a curved text group, we need to apply effects to individual characters
    if (selectedObject._isCurvedText || selectedObject.type === "curved-text") {
      const group = selectedObject;
      const objects = group.getObjects();

      objects.forEach((obj: any) => {
        if (obj.type === "text") {
          // Remove existing effects
          obj.shadow = null;
          obj.stroke = null;
          obj.strokeWidth = 0;

          // Apply new effect
          applyEffectToTextObject(obj, effectType);
        }
      });

      canvas.renderAll();
      return;
    }

    // Apply effect to regular text object
    applyEffectToTextObject(selectedObject, effectType);
    canvas.renderAll();
  };

  // Helper function to apply effects to individual text objects
  const applyEffectToTextObject = (textObject: any, effectType: string) => {
    // Remove existing effects
    textObject.shadow = null;
    textObject.stroke = null;
    textObject.strokeWidth = 0;

    let shadow = null;

    switch (effectType) {
      case "shadow":
        const shadowOpacity = (effectState.shadowOpacity || 100) / 100;
        const shadowColorWithOpacity = effectState.shadowColor
          ? `rgba(${parseInt(
              effectState.shadowColor.slice(1, 3),
              16
            )}, ${parseInt(
              effectState.shadowColor.slice(3, 5),
              16
            )}, ${parseInt(
              effectState.shadowColor.slice(5, 7),
              16
            )}, ${shadowOpacity})`
          : `rgba(0, 0, 0, ${shadowOpacity})`;

        shadow = new fabric.Shadow({
          color: shadowColorWithOpacity,
          blur: effectState.shadowBlur || 0,
          offsetX: effectState.shadowOffsetX || 0,
          offsetY: effectState.shadowOffsetY || 0,
        });
        textObject.shadow = shadow;
        break;

      case "lift":
        shadow = new fabric.Shadow({
          color: "rgba(0, 0, 0, 0.3)",
          blur: (effectState.liftIntensity || 0) / 2,
          offsetX: 0,
          offsetY: (effectState.liftIntensity || 0) / 10,
        });
        textObject.shadow = shadow;
        break;

      case "hollow":
        textObject.fill = "transparent";
        textObject.stroke = attributes.fill || "#000000";
        textObject.strokeWidth = effectState.hollowThickness || 0;
        break;

      case "splice":
        shadow = new fabric.Shadow({
          color: effectState.spliceColor || "#000000",
          blur: 0,
          offsetX: effectState.spliceOffsetX || 0,
          offsetY: effectState.spliceOffsetY || 0,
        });
        textObject.shadow = shadow;
        textObject.strokeWidth = effectState.spliceThickness || 0;
        textObject.stroke = effectState.spliceColor || "#000000";
        break;

      case "outline":
        textObject.stroke = attributes.fill || "#000000";
        textObject.strokeWidth = effectState.outlineThickness || 0;
        break;

      case "echo":
        shadow = new fabric.Shadow({
          color: effectState.echoColor || "#000000",
          blur: 0,
          offsetX: effectState.echoOffsetX || 0,
          offsetY: effectState.echoOffsetY || 0,
        });
        textObject.shadow = shadow;
        break;

      case "glitch":
        shadow = new fabric.Shadow({
          color: effectState.glitchColor1 || "#ff0000",
          blur: 0,
          offsetX: effectState.glitchOffsetX || 0,
          offsetY: effectState.glitchOffsetY || 0,
        });
        textObject.shadow = shadow;
        break;

      case "neon":
        shadow = new fabric.Shadow({
          color: attributes.fill || "#00ffff",
          blur: effectState.neonIntensity || 0,
          offsetX: 0,
          offsetY: 0,
        });
        textObject.shadow = shadow;
        break;

      case "background":
        shadow = new fabric.Shadow({
          color: effectState.backgroundColor || "#000000",
          blur: effectState.backgroundSpread || 0,
          offsetX: 0,
          offsetY: 0,
        });
        textObject.shadow = shadow;
        break;

      case "none":
      default:
        textObject.shadow = null;
        textObject.stroke = null;
        textObject.strokeWidth = 0;
        if (textObject.fill === "transparent") {
          textObject.fill = attributes.fill || "#000000";
        }
        break;
    }
  };

  // Function to apply proper arc curve effect like Canva
  const applyCurveEffect = (textObject: any, curveAmount: number) => {
    if (!fabric || !canvas) return;

    const intensity = curveAmount / 100; // -1 to 1

    // Get text properties from either regular text or curved text metadata
    let originalText: string;
    let fontSize: number;
    let fontFamily: string;
    let fill: string;
    let stroke: string | null;
    let strokeWidth: number;
    let originalLeft: number;
    let originalTop: number;

    if (textObject._isCurvedText || textObject.type === "curved-text") {
      // Get properties from curved text metadata
      originalText = textObject._originalText || "";
      fontSize = textObject._fontSize || 24;
      fontFamily = textObject._fontFamily || "Arial";
      fill = textObject._fill || "#000000";
      stroke = textObject._stroke || null;
      strokeWidth = textObject._strokeWidth || 0;
      originalLeft = textObject.left || 0;
      originalTop = textObject.top || 0;
    } else {
      // Get properties from regular text object
      originalText = textObject.text || "";
      fontSize = textObject.fontSize || 24;
      fontFamily = textObject.fontFamily || "Arial";
      fill = textObject.fill || "#000000";
      stroke = textObject.stroke || null;
      strokeWidth = textObject.strokeWidth || 0;
      originalLeft = textObject.left || 0;
      originalTop = textObject.top || 0;
    }

    // If curve is near zero, reset to normal text
    if (Math.abs(intensity) < 0.01) {
      // Remove curved text if it exists and replace with straight text
      if (textObject._isCurvedText || textObject.type === "curved-text") {
        const straightText = new fabric.Text(originalText, {
          left: originalLeft,
          top: originalTop,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: fill,
          stroke: stroke,
          strokeWidth: strokeWidth,
          originX: "center",
          originY: "center",
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        canvas.remove(textObject);
        canvas.add(straightText);
        canvas.setActiveObject(straightText);
        canvas.renderAll();

        // Fire selection events
        setTimeout(() => {
          canvas.fire("selection:cleared");
          canvas.fire("selection:created", {
            target: straightText,
            selected: [straightText],
          });
          canvas.fire("object:selected", { target: straightText });
        }, 10);
      }
      return;
    }

    // Calculate the actual text width in pixels
    const tempText = new fabric.Text(originalText, {
      fontSize: fontSize,
      fontFamily: fontFamily,
    });
    const actualTextWidth = tempText.width;

    // Calculate arc parameters for proper Canva-like behavior
    const minArcAngle = Math.PI / 12; // Minimum curve for subtle effect
    const maxArcAngle = Math.PI * 1.8; // Maximum curve (about 324 degrees)
    const arcAngle =
      minArcAngle + Math.abs(intensity) * (maxArcAngle - minArcAngle);

    // Calculate radius to maintain text readability
    let radius = actualTextWidth / arcAngle;
    const minRadius = fontSize * 2; // Minimum radius based on font size
    if (radius < minRadius) {
      radius = minRadius;
    }

    // Remove the existing object (whether it's curved or straight)
    canvas.remove(textObject);

    // Create individual character objects positioned along the arc
    const characters: string[] = originalText.split("");
    const charObjects: any[] = [];
    const nonSpaceChars = characters.filter((c: string) => c.trim() !== "");

    // Calculate character spacing to maintain proper text flow
    const charSpacing = actualTextWidth / Math.max(nonSpaceChars.length - 1, 1);

    let currentArcPosition = 0;

    characters.forEach((char: string) => {
      // Handle spaces by advancing position but not creating visible characters
      if (char.trim() === "") {
        currentArcPosition += charSpacing * 0.3; // Smaller space for readability
        return;
      }

      // Calculate the angle for this character based on its position along the arc
      const normalizedPosition = currentArcPosition / actualTextWidth;
      const angle = (normalizedPosition - 0.5) * arcAngle;

      // Calculate position on the circle - Fixed direction logic like Canva
      let x: number, y: number, rotation: number;

      if (curveAmount > 0) {
        // Positive values: curve downward (smile) - like Canva
        x = originalLeft + Math.sin(angle) * radius;
        y = originalTop + radius - Math.cos(angle) * radius;
        rotation = (angle * 180) / Math.PI;
      } else {
        // Negative values: curve upward (frown) - like Canva
        x = originalLeft - Math.sin(angle) * radius;
        y = originalTop - radius + Math.cos(angle) * radius;
        rotation = -(angle * 180) / Math.PI;
      }

      // Create individual character with proper positioning and rotation
      const charObject = new fabric.Text(char, {
        left: x,
        top: y,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        angle: rotation,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        hoverCursor: "default",
        moveCursor: "default",
      });

      charObjects.push(charObject);
      currentArcPosition += charSpacing;
    });

    // Only create group if we have characters
    if (charObjects.length > 0) {
      // Group all characters together to create the curved text
      const curvedTextGroup = new fabric.Group(charObjects, {
        left: originalLeft,
        top: originalTop,
        originX: "center",
        originY: "center",
        selectable: true,
        hasControls: true,
        hasBorders: true,
        subTargetCheck: true,
        excludeFromExport: false,
        // Enable proper event handling
        evented: true,
        // Make sure it can receive keyboard events
        lockMovementX: false,
        lockMovementY: false,
      });

      // Add metadata to identify this as a curved text
      (curvedTextGroup as any)._isCurvedText = true;
      (curvedTextGroup as any)._originalText = originalText;
      (curvedTextGroup as any)._curveAmount = curveAmount;
      (curvedTextGroup as any)._fontSize = fontSize;
      (curvedTextGroup as any)._fontFamily = fontFamily;
      (curvedTextGroup as any)._fill = fill;
      (curvedTextGroup as any)._stroke = stroke;
      (curvedTextGroup as any)._strokeWidth = strokeWidth;
      (curvedTextGroup as any).type = "curved-text";

      // Add to canvas and make it active
      canvas.add(curvedTextGroup);
      canvas.setActiveObject(curvedTextGroup);
      canvas.renderAll();

      // Fire selection events
      setTimeout(() => {
        canvas.fire("selection:cleared");
        canvas.fire("selection:created", {
          target: curvedTextGroup,
          selected: [curvedTextGroup],
        });
        canvas.fire("object:selected", { target: curvedTextGroup });
      }, 10);
    }
  };

  const applyShape = (shapeType: string) => {
    if (!selectedObject || !canvas || !fabric) return;

    // Only apply shape effects to text objects or curved text groups
    if (
      selectedObject.type !== "textbox" &&
      selectedObject.type !== "text" &&
      selectedObject.type !== "curved-text" &&
      !selectedObject._isCurvedText
    ) {
      console.warn("Shape effects can only be applied to text objects");
      return;
    }

    switch (shapeType) {
      case "curve":
        // Get the current curve amount from state
        const curveAmount = effectState.curveIntensity || 0;

        // Always apply the curve effect with the current value
        applyCurveEffect(selectedObject, curveAmount);
        break;

      case "none":
      default:
        // Reset to straight text
        if (
          selectedObject._isCurvedText ||
          selectedObject.type === "curved-text"
        ) {
          const originalText = selectedObject._originalText || "";
          const fontSize = selectedObject._fontSize || 24;
          const fontFamily = selectedObject._fontFamily || "Arial";
          const fill = selectedObject._fill || "#000000";
          const stroke = selectedObject._stroke || null;
          const strokeWidth = selectedObject._strokeWidth || 0;

          const newTextObject = new fabric.Text(originalText, {
            left: selectedObject.left,
            top: selectedObject.top,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: fill,
            stroke: stroke,
            strokeWidth: strokeWidth,
            originX: "center",
            originY: "center",
            selectable: true,
            hasControls: true,
            hasBorders: true,
          });

          canvas.remove(selectedObject);
          canvas.add(newTextObject);
          canvas.setActiveObject(newTextObject);
          canvas.renderAll();

          // Fire selection events
          setTimeout(() => {
            canvas.fire("selection:cleared");
            canvas.fire("selection:created", {
              target: newTextObject,
              selected: [newTextObject],
            });
            canvas.fire("object:selected", { target: newTextObject });
          }, 10);
        } else {
          // Reset any transformations on regular text
          selectedObject.skewY = 0;
          selectedObject.skewX = 0;
          if (selectedObject.path) {
            selectedObject.path = null;
          }
        }
        break;
    }

    canvas.renderAll();
  };

  const handleEffectSelect = (effectType: string) => {
    setSelectedEffect(effectType);
    setEffectState({ ...effectState, type: effectType });
    applyEffect(effectType);
  };

  const handleShapeSelect = (shapeType: string) => {
    setSelectedShape(shapeType);
    applyShape(shapeType);
  };

  // Individual render functions for controls
  const renderShadowControls = () => (
    <div className="space-y-4">
      {/* Offset */}
      <SliderWithInput
        label="Offset"
        value={effectState.shadowOffsetX || 0}
        onChange={(value) => updateEffectState("shadowOffsetX", value)}
        min={-50}
        max={50}
      />

      {/* Direction */}
      <SliderWithInput
        label="Direction"
        value={effectState.shadowOffsetY || 0}
        onChange={(value) => updateEffectState("shadowOffsetY", value)}
        min={-50}
        max={50}
      />

      {/* Blur */}
      <SliderWithInput
        label="Blur"
        value={effectState.shadowBlur || 0}
        onChange={(value) => updateEffectState("shadowBlur", value)}
        min={0}
        max={50}
      />

      {/* Transparency */}
      <SliderWithInput
        label="Transparency"
        value={effectState.shadowOpacity || 100}
        onChange={(value) => updateEffectState("shadowOpacity", value)}
        min={0}
        max={100}
      />

      {/* Color */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Color</Label>
        <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
          <input
            type="color"
            value={effectState.shadowColor || "#000000"}
            onChange={(e) => updateEffectState("shadowColor", e.target.value)}
            className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          />
        </div>
      </div>
    </div>
  );

  const renderLiftControls = () => (
    <div className="space-y-4">
      <SliderWithInput
        label="Intensity"
        value={effectState.liftIntensity || 0}
        onChange={(value) => updateEffectState("liftIntensity", value)}
        min={0}
        max={100}
      />
    </div>
  );

  const renderHollowControls = () => (
    <div className="space-y-4">
      <SliderWithInput
        label="Thickness"
        value={effectState.hollowThickness || 0}
        onChange={(value) => updateEffectState("hollowThickness", value)}
        min={0}
        max={10}
        step={0.5}
      />
    </div>
  );

  const renderSpliceControls = () => (
    <div className="space-y-4">
      {/* Thickness */}
      <SliderWithInput
        label="Thickness"
        value={effectState.spliceThickness || 0}
        onChange={(value) => updateEffectState("spliceThickness", value)}
        min={0}
        max={10}
        step={0.5}
      />

      {/* Offset */}
      <SliderWithInput
        label="Offset"
        value={effectState.spliceOffsetX || 0}
        onChange={(value) => updateEffectState("spliceOffsetX", value)}
        min={-20}
        max={20}
      />

      {/* Direction */}
      <SliderWithInput
        label="Direction"
        value={effectState.spliceOffsetY || 0}
        onChange={(value) => updateEffectState("spliceOffsetY", value)}
        min={-20}
        max={20}
      />

      {/* Color */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Color</Label>
        <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
          <input
            type="color"
            value={effectState.spliceColor || "#000000"}
            onChange={(e) => updateEffectState("spliceColor", e.target.value)}
            className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          />
        </div>
      </div>
    </div>
  );

  const renderOutlineControls = () => (
    <div className="space-y-4">
      <SliderWithInput
        label="Thickness"
        value={effectState.outlineThickness || 0}
        onChange={(value) => updateEffectState("outlineThickness", value)}
        min={0}
        max={10}
        step={0.5}
      />
    </div>
  );

  const renderEchoControls = () => (
    <div className="space-y-4">
      {/* Offset */}
      <SliderWithInput
        label="Offset"
        value={effectState.echoOffsetX || 0}
        onChange={(value) => updateEffectState("echoOffsetX", value)}
        min={-20}
        max={20}
      />

      {/* Direction */}
      <SliderWithInput
        label="Direction"
        value={effectState.echoOffsetY || 0}
        onChange={(value) => updateEffectState("echoOffsetY", value)}
        min={-20}
        max={20}
      />

      {/* Color */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Color</Label>
        <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
          <input
            type="color"
            value={effectState.echoColor || "#000000"}
            onChange={(e) => updateEffectState("echoColor", e.target.value)}
            className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          />
        </div>
      </div>
    </div>
  );

  const renderGlitchControls = () => (
    <div className="space-y-4">
      {/* Offset */}
      <SliderWithInput
        label="Offset"
        value={effectState.glitchOffsetX || 0}
        onChange={(value) => updateEffectState("glitchOffsetX", value)}
        min={-20}
        max={20}
      />

      {/* Direction */}
      <SliderWithInput
        label="Direction"
        value={effectState.glitchOffsetY || 0}
        onChange={(value) => updateEffectState("glitchOffsetY", value)}
        min={-20}
        max={20}
      />

      {/* Color Section with both colors side by side */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Colors</Label>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
            <input
              type="color"
              value={effectState.glitchColor1 || "#ff0000"}
              onChange={(e) =>
                updateEffectState("glitchColor1", e.target.value)
              }
              className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
              style={{ WebkitAppearance: "none", appearance: "none" }}
            />
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
            <input
              type="color"
              value={effectState.glitchColor2 || "#00ffff"}
              onChange={(e) =>
                updateEffectState("glitchColor2", e.target.value)
              }
              className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
              style={{ WebkitAppearance: "none", appearance: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNeonControls = () => (
    <div className="space-y-4">
      <SliderWithInput
        label="Intensity"
        value={effectState.neonIntensity || 0}
        onChange={(value) => updateEffectState("neonIntensity", value)}
        min={0}
        max={100}
      />
    </div>
  );

  const renderBackgroundControls = () => (
    <div className="space-y-4">
      {/* Roundness */}
      <SliderWithInput
        label="Roundness"
        value={effectState.backgroundRoundness || 0}
        onChange={(value) => updateEffectState("backgroundRoundness", value)}
        min={0}
        max={50}
      />

      {/* Spread */}
      <SliderWithInput
        label="Spread"
        value={effectState.backgroundSpread || 0}
        onChange={(value) => updateEffectState("backgroundSpread", value)}
        min={0}
        max={50}
      />

      {/* Transparency */}
      <SliderWithInput
        label="Transparency"
        value={effectState.backgroundOpacity || 100}
        onChange={(value) => updateEffectState("backgroundOpacity", value)}
        min={0}
        max={100}
      />

      {/* Color */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Color</Label>
        <div className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden relative">
          <input
            type="color"
            value={effectState.backgroundColor || "#000000"}
            onChange={(e) =>
              updateEffectState("backgroundColor", e.target.value)
            }
            className="absolute inset-0 w-full h-full border-none cursor-pointer rounded-full"
            style={{ WebkitAppearance: "none", appearance: "none" }}
          />
        </div>
      </div>
    </div>
  );

  const renderCurveControls = () => (
    <div className="space-y-4">
      <SliderWithInput
        label="Curve"
        value={effectState.curveIntensity || 0}
        onChange={(value) => updateEffectState("curveIntensity", value)}
        min={-100}
        max={100}
      />
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">Effects</h3>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          {/* Style Section */}
          <div className="mb-8">
            <h4 className="text-base font-semibold text-gray-900 mb-4">
              Style
            </h4>

            {/* Effects with Inline Controls */}
            <div className="space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-3">
                {/* None */}
                <button
                  onClick={() => handleEffectSelect("none")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "none"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span className="text-lg font-bold text-gray-700">Ag</span>
                  </div>
                  <span className="text-xs text-gray-600">None</span>
                </button>

                {/* Shadow */}
                <button
                  onClick={() => handleEffectSelect("shadow")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "shadow"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2 relative overflow-hidden">
                    <span className="text-lg font-bold text-gray-700 relative z-10">
                      Ag
                    </span>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: "translate(2px, 2px)",
                        opacity: 0.4,
                      }}
                    >
                      <span className="text-lg font-bold text-gray-600">
                        Ag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">Shadow</span>
                </button>

                {/* Lift */}
                <button
                  onClick={() => handleEffectSelect("lift")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "lift"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span
                      className="text-lg font-bold text-gray-700"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Lift</span>
                </button>
              </div>

              {/* Shadow Controls */}
              {selectedEffect === "shadow" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderShadowControls()}
                </div>
              )}

              {/* Lift Controls */}
              {selectedEffect === "lift" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderLiftControls()}
                </div>
              )}

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Hollow */}
                <button
                  onClick={() => handleEffectSelect("hollow")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "hollow"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span
                      className="text-lg font-bold text-transparent"
                      style={{ WebkitTextStroke: "2px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Hollow</span>
                </button>

                {/* Splice */}
                <button
                  onClick={() => handleEffectSelect("splice")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "splice"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span
                      className="text-lg font-bold text-gray-700"
                      style={{ WebkitTextStroke: "1px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Splice</span>
                </button>

                {/* Outline */}
                <button
                  onClick={() => handleEffectSelect("outline")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "outline"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span
                      className="text-lg font-bold text-gray-700"
                      style={{ WebkitTextStroke: "1px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Outline</span>
                </button>
              </div>

              {/* Hollow Controls */}
              {selectedEffect === "hollow" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderHollowControls()}
                </div>
              )}

              {/* Splice Controls */}
              {selectedEffect === "splice" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderSpliceControls()}
                </div>
              )}

              {/* Outline Controls */}
              {selectedEffect === "outline" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderOutlineControls()}
                </div>
              )}

              {/* Row 3 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Echo */}
                <button
                  onClick={() => handleEffectSelect("echo")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "echo"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2 relative">
                    <span className="text-lg font-bold text-gray-700 relative z-10">
                      Ag
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center transform translate-x-0.5 translate-y-0.5">
                      <span className="text-lg font-bold text-gray-500 opacity-60">
                        Ag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">Echo</span>
                </button>

                {/* Glitch */}
                <button
                  onClick={() => handleEffectSelect("glitch")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "glitch"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2 relative overflow-hidden">
                    <span className="text-lg font-bold text-gray-700 relative z-20">
                      Ag
                    </span>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: "translate(1px, -1px)",
                        opacity: 0.8,
                      }}
                    >
                      <span className="text-lg font-bold text-red-500">Ag</span>
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: "translate(-1px, 1px)",
                        opacity: 0.8,
                      }}
                    >
                      <span className="text-lg font-bold text-cyan-500">
                        Ag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">Glitch</span>
                </button>

                {/* Neon */}
                <button
                  onClick={() => handleEffectSelect("neon")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "neon"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span
                      className="text-lg font-bold text-pink-500"
                      style={{ textShadow: "0 0 10px currentColor" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Neon</span>
                </button>
              </div>

              {/* Echo Controls */}
              {selectedEffect === "echo" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderEchoControls()}
                </div>
              )}

              {/* Glitch Controls */}
              {selectedEffect === "glitch" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderGlitchControls()}
                </div>
              )}

              {/* Neon Controls */}
              {selectedEffect === "neon" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderNeonControls()}
                </div>
              )}

              {/* Row 4 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Background */}
                <button
                  onClick={() => handleEffectSelect("background")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedEffect === "background"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-800 rounded mb-2">
                    <span className="text-lg font-bold text-white">Ag</span>
                  </div>
                  <span className="text-xs text-gray-600">Background</span>
                </button>

                {/* Empty placeholders to maintain grid */}
                <div></div>
                <div></div>
              </div>

              {/* Background Controls */}
              {selectedEffect === "background" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderBackgroundControls()}
                </div>
              )}
            </div>
          </div>

          {/* Shape Section */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-4">
              Shape
            </h4>

            {/* Shape Options */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* None */}
                <button
                  onClick={() => handleShapeSelect("none")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedShape === "none"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span className="text-lg font-bold text-gray-700">Ag</span>
                  </div>
                  <span className="text-xs text-gray-600">None</span>
                </button>

                {/* Curve */}
                <button
                  onClick={() => handleShapeSelect("curve")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedShape === "curve"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                    <span className="text-lg font-bold text-gray-700">
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 24 16"
                        fill="currentColor"
                      >
                        <path
                          d="M2 14 Q12 2, 22 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">Curve</span>
                </button>
              </div>

              {/* Curve Controls */}
              {selectedShape === "curve" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderCurveControls()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectsLeftPanel;
