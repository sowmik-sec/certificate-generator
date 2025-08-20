/* eslint-disable @typescript-eslint/no-explicit-any */

interface ObjectAttributes {
  left: number;
  top: number;
  // Add other properties as needed
}

export interface AlignmentOptions {
  canvas: any;
  selectedObject: any;
  updateAttribute?: (key: keyof ObjectAttributes, value: any) => void;
}

export const alignmentUtils = {
  alignToTop: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, align the text content to the top edge
      const boundingRect = selectedObject.getBoundingRect();
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", -topOffset);
    } else {
      // For shapes, align the top edge to canvas top
      selectedObject.set("top", 0);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("top", selectedObject.top);
  },

  alignToLeft: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, align the text content to the left edge
      const boundingRect = selectedObject.getBoundingRect();
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", -leftOffset);
    } else {
      // For shapes, align the left edge to canvas left
      selectedObject.set("left", 0);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("left", selectedObject.left);
  },

  alignToMiddle: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text height
      const boundingRect = selectedObject.getBoundingRect();
      const textHeight = boundingRect.height;
      const top = (canvasHeight - textHeight) / 2;

      // Adjust for any offset between the object's top and its bounding rect
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", top - topOffset);
    } else {
      // For shapes, use scaled height
      const objectHeight = selectedObject.getScaledHeight();
      const top = (canvasHeight - objectHeight) / 2;
      selectedObject.set("top", top);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("top", selectedObject.top);
  },

  alignToCenter: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text width
      const boundingRect = selectedObject.getBoundingRect();
      const textWidth = boundingRect.width;
      const left = (canvasWidth - textWidth) / 2;

      // Adjust for any offset between the object's left and its bounding rect
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", left - leftOffset);
    } else {
      // For shapes, use scaled width
      const objectWidth = selectedObject.getScaledWidth();
      const left = (canvasWidth - objectWidth) / 2;
      selectedObject.set("left", left);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("left", selectedObject.left);
  },

  alignToBottom: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;
    const canvasHeight = canvas.getHeight();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text height
      const boundingRect = selectedObject.getBoundingRect();
      const textHeight = boundingRect.height;
      const top = canvasHeight - textHeight;

      // Adjust for any offset between the object's top and its bounding rect
      const topOffset = boundingRect.top - selectedObject.top;
      selectedObject.set("top", top - topOffset);
    } else {
      // For shapes, use scaled height
      const objectHeight = selectedObject.getScaledHeight();
      const top = canvasHeight - objectHeight;
      selectedObject.set("top", top);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("top", selectedObject.top);
  },

  alignToRight: ({
    canvas,
    selectedObject,
    updateAttribute,
  }: AlignmentOptions) => {
    if (!selectedObject || !canvas) return;
    const canvasWidth = canvas.getWidth();

    if (selectedObject.type === "textbox" || selectedObject.type === "text") {
      // For text objects, use the bounding rect to get actual text width
      const boundingRect = selectedObject.getBoundingRect();
      const textWidth = boundingRect.width;
      const left = canvasWidth - textWidth;

      // Adjust for any offset between the object's left and its bounding rect
      const leftOffset = boundingRect.left - selectedObject.left;
      selectedObject.set("left", left - leftOffset);
    } else {
      // For shapes, use scaled width
      const objectWidth = selectedObject.getScaledWidth();
      const left = canvasWidth - objectWidth;
      selectedObject.set("left", left);
    }

    selectedObject.setCoords();
    canvas.renderAll();
    updateAttribute?.("left", selectedObject.left);
  },
};
