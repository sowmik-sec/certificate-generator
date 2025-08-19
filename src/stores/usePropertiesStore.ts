/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface ObjectAttributes {
  // Text properties
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  linethrough: boolean;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
  listType: "none" | "bullet" | "number";

  // Advanced text properties
  textPosition: "superscript" | "normal" | "subscript";
  kerning: boolean;
  ligatures: boolean;

  // Color properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  backgroundColor: string;

  // General properties
  opacity: number;
  angle: number;

  // Position properties
  left: number;
  top: number;

  // Shape properties
  width: number;
  height: number;
  radius: number;
  rx: number;
  ry: number;
}

interface PropertiesState {
  // Current object attributes
  attributes: ObjectAttributes;
  setAttributes: (attributes: Partial<ObjectAttributes>) => void;
  updateAttribute: (key: keyof ObjectAttributes, value: any) => void;

  // Object type information
  selectedObjectType: string | null;
  setSelectedObjectType: (type: string | null) => void;

  // UI state for properties panel
  isPropertiesPanelExpanded: boolean;
  setIsPropertiesPanelExpanded: (expanded: boolean) => void;

  // Helper functions
  syncFromFabricObject: (fabricObject: any) => void;
  applyToFabricObject: (
    fabricObject: any,
    canvas: any,
    property: keyof ObjectAttributes,
    value: any
  ) => void;
  resetAttributes: () => void;

  // Object type helpers
  getObjectTypeName: () => string;
  isTextObject: () => boolean;
  isShapeObject: () => boolean;
  isLineObject: () => boolean;
  isGroupObject: () => boolean;
  isImageObject: () => boolean;
}

const defaultAttributes: ObjectAttributes = {
  text: "",
  fontFamily: "Arial",
  fontSize: 40,
  fontWeight: "normal",
  fontStyle: "normal",
  underline: false,
  linethrough: false,
  textAlign: "left",
  lineHeight: 1.16,
  charSpacing: 0,
  listType: "none",
  textPosition: "normal",
  kerning: true,
  ligatures: false,
  fill: "#000000",
  stroke: "#333333",
  strokeWidth: 4,
  backgroundColor: "#ffffff",
  opacity: 1,
  angle: 0,
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  radius: 50,
  rx: 50,
  ry: 30,
};

