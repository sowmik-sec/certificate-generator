/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface ObjectAttributes {
  // Text properties
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  lineHeight: number;
  charSpacing: number;

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
  applyToFabricObject: (fabricObject: any, canvas: any, property: keyof ObjectAttributes, value: any) => void;
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
  text: '',
  fontFamily: 'Arial',
  fontSize: 40,
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  textAlign: 'left',
  lineHeight: 1.16,
  charSpacing: 0,
  fill: '#000000',
  stroke: '#333333',
  strokeWidth: 4,
  backgroundColor: 'transparent',
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

      const newAttributes: Partial<ObjectAttributes> = {
        // Text properties
        text: fabricObject.text || '',
        fontFamily: fabricObject.fontFamily || 'Arial',
        fontSize: fabricObject.fontSize || 40,
        fontWeight: fabricObject.fontWeight || 'normal',
        fontStyle: fabricObject.fontStyle || 'normal',
        underline: fabricObject.underline || false,
        textAlign: fabricObject.textAlign || 'left',
        lineHeight: fabricObject.lineHeight || 1.16,
        charSpacing: fabricObject.charSpacing || 0,

        // Color properties
        fill: typeof fabricObject.fill === 'string' ? fabricObject.fill : '#000000',
        stroke: typeof fabricObject.stroke === 'string' ? fabricObject.stroke : '#333333',
        strokeWidth: fabricObject.strokeWidth || 4,
        backgroundColor: fabricObject.backgroundColor || 'transparent',

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
    applyToFabricObject: (fabricObject: any, canvas: any, property: keyof ObjectAttributes, value: any) => {
      if (!canvas || !fabricObject) return;

      // Update local state
      get().updateAttribute(property, value);

      if (fabricObject.type === 'group') {
        // Handle grouped objects
        const applyToGroupObjects = (obj: any) => {
          if (property === 'stroke') {
            obj.set('stroke', value);
            if (obj.type === 'triangle') obj.set('fill', value);
          } else if (property === 'fill' && obj.type === 'textbox') {
            obj.set('fill', value);
          } else if (property === 'fontFamily' && obj.type === 'textbox') {
            obj.set('fontFamily', value);
          } else if (property === 'fontSize' && obj.type === 'textbox') {
            obj.set('fontSize', value);
          } else if (property === 'fontWeight' && obj.type === 'textbox') {
            obj.set('fontWeight', value);
          } else if (property === 'fontStyle' && obj.type === 'textbox') {
            obj.set('fontStyle', value);
          } else if (property === 'underline' && obj.type === 'textbox') {
            obj.set('underline', value);
          } else if (property === 'textAlign' && obj.type === 'textbox') {
            obj.set('textAlign', value);
          } else if (['opacity', 'angle'].includes(property as string)) {
            obj.set(property, value);
          }
        };

        if (
          'forEachObject' in fabricObject &&
          typeof (fabricObject as any).forEachObject === 'function'
        ) {
          (fabricObject as any).forEachObject(applyToGroupObjects);
        } else if (Array.isArray((fabricObject as any)._objects)) {
          (fabricObject as any)._objects.forEach(applyToGroupObjects);
        }
      } else {
        fabricObject.set(property, value);
      }

      canvas.renderAll();
    },

    // Reset to defaults
    resetAttributes: () => set({ attributes: defaultAttributes, selectedObjectType: null }),

    // Helper functions
    getObjectTypeName: () => {
      const type = get().selectedObjectType;
      if (!type) return 'Object';
      
      const isText = type === 'textbox' || type === 'text';
      const isShape = ['rect', 'circle', 'triangle', 'ellipse', 'path'].includes(type);
      const isLine = type === 'line';
      const isGroup = type === 'group';
      const isImage = type === 'image';

      if (isText) return 'Text';
      if (isImage) return 'Image';
      if (isLine) return 'Line';
      if (isGroup) return 'Group';
      if (type === 'circle') return 'Circle';
      if (type === 'rect') return 'Rectangle';
      if (type === 'triangle') return 'Triangle';
      if (type === 'ellipse') return 'Ellipse';
      if (type === 'path') return 'Shape';
      return 'Object';
    },

    isTextObject: () => {
      const type = get().selectedObjectType;
      return type === 'textbox' || type === 'text';
    },

    isShapeObject: () => {
      const type = get().selectedObjectType;
      return ['rect', 'circle', 'triangle', 'ellipse', 'path'].includes(type || '');
    },

    isLineObject: () => get().selectedObjectType === 'line',

    isGroupObject: () => get().selectedObjectType === 'group',

    isImageObject: () => get().selectedObjectType === 'image',
  }))
);
