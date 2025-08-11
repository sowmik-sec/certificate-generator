/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import { CanvasSize } from "@/components/canvas-size-panel";

export const useTemplateLoader = (
  canvas: any,
  canvasSize: CanvasSize,
  saveToHistory: () => void
) => {
  const loadTemplate = useCallback(
    (templateJson: any) => {
      if (!canvas) return;

      // Template original dimensions (what templates were designed for)
      const originalWidth = 800;
      const originalHeight = 566;

      // Current canvas dimensions
      const currentWidth = canvasSize.width;
      const currentHeight = canvasSize.height;

      // Check if canvas size matches template size
      const isSameDimensions =
        currentWidth === originalWidth && currentHeight === originalHeight;

      if (isSameDimensions) {
        // Load template as-is if dimensions match
        canvas.loadFromJSON(templateJson, () => {
          canvas.renderAll();
          saveToHistory();
        });
        return;
      }

      // Calculate scale factors for different canvas size
      const scaleX = currentWidth / originalWidth;
      const scaleY = currentHeight / originalHeight;

      // For maintaining aspect ratio in extreme cases, use uniform scaling
      const aspectRatioChange = Math.abs(
        currentWidth / currentHeight - originalWidth / originalHeight
      );
      const useUniformScaling = aspectRatioChange > 0.3; // If aspect ratio changes significantly
      const uniformScale = Math.min(scaleX, scaleY);

      // Create a scaled copy of the template
      const scaledTemplate = {
        ...templateJson,
        objects: templateJson.objects.map((obj: any) => {
          const scaledObj = { ...obj };

          // Choose scaling strategy
          const effectiveScaleX = useUniformScaling ? uniformScale : scaleX;
          const effectiveScaleY = useUniformScaling ? uniformScale : scaleY;

          // Scale position and dimensions
          if (scaledObj.left !== undefined) {
            scaledObj.left *= effectiveScaleX;
            // Center objects horizontally if using uniform scaling and canvas is wider
            if (useUniformScaling && scaleX > scaleY) {
              scaledObj.left +=
                (currentWidth - originalWidth * uniformScale) / 2;
            }
          }
          if (scaledObj.top !== undefined) {
            scaledObj.top *= effectiveScaleY;
            // Center objects vertically if using uniform scaling and canvas is taller
            if (useUniformScaling && scaleY > scaleX) {
              scaledObj.top +=
                (currentHeight - originalHeight * uniformScale) / 2;
            }
          }
          if (scaledObj.width !== undefined) scaledObj.width *= effectiveScaleX;
          if (scaledObj.height !== undefined)
            scaledObj.height *= effectiveScaleY;

          // Scale font size for text objects
          if (scaledObj.fontSize !== undefined) {
            scaledObj.fontSize *= uniformScale; // Always use uniform scale for text
          }

          // Scale stroke width
          if (scaledObj.strokeWidth !== undefined) {
            scaledObj.strokeWidth *= uniformScale;
          }

          // For textbox objects, also scale width appropriately
          if (scaledObj.type === "textbox" && scaledObj.width !== undefined) {
            scaledObj.width *= effectiveScaleX;
          }

          return scaledObj;
        }),
      };

      canvas.loadFromJSON(scaledTemplate, () => {
        canvas.renderAll();
        saveToHistory();
      });
    },
    [canvas, canvasSize, saveToHistory]
  );

  const handleBackgroundImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result;
        if (typeof data === "string") {
          const fabric = (window as any).fabric;
          if (fabric) {
            fabric.Image.fromURL(data, (img: any) => {
              canvas.clear();
              canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height,
              });
            });
          }
        }
      };
      reader.readAsDataURL(file);
      if (e.target) e.target.value = "";
    },
    [canvas]
  );

  return {
    loadTemplate,
    handleBackgroundImageUpload,
  };
};