export const usePropertiesStore = create<PropertiesState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    attributes: defaultAttributes,
    selectedObjectType: null,
    isPropertiesPanelExpanded: true,

    // Actions
    setAttributes: (newAttributes) =>
      set((state) => ({
        attributes: { ...state.attributes, ...newAttributes },
      })),

    updateAttribute: (key, value) =>
      set((state) => ({
        attributes: { ...state.attributes, [key]: value },
      })),

    setSelectedObjectType: (type) => set({ selectedObjectType: type }),

    setIsPropertiesPanelExpanded: (expanded) =>
      set({ isPropertiesPanelExpanded: expanded }),

    // Sync attributes from fabric object
    syncFromFabricObject: (fabricObject: any) => {
      if (!fabricObject) {
        set({ selectedObjectType: null, attributes: defaultAttributes });
        return;
      }

      // Helper function to convert transparent values to valid hex colors for color inputs
      const normalizeColorForInput = (color: any, fallback: string): string => {
        if (typeof color !== "string") return fallback;
        if (color === "transparent" || color === "") return fallback;
        if (color.startsWith("#")) return color;
        // Handle other color formats if needed
        return color;
      };

      const newAttributes: Partial<ObjectAttributes> = {
        // Text properties
        text: fabricObject.text || "",
        fontFamily: fabricObject.fontFamily || "Arial",
        fontSize: fabricObject.fontSize || 40,
        fontWeight: fabricObject.fontWeight || "normal",
        fontStyle: fabricObject.fontStyle || "normal",
        underline: fabricObject.underline || false,
        linethrough: fabricObject.linethrough || false,
        textAlign: fabricObject.textAlign || "left",
        lineHeight: fabricObject.lineHeight || 1.16,
        charSpacing: fabricObject.charSpacing || 0,
        listType: fabricObject.listType || "none",
        textPosition: fabricObject.textPosition || "normal",
        kerning: fabricObject.kerning ?? true,
        ligatures: fabricObject.ligatures ?? false,

        // Color properties - normalize transparent values for color inputs
        fill: normalizeColorForInput(fabricObject.fill, "#000000"),
        stroke: normalizeColorForInput(fabricObject.stroke, "#333333"),
        strokeWidth: fabricObject.strokeWidth || 4,
        backgroundColor: normalizeColorForInput(
          fabricObject.backgroundColor,
          "#ffffff"
        ),

        // General properties
        opacity: fabricObject.opacity ?? 1,
        angle: fabricObject.angle || 0,

        // Position properties
        left: fabricObject.left || 0,
        top: fabricObject.top || 0,

        // Shape properties
        width: fabricObject.width || 100,
        height: fabricObject.height || 100,
        radius: fabricObject.radius || 50,
        rx: fabricObject.rx || 50,
        ry: fabricObject.ry || 30,
      };

      set({
        attributes: { ...defaultAttributes, ...newAttributes },
        selectedObjectType: fabricObject.type || null,
      });
    },

    // Apply property change to fabric object
    applyToFabricObject: (
      fabricObject: any,
      canvas: any,
      property: keyof ObjectAttributes,
      value: any
    ) => {
      if (!canvas || !fabricObject) return;

      // Update local state
      get().updateAttribute(property, value);

      // Handle special cases for color properties
      let fabricValue = value;
      if (["fill", "stroke", "backgroundColor"].includes(property as string)) {
        // Allow transparent for fabric objects but ensure it's properly handled
        if (value === "transparent" || value === "") {
          fabricValue = "transparent";
        }
      }

      if (fabricObject.type === "group") {
        // Handle grouped objects
        const applyToGroupObjects = (obj: any) => {
          if (property === "stroke") {
            obj.set("stroke", fabricValue);
            if (obj.type === "triangle") obj.set("fill", fabricValue);
          } else if (property === "fill" && obj.type === "textbox") {
            obj.set("fill", fabricValue);
          } else if (property === "fontFamily" && obj.type === "textbox") {
            obj.set("fontFamily", fabricValue);
          } else if (property === "fontSize" && obj.type === "textbox") {
            obj.set("fontSize", fabricValue);
          } else if (property === "fontWeight" && obj.type === "textbox") {
            obj.set("fontWeight", fabricValue);
          } else if (property === "fontStyle" && obj.type === "textbox") {
            obj.set("fontStyle", fabricValue);
          } else if (property === "underline" && obj.type === "textbox") {
            obj.set("underline", fabricValue);
          } else if (property === "linethrough" && obj.type === "textbox") {
            obj.set("linethrough", fabricValue);
          } else if (property === "textAlign" && obj.type === "textbox") {
            obj.set("textAlign", fabricValue);
          } else if (["opacity", "angle"].includes(property as string)) {
            obj.set(property, fabricValue);
          }
        };

        if (
          "forEachObject" in fabricObject &&
          typeof (fabricObject as any).forEachObject === "function"
        ) {
          (fabricObject as any).forEachObject(applyToGroupObjects);
        } else if (Array.isArray((fabricObject as any)._objects)) {
          (fabricObject as any)._objects.forEach(applyToGroupObjects);
        }
      } else {
        // Handle special text properties
        if (property === "textPosition") {
          // Apply text position styling properly
          if (
            fabricObject.type === "textbox" ||
            fabricObject.type === "i-text"
          ) {
            // Store the original font size if not stored
            if (!fabricObject.originalFontSize) {
              fabricObject.originalFontSize = fabricObject.fontSize;
            }

            const originalSize = fabricObject.originalFontSize;
            if (value === "superscript") {
              fabricObject.set({
                fontSize: originalSize * 0.7,
                deltaY: -originalSize * 0.3,
              });
            } else if (value === "subscript") {
              fabricObject.set({
                fontSize: originalSize * 0.7,
                deltaY: originalSize * 0.2,
              });
            } else {
              // normal position
              fabricObject.set({
                fontSize: originalSize,
                deltaY: 0,
              });
            }
          }
        } else if (property === "kerning") {
          // Apply kerning - adjust character spacing for better visual balance
          if (
            fabricObject.type === "textbox" ||
            fabricObject.type === "i-text"
          ) {
            // Store original char spacing if not stored
            if (fabricObject.originalCharSpacing === undefined) {
              fabricObject.originalCharSpacing = fabricObject.charSpacing || 0;
            }

            const baseSpacing = fabricObject.originalCharSpacing;
            // Kerning adjusts spacing slightly for better visual balance
            fabricObject.set(
              "charSpacing",
              value ? baseSpacing - 20 : baseSpacing
            );
          }
        } else if (property === "ligatures") {
          // Apply ligatures - visual typography enhancement
          if (
            fabricObject.type === "textbox" ||
            fabricObject.type === "i-text"
          ) {
            // Ligatures in typography combine characters like "fi" -> "ﬁ"
            // Since Fabric.js doesn't have native ligature support, we'll use font variant
            fabricObject.set("fontVariant", value ? "small-caps" : "normal");
          }
        } else {
          fabricObject.set(property, fabricValue);
        }
      }

      canvas.renderAll();
    },

    // Reset to defaults
    resetAttributes: () =>
      set({ attributes: defaultAttributes, selectedObjectType: null }),

    // Helper functions
    getObjectTypeName: () => {
      const type = get().selectedObjectType;
      if (!type) return "Object";

      const isText = type === "textbox" || type === "text";
      const isLine = type === "line";
      const isGroup = type === "group";
      const isImage = type === "image";

      if (isText) return "Text";
      if (isImage) return "Image";
      if (isLine) return "Line";
      if (isGroup) return "Group";
      if (type === "circle") return "Circle";
      if (type === "rect") return "Rectangle";
      if (type === "triangle") return "Triangle";
      if (type === "ellipse") return "Ellipse";
      if (type === "path") return "Shape";
      return "Object";
    },

    isTextObject: () => {
      const type = get().selectedObjectType;
      return type === "textbox" || type === "text";
    },

    isShapeObject: () => {
      const type = get().selectedObjectType;
      return ["rect", "circle", "triangle", "ellipse", "path"].includes(
        type || ""
      );
    },

    isLineObject: () => get().selectedObjectType === "line",

    isGroupObject: () => get().selectedObjectType === "group",

    isImageObject: () => get().selectedObjectType === "image",
  }))
);
