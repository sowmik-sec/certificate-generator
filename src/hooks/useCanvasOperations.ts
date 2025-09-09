/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useState } from "react";

export const useCanvasOperations = (
  canvas: any,
  fabric: any,
  selectedObject: any,
  setSelectedObject: (obj: any) => void
) => {
  const [copiedObject, setCopiedObject] = useState<any>(null);

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  }, [canvas, selectedObject, setSelectedObject]);

  const handleCopy = useCallback(() => {
    if (!selectedObject) return;

    // Create a safe copy by extracting properties manually
    const createSafeCopy = (obj: any) => {
      const safeCopy: any = {
        type: obj.type,
        left: obj.left || 0,
        top: obj.top || 0,
        width: obj.width,
        height: obj.height,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1,
        angle: obj.angle || 0,
        opacity: obj.opacity || 1,
        visible: obj.visible !== false,
        flipX: obj.flipX || false,
        flipY: obj.flipY || false,
        skewX: obj.skewX || 0,
        skewY: obj.skewY || 0,
      };

      // Handle different object types
      switch (obj.type) {
        case "textbox":
        case "text":
          safeCopy.text = obj.text || "Text";
          safeCopy.fontSize = obj.fontSize || 20;
          safeCopy.fontFamily = obj.fontFamily || "Arial";
          safeCopy.fontWeight = obj.fontWeight || "normal";
          safeCopy.fontStyle = obj.fontStyle || "normal";
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.textAlign = obj.textAlign || "left";
          safeCopy.lineHeight = obj.lineHeight || 1.16;
          if (obj.type === "textbox") {
            safeCopy.width = obj.width || 200;
          }
          break;

        case "rect":
        case "triangle":
        case "circle":
        case "ellipse":
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.stroke = obj.stroke;
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          if (obj.type === "circle") {
            safeCopy.radius = obj.radius || 50;
          }
          if (obj.type === "ellipse") {
            safeCopy.rx = obj.rx || 50;
            safeCopy.ry = obj.ry || 30;
          }
          break;

        case "line":
          safeCopy.x1 = obj.x1 || 0;
          safeCopy.y1 = obj.y1 || 0;
          safeCopy.x2 = obj.x2 || 100;
          safeCopy.y2 = obj.y2 || 0;
          safeCopy.stroke = obj.stroke || "#000000";
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          safeCopy.strokeDashArray = obj.strokeDashArray;
          break;

        case "path":
          safeCopy.path = obj.path;
          safeCopy.fill = obj.fill || "#000000";
          safeCopy.stroke = obj.stroke;
          safeCopy.strokeWidth = obj.strokeWidth || 1;
          break;

        case "image":
          safeCopy.src = obj.getSrc ? obj.getSrc() : obj.src;
          break;

        case "group":
          // For groups, store basic info and mark for special handling
          safeCopy.objects = [];
          if (obj.getObjects) {
            obj.getObjects().forEach((subObj: any) => {
              safeCopy.objects.push(createSafeCopy(subObj));
            });
          }
          break;
      }

      return safeCopy;
    };

    try {
      // First try the normal clone method
      selectedObject.clone((cloned: any) => {
        setCopiedObject(cloned);
      });
    } catch (error) {
      console.log("Normal cloning failed, using safe copy method:", error);
      // Use our safe copy method
      const safeCopy = createSafeCopy(selectedObject);
      setCopiedObject(safeCopy);
    }
  }, [selectedObject]);

  const handlePaste = useCallback(() => {
    // If we don't have an in-memory copiedObject, try localStorage fallback
    let effectiveCopied = copiedObject;
    if (!effectiveCopied) {
      try {
        const stored = localStorage.getItem("copiedObject");
        if (stored) {
          effectiveCopied = JSON.parse(stored);
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    if (!effectiveCopied || !canvas) return;

    const createFabricObject = (objData: any) => {
      const baseProps = {
        left: (objData.left || 0) + 10,
        top: (objData.top || 0) + 10,
        scaleX: objData.scaleX || 1,
        scaleY: objData.scaleY || 1,
        angle: objData.angle || 0,
        opacity: objData.opacity || 1,
        flipX: objData.flipX || false,
        flipY: objData.flipY || false,
        skewX: objData.skewX || 0,
        skewY: objData.skewY || 0,
      };

      let fabricObj;

      switch (objData.type) {
        case "textbox":
          fabricObj = new fabric.Textbox(objData.text || "Text", {
            ...baseProps,
            width: objData.width || 200,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
            lineHeight: objData.lineHeight || 1.16,
          });
          break;

        case "text":
          fabricObj = new fabric.Text(objData.text || "Text", {
            ...baseProps,
            fontSize: objData.fontSize || 20,
            fontFamily: objData.fontFamily || "Arial",
            fontWeight: objData.fontWeight || "normal",
            fontStyle: objData.fontStyle || "normal",
            fill: objData.fill || "#000000",
            textAlign: objData.textAlign || "left",
          });
          break;

        case "rect":
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "circle":
          fabricObj = new fabric.Circle({
            ...baseProps,
            radius: objData.radius || 50,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "triangle":
          fabricObj = new fabric.Triangle({
            ...baseProps,
            width: objData.width || 100,
            height: objData.height || 100,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "ellipse":
          fabricObj = new fabric.Ellipse({
            ...baseProps,
            rx: objData.rx || 50,
            ry: objData.ry || 30,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "line":
          fabricObj = new fabric.Line(
            [
              objData.x1 || 0,
              objData.y1 || 0,
              objData.x2 || 100,
              objData.y2 || 0,
            ],
            {
              ...baseProps,
              stroke: objData.stroke || "#000000",
              strokeWidth: objData.strokeWidth || 1,
              strokeDashArray: objData.strokeDashArray,
            }
          );
          break;

        case "path":
          fabricObj = new fabric.Path(objData.path, {
            ...baseProps,
            fill: objData.fill || "#000000",
            stroke: objData.stroke,
            strokeWidth: objData.strokeWidth || 1,
          });
          break;

        case "group":
          // Handle groups by recreating individual objects and grouping them
          if (objData.objects && objData.objects.length > 0) {
            const groupObjects = objData.objects
              .map((subObj: any) => {
                return createFabricObject({
                  ...subObj,
                  left: subObj.left || 0,
                  top: subObj.top || 0,
                });
              })
              .filter(Boolean);

            if (groupObjects.length > 0) {
              fabricObj = new fabric.Group(groupObjects, baseProps);
            }
          }
          break;

        default:
          console.warn("Unknown object type for pasting:", objData.type);
          // Fallback to rectangle
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: 100,
            height: 100,
            fill: "#cccccc",
          });
      }

      return fabricObj;
    };

    try {
      // If we have the original runtime copied object with clone method, prefer it
      const cloneSource =
        copiedObject && copiedObject.clone ? copiedObject : effectiveCopied;

      if (
        cloneSource &&
        cloneSource.clone &&
        typeof cloneSource.clone === "function"
      ) {
        cloneSource.clone((clonedObj: any) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          if (clonedObj.type === "activeSelection") {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj: any) => {
              canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          setSelectedObject(clonedObj);
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        });
      } else {
        // Use our safe copy data (effectiveCopied) to recreate the object
        const fabricObj = createFabricObject(effectiveCopied);

        if (fabricObj) {
          canvas.discardActiveObject();
          canvas.add(fabricObj);
          setSelectedObject(fabricObj);
          canvas.setActiveObject(fabricObj);
          canvas.requestRenderAll();
        }
      }
    } catch (error) {
      console.error("Error pasting object:", error);
      // Final fallback - create a simple text or rectangle
      try {
        let fallbackObj;
        if (copiedObject.type === "textbox" || copiedObject.type === "text") {
          fallbackObj = new fabric.Textbox(copiedObject.text || "Copied Text", {
            left: (copiedObject.left || 0) + 10,
            top: (copiedObject.top || 0) + 10,
            fontSize: 20,
            fontFamily: "Arial",
            fill: "#000000",
          });
        } else {
          fallbackObj = new fabric.Rect({
            left: (copiedObject.left || 0) + 10,
            top: (copiedObject.top || 0) + 10,
            width: 100,
            height: 100,
            fill: "#cccccc",
          });
        }

        canvas.add(fallbackObj);
        setSelectedObject(fallbackObj);
        canvas.setActiveObject(fallbackObj);
        canvas.requestRenderAll();
      } catch (fallbackError) {
        console.error("All paste methods failed:", fallbackError);
      }
    }
  }, [copiedObject, canvas, fabric, setSelectedObject]);

  const addImageFromURL = useCallback(
    (url: string) => {
      if (!canvas || !fabric) return;
      fabric.Image.fromURL(
        url,
        (img: any) => {
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
            id: `image-${Date.now()}`,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    },
    [canvas, fabric]
  );

  const addStickyNote = useCallback(() => {
    if (!canvas || !fabric) return;
    
    console.log("Creating sticky note...");
    
    // Create background rectangle with proper styling
    const noteBg = new fabric.Rect({
      width: 200,
      height: 200,
      fill: "#FFF9C4",
      stroke: "#F9C23C",
      strokeWidth: 1,
      shadow: "rgba(0,0,0,0.15) 0px 2px 8px",
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    });

    // Create text that's properly constrained within the sticky note
    const noteText = new fabric.Textbox("Double-click to edit", {
      width: 160, // Constrain width to stay within note bounds with padding
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      fill: "#444444",
      textAlign: "center",
      // Position relative to the group center
      left: 0,  // Center horizontally
      top: -20, // Slightly above center for better visual balance
      // Important: Allow editing but prevent manual movement
      editable: true,
      lockMovementX: true, // Prevent movement during editing
      lockMovementY: true,
      hasControls: false,
      hasBorders: false,
      selectable: true,
      evented: true,
      originX: "center",
      originY: "center",
      // Custom property to identify sticky note text
      _stickyNoteText: true,
    });

    console.log("Created background and text objects");

    // Create group with both elements
    const group = new fabric.Group([noteBg, noteText], {
      left: 150,
      top: 150,
      originX: "center",
      originY: "center",
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      borderColor: "#007ACC",
      cornerColor: "#007ACC",
      cornerStrokeColor: "#005299",
      transparentCorners: false,
    });

    // Set custom properties after creation to ensure they're properly applied
    group._stickyNote = true;
    group.type = "sticky-note";

    console.log("Group created with properties:", {
      _stickyNote: group._stickyNote,
      type: group.type,
      objectCount: group.getObjects().length
    });

    // Add a custom double-click handler as a fallback
    group.on("mousedblclick", () => {
      console.log("Group double-click handler triggered");
      // Find the text object
      const textObj = group.getObjects().find((obj: any) => 
        obj.isType("textbox") || obj._stickyNoteText
      );
      
      if (textObj && canvas) {
        console.log("Starting direct text editing");
        // Simple approach: temporarily ungroup, edit, then regroup
        const objects = group.getObjects().slice();
        const groupPos = { left: group.left, top: group.top };
        
        // Remove group
        canvas.remove(group);
        
        // Add objects individually with proper positioning
        objects.forEach((obj: any) => {
          obj.set({
            left: groupPos.left + (obj.left || 0),
            top: groupPos.top + (obj.top || 0),
          });
          canvas.add(obj);
        });
        
        // Select and edit text
        canvas.setActiveObject(textObj);
        setTimeout(() => {
          textObj.enterEditing();
          textObj.selectAll();
        }, 100);
        
        // Handle regrouping on edit exit
        const regroup = () => {
          console.log("Regrouping after text edit");
          objects.forEach((obj: any) => canvas.remove(obj));
          
          // Reset positions
          objects.forEach((obj: any) => {
            if (obj._stickyNoteText) {
              obj.set({ left: 0, top: -20, originX: "center", originY: "center" });
            } else {
              obj.set({ left: 0, top: 0, originX: "center", originY: "center" });
            }
          });
          
          // Create new group
          const newGroup = new fabric.Group(objects, {
            left: groupPos.left,
            top: groupPos.top,
            originX: "center",
            originY: "center",
          });
          newGroup._stickyNote = true;
          newGroup.type = "sticky-note";
          
          // Re-add the double-click handler
          newGroup.on("mousedblclick", group._originalHandler || (() => {}));
          
          canvas.add(newGroup);
          canvas.setActiveObject(newGroup);
          canvas.renderAll();
        };
        
        textObj.once("editing:exited", regroup);
        canvas.renderAll();
      }
    });
    
    // Store the original handler reference
    group._originalHandler = group._events?.mousedblclick?.[0] || null;

    console.log("Created sticky note group:", group._stickyNote, group.type);
    
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  }, [canvas, fabric]);

  const addTable = useCallback(
    (rows: number, cols: number) => {
      if (!canvas || !fabric) return;
      const cellPadding = 10;
      const cellWidth = 150;
      const cellHeight = 50;
      const tableObjects = [];

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = new fabric.Rect({
            width: cellWidth,
            height: cellHeight,
            fill: "transparent",
            stroke: "#000",
            left: j * cellWidth,
            top: i * cellHeight,
          });

          const text = new fabric.Textbox(`Cell ${i}-${j}`, {
            width: cellWidth - cellPadding,
            height: cellHeight - cellPadding,
            left: j * cellWidth + cellPadding / 2,
            top: i * cellHeight + cellPadding / 2,
            fontSize: 16,
            fill: "#000000",
            fontFamily: "Arial",
            textAlign: "center",
          });

          tableObjects.push(cell, text);
        }
      }

      const group = new fabric.Group(tableObjects, {
        left: 150,
        top: 150,
      });

      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    },
    [canvas, fabric]
  );

  return {
    deleteSelected,
    handleCopy,
    handlePaste,
    addImageFromURL,
    addStickyNote,
    addTable,
  };
};
