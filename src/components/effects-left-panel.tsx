/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useEditorStore } from "@/stores/useEditorStore";
import { usePropertiesStore } from "@/stores/usePropertiesStore";

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

interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  canvas?: any;
  fabric?: any;
  selectedObject?: any;
  effectType?: string;
  propertyKey?: string;
}

// OPTIMIZATION 1 & 2: Move SliderWithInput outside + React.memo for performance
const SliderWithInput = memo(
  ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    canvas,
    fabric,
    selectedObject,
    effectType,
    propertyKey,
  }: SliderWithInputProps) => {
    const [localValue, setLocalValue] = useState(value);
    const [inputValue, setInputValue] = useState(value.toString());
    const [isDragging, setIsDragging] = useState(false);

    // Throttling refs for smooth performance
    const throttleRef = useRef<NodeJS.Timeout | null>(null);
    const lastDirectUpdateRef = useRef<number>(0);

    // Update local state when prop value changes (but not during dragging)
    useEffect(() => {
      if (!isDragging) {
        setLocalValue(value);
        setInputValue(value.toString());
      }
    }, [value, isDragging]);

    // OPTIMIZATION 3: Direct Fabric manipulation during drag for ultra-smooth updates
    const applyDirectFabricUpdate = useCallback(
      (newValue: number) => {
        if (
          !canvas ||
          !fabric ||
          !selectedObject ||
          !effectType ||
          !propertyKey
        )
          return;

        try {
          // Create a temporary state for immediate fabric update
          const tempState = {
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowOpacity: 100,
            shadowColor: "#000000",
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
            [propertyKey]: newValue,
          };

          // Direct manipulation of fabric objects - bypass React entirely during drag
          if (
            selectedObject._isCurvedText ||
            selectedObject.type === "curved-text" ||
            (selectedObject.type === "group" && selectedObject._isCurvedText)
          ) {
            const group = selectedObject;
            const objects = group.getObjects();

            objects.forEach((obj: any) => {
              if (obj.type === "text") {
                updateFabricPropertyDirect(obj, effectType, tempState, fabric);
              }
            });
          } else if (
            selectedObject.type === "textbox" ||
            selectedObject.type === "text"
          ) {
            updateFabricPropertyDirect(
              selectedObject,
              effectType,
              tempState,
              fabric
            );
          }

          // Direct canvas render - no React involved
          canvas.renderAll();
        } catch (error) {
          console.warn("Direct fabric update failed:", error);
        }
      },
      [canvas, fabric, selectedObject, effectType, propertyKey]
    );

    // Canva-style: Immediate UI + throttled direct Fabric updates
    const handleSliderChange = useCallback(
      (newValues: number[]) => {
        const newValue = newValues[0];

        // Immediate UI update for smooth visual feedback
        setLocalValue(newValue);
        setInputValue(newValue.toString());

        if (isDragging) {
          // During drag: Direct fabric manipulation with throttling
          const now = performance.now();
          if (now - lastDirectUpdateRef.current > 16) {
            // ~60fps
            lastDirectUpdateRef.current = now;
            applyDirectFabricUpdate(newValue);
          }

          // Throttled React state update for final consistency
          if (throttleRef.current) {
            clearTimeout(throttleRef.current);
          }
          throttleRef.current = setTimeout(() => {
            onChange(newValue);
          }, 100); // Longer delay for React state
        } else {
          // Single click: immediate React update
          onChange(newValue);
        }
      },
      [isDragging, onChange, applyDirectFabricUpdate]
    );

    const handleSliderPointerDown = useCallback(() => {
      setIsDragging(true);
    }, []);

    const handleSliderPointerUp = useCallback(() => {
      setIsDragging(false);

      // Clear throttling and ensure final state sync
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
        throttleRef.current = null;
      }

      // Final React state update
      onChange(localValue);
    }, [localValue, onChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        const numVal = parseFloat(val);
        if (!isNaN(numVal) && val !== "" && val !== "-") {
          const constrainedValue = Math.min(Math.max(numVal, min), max);
          setLocalValue(constrainedValue);
          onChange(constrainedValue);
        }
      },
      [min, max, onChange]
    );

    const handleInputBlur = useCallback(() => {
      const numVal = parseFloat(inputValue);
      if (isNaN(numVal)) {
        setInputValue(localValue.toString());
      } else {
        const constrainedValue = Math.min(Math.max(numVal, min), max);
        setLocalValue(constrainedValue);
        setInputValue(constrainedValue.toString());
        onChange(constrainedValue);
      }
    }, [inputValue, localValue, min, max, onChange]);

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          const numVal = parseFloat(inputValue);
          if (!isNaN(numVal)) {
            const constrainedValue = Math.min(Math.max(numVal, min), max);
            setLocalValue(constrainedValue);
            setInputValue(constrainedValue.toString());
            onChange(constrainedValue);
          } else {
            setInputValue(localValue.toString());
          }
          e.currentTarget.blur();
        }
      },
      [inputValue, localValue, min, max, onChange]
    );

    // Cleanup
    useEffect(() => {
      return () => {
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }
      };
    }, []);

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[localValue]}
            onValueChange={handleSliderChange}
            onPointerDown={handleSliderPointerDown}
            onPointerUp={handleSliderPointerUp}
            max={max}
            min={min}
            step={step}
            className="flex-1"
          />
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={min}
            max={max}
            step={step}
            className="w-16 text-center"
          />
        </div>
      </div>
    );
  }
);

