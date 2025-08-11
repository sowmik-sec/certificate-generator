/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useCanvasText = (
  canvas: any,
  fabric: any,
  saveToHistory: () => void
) => {
  const addText = useCallback(
    (text: string, options: any) => {
      if (!canvas || !fabric) return;

      // Convert letterSpacing to charSpacing for Fabric.js
      const fabricOptions = { ...options };
      if (fabricOptions.letterSpacing !== undefined) {
        fabricOptions.charSpacing = fabricOptions.letterSpacing * 50; // Fabric.js uses different scale
        delete fabricOptions.letterSpacing;
      }

      // Handle underline
      if (fabricOptions.underline) {
        fabricOptions.underline = true;
        delete fabricOptions.underline;
      }

      // Handle text transform (apply to text directly since Fabric.js doesn't have this CSS property)
      let processedText = text;
      if (fabricOptions.textTransform) {
        switch (fabricOptions.textTransform) {
          case "uppercase":
            processedText = text.toUpperCase();
            break;
          case "lowercase":
            processedText = text.toLowerCase();
            break;
          case "capitalize":
            processedText = text.replace(
              /\w\S*/g,
              (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
        }
        delete fabricOptions.textTransform;
      }

      // Handle shadow
      if (fabricOptions.shadow) {
        fabricOptions.shadow = "rgba(0,0,0,0.3) 2px 2px 4px";
        delete fabricOptions.shadow;
      }

      // Handle background color
      if (fabricOptions.backgroundColor) {
        fabricOptions.backgroundColor = fabricOptions.backgroundColor;
      }

      const textObject = new fabric.Textbox(processedText, {
        left: 150,
        top: 200,
        width: 400,
        fontFamily: "Arial",
        fill: "#000000",
        lineHeight: 1.2,
        id: `text-${Date.now()}`, // Add unique ID
        ...fabricOptions,
      });
      canvas.add(textObject);
      canvas.setActiveObject(textObject);
      canvas.renderAll();
      saveToHistory(); // Save state after adding text
    },
    [canvas, fabric, saveToHistory]
  );

  const addHeading = useCallback(
    (customOptions: object = {}) =>
      addText("Add a heading", {
        fontSize: 88,
        fontWeight: "bold",
        textAlign: "center",
        ...customOptions,
      }),
    [addText]
  );

  const addSubheading = useCallback(
    (customOptions: object = {}) =>
      addText("Add a subheading", {
        fontSize: 44,
        fontWeight: "600",
        textAlign: "center",
        ...customOptions,
      }),
    [addText]
  );

  const addBodyText = useCallback(
    (customOptions: object = {}) =>
      addText("Add a little bit of body text", {
        fontSize: 24,
        fontWeight: "normal",
        textAlign: "left",
        ...customOptions,
      }),
    [addText]
  );

  return {
    addText,
    addHeading,
    addSubheading,
    addBodyText,
  };
};
