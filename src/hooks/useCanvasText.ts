/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useCanvasText = (canvas: any, fabric: any) => {
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

      const textbox = new fabric.Textbox(processedText, {
        left: 200,
        top: 150,
        width: 300,
        fontSize: 20,
        fill: "#333",
        fontFamily: "Arial",
        editable: true,
        splitByGrapheme: false,
        // Enhanced properties for better stability
        cornerStyle: "circle",
        cornerSize: 8,
        transparentCorners: false,
        borderColor: "#1976d2",
        cornerColor: "#1976d2",
        hasRotatingPoint: true,
        centeredRotation: true,
        ...fabricOptions,
      });

      // Initialize styles object to prevent removeStyleFromTo errors
      if (!textbox.styles) {
        textbox.styles = {};
      }

      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      textbox.setCoords();
      canvas.renderAll();

      return textbox;
    },
    [canvas, fabric]
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