SliderWithInput.displayName = "SliderWithInput";

// Helper function for direct fabric property updates during drag
const updateFabricPropertyDirect = (
  textObject: any,
  effectType: string,
  state: any,
  fabric: any
) => {
  // Clear existing effects first
  textObject.shadow = null;
  textObject.stroke = null;
  textObject.strokeWidth = 0;

  // Restore original fill if it was made transparent
  if (textObject.fill === "transparent" && textObject._originalFill) {
    textObject.fill = textObject._originalFill;
  }

  switch (effectType) {
    case "shadow":
      const shadowOpacity = (state.shadowOpacity || 100) / 100;
      const shadowOffsetX = state.shadowOffsetX || 0;
      const shadowOffsetY = state.shadowOffsetY || 0;
      const shadowBlur = state.shadowBlur || 0;
      const shadowColor = state.shadowColor || "#000000";

      const shadowColorWithOpacity = `rgba(${parseInt(
        shadowColor.slice(1, 3),
        16
      )}, ${parseInt(shadowColor.slice(3, 5), 16)}, ${parseInt(
        shadowColor.slice(5, 7),
        16
      )}, ${shadowOpacity})`;

      textObject.shadow = new fabric.Shadow({
        color: shadowColorWithOpacity,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
      });
      break;

    case "lift":
      const liftIntensity = state.liftIntensity || 0;
      if (liftIntensity > 0.01) {
        textObject.shadow = new fabric.Shadow({
          color: "rgba(0, 0, 0, 0.3)",
          blur: liftIntensity / 2,
          offsetX: 0,
          offsetY: liftIntensity / 10,
        });
      }
      break;

    case "hollow":
      const hollowThickness = state.hollowThickness || 0;
      if (hollowThickness > 0.01) {
        // Store original fill if not already stored
        if (!textObject._originalFill) {
          textObject._originalFill = textObject.fill;
        }
        textObject.fill = "transparent";
        textObject.stroke = textObject._originalFill || "#000000";
        textObject.strokeWidth = hollowThickness;
      }
      break;

    case "splice":
      const spliceThickness = state.spliceThickness || 0;
      const spliceOffsetX = state.spliceOffsetX || 0;
      const spliceOffsetY = state.spliceOffsetY || 0;
      const spliceColor = state.spliceColor || "#000000";

      if (
        spliceThickness > 0.01 ||
        Math.abs(spliceOffsetX) > 0.01 ||
        Math.abs(spliceOffsetY) > 0.01
      ) {
        if (Math.abs(spliceOffsetX) > 0.01 || Math.abs(spliceOffsetY) > 0.01) {
          textObject.shadow = new fabric.Shadow({
            color: spliceColor,
            blur: 0,
            offsetX: spliceOffsetX,
            offsetY: spliceOffsetY,
          });
        }
        if (spliceThickness > 0.01) {
          textObject.stroke = spliceColor;
          textObject.strokeWidth = spliceThickness;
        }
      }
      break;

    case "outline":
      const outlineThickness = state.outlineThickness || 0;
      if (outlineThickness > 0.01) {
        textObject.stroke =
          textObject._originalFill || textObject.fill || "#000000";
        textObject.strokeWidth = outlineThickness;
      }
      break;

    case "echo":
      const echoOffsetX = state.echoOffsetX || 0;
      const echoOffsetY = state.echoOffsetY || 0;

      if (Math.abs(echoOffsetX) > 0.01 || Math.abs(echoOffsetY) > 0.01) {
        textObject.shadow = new fabric.Shadow({
          color: state.echoColor || "#000000",
          blur: 0,
          offsetX: echoOffsetX,
          offsetY: echoOffsetY,
        });
      }
      break;

    case "glitch":
      const glitchOffsetX = state.glitchOffsetX || 0;
      const glitchOffsetY = state.glitchOffsetY || 0;

      if (Math.abs(glitchOffsetX) > 0.01 || Math.abs(glitchOffsetY) > 0.01) {
        textObject.shadow = new fabric.Shadow({
          color: state.glitchColor1 || "#ff0000",
          blur: 0,
          offsetX: glitchOffsetX,
          offsetY: glitchOffsetY,
        });
      }
      break;

    case "neon":
      const neonIntensity = state.neonIntensity || 0;
      if (neonIntensity > 0.01) {
        textObject.shadow = new fabric.Shadow({
          color: textObject.fill || "#00ffff",
          blur: neonIntensity,
          offsetX: 0,
          offsetY: 0,
        });
      }
      break;

    case "background":
      const backgroundSpread = state.backgroundSpread || 0;
      if (backgroundSpread > 0.01) {
        textObject.shadow = new fabric.Shadow({
          color: state.backgroundColor || "#000000",
          blur: backgroundSpread,
          offsetX: 0,
          offsetY: 0,
        });
      }
      break;

    default:
      // Clear all effects for "none" or unknown effects
      break;
  }
};

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

  // Create refs to access current values without dependency issues
  const selectedEffectRef = useRef(selectedEffect);
  const selectedObjectRef = useRef(selectedObject);
  const canvasRef = useRef(canvas);
  const applyEffectWithStateRef = useRef<any>(null);
  const applyCurveEffectRef = useRef<any>(null);
  const curveUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing curve updates

  // Update refs when values change
  useEffect(() => {
    selectedEffectRef.current = selectedEffect;
  }, [selectedEffect]);

  useEffect(() => {
    selectedObjectRef.current = selectedObject;
  }, [selectedObject]);

  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);

  // Optimized state updater that immediately applies effects
  const updateEffectState = useCallback(
    (key: keyof EffectState, value: any) => {
      setEffectState((prevState) => {
        const newState = {
          ...prevState,
          [key]: value,
        };

        // Apply effects immediately with the new state
        if (key === "curveIntensity") {
          // Handle curve effects with proper debouncing to prevent multiple creations
          if (selectedObjectRef.current) {
            // Update the curve amount directly on the object for immediate feedback
            if (
              selectedObjectRef.current._isCurvedText ||
              selectedObjectRef.current.type === "curved-text" ||
              (selectedObjectRef.current.type === "group" &&
                selectedObjectRef.current._isCurvedText)
            ) {
              selectedObjectRef.current._curveAmount = value;
            }

            // Clear any pending curve updates
            if (curveUpdateTimeoutRef.current) {
              clearTimeout(curveUpdateTimeoutRef.current);
            }

            // Debounce the actual curve application to prevent multiple object creation
            curveUpdateTimeoutRef.current = setTimeout(() => {
              if (applyCurveEffectRef.current && selectedObjectRef.current) {
                applyCurveEffectRef.current(selectedObjectRef.current, value);
              }
            }, 100); // Wait 100ms after the last change before applying
          }
        } else {
          // Apply other effects immediately if an effect is selected
          if (
            selectedEffectRef.current !== "none" &&
            canvasRef.current &&
            selectedObjectRef.current
          ) {
            requestAnimationFrame(() => {
              if (applyEffectWithStateRef.current) {
                applyEffectWithStateRef.current(
                  selectedEffectRef.current,
                  newState
                );
              }
            });
          }
        }

        return newState;
      });
    },
    []
  );

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
          selectedObject.type === "curved-text" ||
          (selectedObject.type === "group" && selectedObject._isCurvedText)
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
          selectedObject.type === "curved-text" ||
          (selectedObject.type === "group" && selectedObject._isCurvedText)
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

      // Cleanup curve update timeout
      if (curveUpdateTimeoutRef.current) {
        clearTimeout(curveUpdateTimeoutRef.current);
      }
    };
  }, [canvas, selectedObject]);

  // Sync with selected object on mount and reset effects when object changes
  useEffect(() => {
    if (selectedObject) {
      // Clear any pending curve updates when object changes
      if (curveUpdateTimeoutRef.current) {
        clearTimeout(curveUpdateTimeoutRef.current);
        curveUpdateTimeoutRef.current = null;
      }

      syncFromFabricObject(selectedObject);

      // Check if this is a curved text and preserve its curve value
      let currentCurveValue = 0;
      let isCurrentlyCurved = false;

      if (
        selectedObject._isCurvedText ||
        selectedObject.type === "curved-text" ||
        (selectedObject.type === "group" && selectedObject._isCurvedText)
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

  const handleClose = () => {
    setEditorMode(null);
    onClose();
  };

  // Enhanced helper function to apply effects with complete clearing
  const applyEffectToTextObjectWithState = useCallback(
    (textObject: any, effectType: string, state: EffectState) => {
      if (!fabric) return;

      // STEP 1: Complete cleanup of ALL existing effects
      textObject.shadow = null;
      textObject.stroke = null;
      textObject.strokeWidth = 0;

      // Restore original fill if it was set to transparent
      if (textObject.fill === "transparent" && attributes.fill) {
        textObject.fill = attributes.fill;
      }

      // STEP 2: Apply new effects only if they have meaningful values
      switch (effectType) {
        case "shadow": {
          const shadowOpacity = (state.shadowOpacity || 100) / 100;
          const shadowOffsetX = state.shadowOffsetX || 0;
          const shadowOffsetY = state.shadowOffsetY || 0;
          const shadowBlur = state.shadowBlur || 0;
          const shadowColor = state.shadowColor || "#000000";

          // For shadow effect, always apply shadow (even with 0 offset/blur) to show transparency changes
          const shadowColorWithOpacity = `rgba(${parseInt(
            shadowColor.slice(1, 3),
            16
          )}, ${parseInt(shadowColor.slice(3, 5), 16)}, ${parseInt(
            shadowColor.slice(5, 7),
            16
          )}, ${shadowOpacity})`;

          textObject.shadow = new fabric.Shadow({
            color: shadowColorWithOpacity,
            blur: shadowBlur,
            offsetX: shadowOffsetX,
            offsetY: shadowOffsetY,
          });
          break;
        }

        case "lift": {
          const liftIntensity = state.liftIntensity || 0;
          if (liftIntensity > 0.01) {
            textObject.shadow = new fabric.Shadow({
              color: "rgba(0, 0, 0, 0.3)",
              blur: liftIntensity / 2,
              offsetX: 0,
              offsetY: liftIntensity / 10,
            });
          }
          break;
        }

        case "hollow": {
          const hollowThickness = state.hollowThickness || 0;
          if (hollowThickness > 0.01) {
            textObject.fill = "transparent";
            textObject.stroke = attributes.fill || "#000000";
            textObject.strokeWidth = hollowThickness;
          }
          break;
        }

        case "splice": {
          const spliceThickness = state.spliceThickness || 0;
          const spliceOffsetX = state.spliceOffsetX || 0;
          const spliceOffsetY = state.spliceOffsetY || 0;
          const spliceColor = state.spliceColor || "#000000";

          // Apply splice effect if there's meaningful values
          if (
            spliceThickness > 0.01 ||
            Math.abs(spliceOffsetX) > 0.01 ||
            Math.abs(spliceOffsetY) > 0.01
          ) {
            if (
              Math.abs(spliceOffsetX) > 0.01 ||
              Math.abs(spliceOffsetY) > 0.01
            ) {
              textObject.shadow = new fabric.Shadow({
                color: spliceColor,
                blur: 0,
                offsetX: spliceOffsetX,
                offsetY: spliceOffsetY,
              });
            }
            if (spliceThickness > 0.01) {
              textObject.stroke = spliceColor;
              textObject.strokeWidth = spliceThickness;
            }
          }
          break;
        }

        case "outline": {
          const outlineThickness = state.outlineThickness || 0;
          if (outlineThickness > 0.01) {
            textObject.stroke = attributes.fill || "#000000";
            textObject.strokeWidth = outlineThickness;
          }
          break;
        }

        case "echo": {
          const echoOffsetX = state.echoOffsetX || 0;
          const echoOffsetY = state.echoOffsetY || 0;

          if (Math.abs(echoOffsetX) > 0.01 || Math.abs(echoOffsetY) > 0.01) {
            textObject.shadow = new fabric.Shadow({
              color: state.echoColor || "#000000",
              blur: 0,
              offsetX: echoOffsetX,
              offsetY: echoOffsetY,
            });
          }
          break;
        }

        case "glitch": {
          const glitchOffsetX = state.glitchOffsetX || 0;
          const glitchOffsetY = state.glitchOffsetY || 0;

          if (
            Math.abs(glitchOffsetX) > 0.01 ||
            Math.abs(glitchOffsetY) > 0.01
          ) {
            textObject.shadow = new fabric.Shadow({
              color: state.glitchColor1 || "#ff0000",
              blur: 0,
              offsetX: glitchOffsetX,
              offsetY: glitchOffsetY,
            });
          }
          break;
        }

        case "neon": {
          const neonIntensity = state.neonIntensity || 0;
          if (neonIntensity > 0.01) {
            textObject.shadow = new fabric.Shadow({
              color: attributes.fill || "#00ffff",
              blur: neonIntensity,
              offsetX: 0,
              offsetY: 0,
            });
          }
          break;
        }

        case "background": {
          const backgroundSpread = state.backgroundSpread || 0;
          if (backgroundSpread > 0.01) {
            textObject.shadow = new fabric.Shadow({
              color: state.backgroundColor || "#000000",
              blur: backgroundSpread,
              offsetX: 0,
              offsetY: 0,
            });
          }
          break;
        }

        case "none":
        default:
          // All effects already cleared above
          break;
      }
    },
    [fabric, attributes.fill]
  );

  // Helper function that applies effects with a given state
  const applyEffectWithState = useCallback(
    (effectType: string, state: EffectState) => {
      if (!selectedObject || !canvas || !fabric) return;

      // If it's a curved text group, apply effects to individual characters
      if (
        selectedObject._isCurvedText ||
        selectedObject.type === "curved-text" ||
        (selectedObject.type === "group" && selectedObject._isCurvedText)
      ) {
        const group = selectedObject;
        const objects = group.getObjects();

        objects.forEach((obj: any) => {
          if (obj.type === "text") {
            applyEffectToTextObjectWithState(obj, effectType, state);
          }
        });
      } else {
        // Apply effect to regular text object
        applyEffectToTextObjectWithState(selectedObject, effectType, state);
      }

      // Force canvas update after applying effects
      canvas.renderAll();
    },
    [selectedObject, canvas, fabric, applyEffectToTextObjectWithState]
  );

  // Assign to ref
  applyEffectWithStateRef.current = applyEffectWithState;

  // Function to apply proper arc curve effect like Canva
  const applyCurveEffect = useCallback(
    (textObject: any, curveAmount: number) => {
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
        if (
          textObject._isCurvedText ||
          textObject.type === "curved-text" ||
          (textObject.type === "group" && textObject._isCurvedText)
        ) {
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

          // Remove the old curved text object
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

      // Always remove the existing object before creating new curved text
      canvas.remove(textObject);

      // Create individual character objects positioned along the arc
      const characters: string[] = originalText.split("");
      const charObjects: any[] = [];
      const nonSpaceChars = characters.filter((c: string) => c.trim() !== "");

      // Calculate character spacing to maintain proper text flow
      const charSpacing =
        actualTextWidth / Math.max(nonSpaceChars.length - 1, 1);

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

        // Add metadata to identify this as a curved text - use standard fabric properties
        // to avoid serialization issues
        Object.defineProperty(curvedTextGroup, "_isCurvedText", {
          value: true,
          enumerable: false, // Don't include in serialization
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_originalText", {
          value: originalText,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_curveAmount", {
          value: curveAmount,
          enumerable: false,
          configurable: true,
          writable: true, // Make it writable so we can update it
        });
        Object.defineProperty(curvedTextGroup, "_fontSize", {
          value: fontSize,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_fontFamily", {
          value: fontFamily,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_fill", {
          value: fill,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_stroke", {
          value: stroke,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        Object.defineProperty(curvedTextGroup, "_strokeWidth", {
          value: strokeWidth,
          enumerable: false,
          configurable: true,
          writable: true,
        });

        // Set type to a standard fabric type to avoid serialization issues
        curvedTextGroup.type = "group";

        // Add to canvas and make it active
        canvas.add(curvedTextGroup);
        canvas.setActiveObject(curvedTextGroup);
        canvas.renderAll();

        // Fire selection events with a longer delay to ensure canvas is stable
        setTimeout(() => {
          canvas.fire("selection:cleared");
          canvas.fire("selection:created", {
            target: curvedTextGroup,
            selected: [curvedTextGroup],
          });
          canvas.fire("object:selected", { target: curvedTextGroup });
        }, 50); // Increased delay
      }
    },
    [fabric, canvas]
  );

  // Assign to ref
  applyCurveEffectRef.current = applyCurveEffect;

  // Don't render if no text object is selected
  if (
    !selectedObject ||
    (selectedObject.type !== "textbox" &&
      selectedObject.type !== "text" &&
      selectedObject.type !== "curved-text" &&
      !(selectedObject.type === "group" && selectedObject._isCurvedText) &&
      !selectedObject._isCurvedText)
  ) {
    return (
      <div className="w-full h-full bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
          <h3 className="text-lg font-semibold text-foreground">Effects</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
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

  const applyShape = (shapeType: string) => {
    if (!selectedObject || !canvas || !fabric) return;

    // Only apply shape effects to text objects or curved text groups
    if (
      selectedObject.type !== "textbox" &&
      selectedObject.type !== "text" &&
      selectedObject.type !== "curved-text" &&
      !(selectedObject.type === "group" && selectedObject._isCurvedText) &&
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
          selectedObject.type === "curved-text" ||
          (selectedObject.type === "group" && selectedObject._isCurvedText)
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

          // Fire selection events with longer delay
          setTimeout(() => {
            canvas.fire("selection:cleared");
            canvas.fire("selection:created", {
              target: newTextObject,
              selected: [newTextObject],
            });
            canvas.fire("object:selected", { target: newTextObject });
          }, 50); // Increased delay
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

    // Create new state with default values for the selected effect
    const newEffectState = {
      ...effectState,
      type: effectType,
    };

    // Apply default values based on effect type to show immediate visual feedback
    switch (effectType) {
      case "shadow":
        if (
          effectState.shadowOffsetX === 0 &&
          effectState.shadowOffsetY === 0 &&
          effectState.shadowBlur === 0
        ) {
          newEffectState.shadowOffsetX = 5;
          newEffectState.shadowOffsetY = 5;
          newEffectState.shadowBlur = 10;
          newEffectState.shadowOpacity = 100;
        }
        break;
      case "lift":
        if (effectState.liftIntensity === 0) {
          newEffectState.liftIntensity = 20;
        }
        break;
      case "hollow":
        if (effectState.hollowThickness === 0) {
          newEffectState.hollowThickness = 2;
        }
        break;
      case "splice":
        if (
          effectState.spliceThickness === 0 &&
          effectState.spliceOffsetX === 0 &&
          effectState.spliceOffsetY === 0
        ) {
          newEffectState.spliceThickness = 2;
          newEffectState.spliceOffsetX = 3;
          newEffectState.spliceOffsetY = 3;
        }
        break;
      case "outline":
        if (effectState.outlineThickness === 0) {
          newEffectState.outlineThickness = 2;
        }
        break;
      case "echo":
        if (effectState.echoOffsetX === 0 && effectState.echoOffsetY === 0) {
          newEffectState.echoOffsetX = 5;
          newEffectState.echoOffsetY = 5;
        }
        break;
      case "glitch":
        if (
          effectState.glitchOffsetX === 0 &&
          effectState.glitchOffsetY === 0
        ) {
          newEffectState.glitchOffsetX = 3;
          newEffectState.glitchOffsetY = 3;
        }
        break;
      case "neon":
        if (effectState.neonIntensity === 0) {
          newEffectState.neonIntensity = 20;
        }
        break;
      case "background":
        if (effectState.backgroundSpread === 0) {
          newEffectState.backgroundSpread = 10;
        }
        break;
    }

    setEffectState(newEffectState);

    // Apply the effect immediately with the new state
    requestAnimationFrame(() => {
      if (applyEffectWithStateRef.current) {
        applyEffectWithStateRef.current(effectType, newEffectState);
      }
    });
  };

  const handleShapeSelect = (shapeType: string) => {
    setSelectedShape(shapeType);

    if (shapeType === "curve") {
      // Set default curve value if not already set
      const newCurveValue =
        effectState.curveIntensity === 0 ? 25 : effectState.curveIntensity;

      const newState = {
        ...effectState,
        curveIntensity: newCurveValue,
      };

      setEffectState(newState);

      // Apply curve effect immediately
      requestAnimationFrame(() => {
        if (applyCurveEffectRef.current && selectedObject) {
          applyCurveEffectRef.current(selectedObject, newCurveValue);
        }
      });
    } else {
      // Reset curve to 0 for "none" shape
      const newState = {
        ...effectState,
        curveIntensity: 0,
      };

      setEffectState(newState);
      applyShape(shapeType);
    }
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
        canvas={canvas}
        fabric={fabric}
        selectedObject={selectedObject}
        effectType="shadow"
        propertyKey="shadowOffsetX"
      />

      {/* Direction */}
      <SliderWithInput
        label="Direction"
        value={effectState.shadowOffsetY || 0}
        onChange={(value) => updateEffectState("shadowOffsetY", value)}
        min={-50}
        max={50}
        canvas={canvas}
        fabric={fabric}
        selectedObject={selectedObject}
        effectType="shadow"
        propertyKey="shadowOffsetY"
      />

      {/* Blur */}
      <SliderWithInput
        label="Blur"
        value={effectState.shadowBlur || 0}
        onChange={(value) => updateEffectState("shadowBlur", value)}
        min={0}
        max={50}
        canvas={canvas}
        fabric={fabric}
        selectedObject={selectedObject}
        effectType="shadow"
        propertyKey="shadowBlur"
      />

      {/* Transparency */}
      <SliderWithInput
        label="Transparency"
        value={effectState.shadowOpacity || 100}
        onChange={(value) => updateEffectState("shadowOpacity", value)}
        min={0}
        max={100}
        canvas={canvas}
        fabric={fabric}
        selectedObject={selectedObject}
        effectType="shadow"
        propertyKey="shadowOpacity"
      />

      {/* Color */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">Color</Label>
        <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
        <Label className="text-sm font-medium text-foreground">Color</Label>
        <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
        <Label className="text-sm font-medium text-foreground">Color</Label>
        <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
        <Label className="text-sm font-medium text-foreground">Colors</Label>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
          <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
        <Label className="text-sm font-medium text-foreground">Color</Label>
        <div className="w-8 h-8 rounded-full border border-border overflow-hidden relative">
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
    <div className="w-full h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground">Effects</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>
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
                <Button
                  variant={selectedEffect === "none" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("none")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "none"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span className="text-lg font-bold text-foreground">
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">None</span>
                </Button>

                {/* Shadow */}
                <Button
                  variant={selectedEffect === "shadow" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("shadow")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "shadow"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded relative overflow-hidden">
                    <span className="text-lg font-bold text-foreground relative z-10">
                      Ag
                    </span>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: "translate(2px, 2px)",
                        opacity: 0.4,
                      }}
                    >
                      <span className="text-lg font-bold text-muted-foreground">
                        Ag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs">Shadow</span>
                </Button>

                {/* Lift */}
                <Button
                  variant={selectedEffect === "lift" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("lift")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "lift"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span
                      className="text-lg font-bold text-foreground"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">Lift</span>
                </Button>
              </div>

              {/* Shadow Controls */}
              {selectedEffect === "shadow" && (
                <Card className="p-4">{renderShadowControls()}</Card>
              )}

              {/* Lift Controls */}
              {selectedEffect === "lift" && (
                <Card className="p-4">{renderLiftControls()}</Card>
              )}

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Hollow */}
                <Button
                  variant={selectedEffect === "hollow" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("hollow")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "hollow"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded">
                    <span
                      className="text-lg font-bold text-transparent"
                      style={{ WebkitTextStroke: "2px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">Hollow</span>
                </Button>

                {/* Splice */}
                <Button
                  variant={selectedEffect === "splice" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("splice")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "splice"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span
                      className="text-lg font-bold text-foreground"
                      style={{ WebkitTextStroke: "1px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">Splice</span>
                </Button>

                {/* Outline */}
                <Button
                  variant={selectedEffect === "outline" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("outline")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "outline"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span
                      className="text-lg font-bold text-foreground"
                      style={{ WebkitTextStroke: "1px #374151" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">Outline</span>
                </Button>
              </div>

              {/* Hollow Controls */}
              {selectedEffect === "hollow" && (
                <Card className="p-4">{renderHollowControls()}</Card>
              )}

              {/* Splice Controls */}
              {selectedEffect === "splice" && (
                <Card className="p-4">{renderSpliceControls()}</Card>
              )}

              {/* Outline Controls */}
              {selectedEffect === "outline" && (
                <Card className="p-4">{renderOutlineControls()}</Card>
              )}

              {/* Row 3 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Echo */}
                <Button
                  variant={selectedEffect === "echo" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("echo")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "echo"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded relative">
                    <span className="text-lg font-bold text-foreground relative z-10">
                      Ag
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center transform translate-x-0.5 translate-y-0.5">
                      <span className="text-lg font-bold text-muted-foreground opacity-60">
                        Ag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs">Echo</span>
                </Button>

                {/* Glitch */}
                <Button
                  variant={selectedEffect === "glitch" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("glitch")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "glitch"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded relative overflow-hidden">
                    <span className="text-lg font-bold text-foreground relative z-20">
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
                  <span className="text-xs">Glitch</span>
                </Button>

                {/* Neon */}
                <Button
                  variant={selectedEffect === "neon" ? "default" : "outline"}
                  onClick={() => handleEffectSelect("neon")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "neon"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-100 rounded">
                    <span
                      className="text-lg font-bold text-pink-500"
                      style={{ textShadow: "0 0 10px currentColor" }}
                    >
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">Neon</span>
                </Button>
              </div>

              {/* Echo Controls */}
              {selectedEffect === "echo" && (
                <Card className="p-4">{renderEchoControls()}</Card>
              )}

              {/* Glitch Controls */}
              {selectedEffect === "glitch" && (
                <Card className="p-4">{renderGlitchControls()}</Card>
              )}

              {/* Neon Controls */}
              {selectedEffect === "neon" && (
                <Card className="p-4">{renderNeonControls()}</Card>
              )}

              {/* Row 4 */}
              <div className="grid grid-cols-3 gap-3">
                {/* Background */}
                <Button
                  variant={
                    selectedEffect === "background" ? "default" : "outline"
                  }
                  onClick={() => handleEffectSelect("background")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedEffect === "background"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-gray-800 rounded">
                    <span className="text-lg font-bold text-white">Ag</span>
                  </div>
                  <span className="text-xs">Background</span>
                </Button>

                {/* Empty placeholders to maintain grid */}
                <div></div>
                <div></div>
              </div>

              {/* Background Controls */}
              {selectedEffect === "background" && (
                <Card className="p-4">{renderBackgroundControls()}</Card>
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
                <Button
                  variant={selectedShape === "none" ? "default" : "outline"}
                  onClick={() => handleShapeSelect("none")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedShape === "none"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span className="text-lg font-bold text-foreground">
                      Ag
                    </span>
                  </div>
                  <span className="text-xs">None</span>
                </Button>

                {/* Curve */}
                <Button
                  variant={selectedShape === "curve" ? "default" : "outline"}
                  onClick={() => handleShapeSelect("curve")}
                  className={`p-4 h-auto flex-col space-y-2 ${
                    selectedShape === "curve"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : ""
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center bg-muted rounded">
                    <span className="text-lg font-bold text-foreground">
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
                  <span className="text-xs">Curve</span>
                </Button>
              </div>

              {/* Curve Controls */}
              {selectedShape === "curve" && (
                <Card className="p-4">{renderCurveControls()}</Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectsLeftPanel;
