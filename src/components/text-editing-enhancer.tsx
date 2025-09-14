/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";

interface TextEditingEnhancerProps {
  canvas: any;
  fabric: any;
}

const TextEditingEnhancer: React.FC<TextEditingEnhancerProps> = ({
  canvas,
  fabric,
}) => {
  useEffect(() => {
    if (!canvas || !fabric) return;

    // Enhanced text editing event handlers
    const handleTextEditingEntered = (e: any) => {
      const textObject = e.target;
      if (!textObject) return;

      // Initialize styles object if not present to prevent removeStyleFromTo errors
      if (!textObject.styles) {
        textObject.styles = {};
      }

      // For natural Fabric.js double-click behavior, we need to handle cursor positioning properly
      // but not override the selection that Fabric.js creates
      setTimeout(() => {
        if (textObject.hiddenTextarea) {
          textObject.hiddenTextarea.focus();
          // Don't force cursor positioning - let Fabric.js handle natural selection
        }
      }, 0);
    };

    const handleTextEditingExited = (e: any) => {
      const textObject = e.target;
      if (!textObject) return;

      // Remove movement locks after editing for both sticky notes and table cells
      if (textObject._stickyNoteText || textObject._isTableCell) {
        textObject.set({
          lockMovementX: false,
          lockMovementY: false,
        });
      }

      // Ensure proper cleanup and rendering
      setTimeout(() => {
        canvas.renderAll();
      }, 10);
    };

    const handleDoubleClick = (e: any) => {
      const target = e.target;
      if (!target) return;

      console.log(
        "Text enhancer double-click on:",
        target.type,
        target._stickyNoteText,
        target._isTableCell
      );

      // Only handle groups (sticky notes and tables) with special editing
      if (target.isType("group")) {
        console.log("Group double-click detected:", target.type);

        // Find text objects in the group
        const textObjects = target
          .getObjects()
          .filter((obj: any) => obj.isType("textbox") || obj.isType("i-text"));

        if (textObjects.length > 0) {
          const textObj = textObjects[0]; // For now, edit the first text object
          console.log("Editing text in group directly");

          // Ensure styles are initialized before editing
          if (!textObj.styles) {
            textObj.styles = {};
          }

          // Simple direct editing without ungrouping
          setTimeout(() => {
            canvas.setActiveObject(textObj);
            textObj.enterEditing();
            // Don't select all - let natural word selection happen
            canvas.renderAll();
          }, 50);
        }

        // Prevent default group behavior
        return false;
      }

      // For individual text objects, don't interfere - let Fabric.js handle naturally
      // Just ensure styles are initialized when they get focus
      if (target.type === "textbox" || target.type === "i-text") {
        console.log(
          "Individual text object - letting Fabric.js handle naturally"
        );

        // Ensure styles are initialized
        if (!target.styles) {
          target.styles = {};
        }

        // Lock movement during editing for special text types
        if (target._stickyNoteText || target._isTableCell) {
          target.set({
            lockMovementX: true,
            lockMovementY: true,
          });
        }

        // Let Fabric.js handle everything else naturally
        // Return true to allow default Fabric.js behavior
        return true;
      }
    };

    // Add event listeners
    canvas.on("text:editing:entered", handleTextEditingEntered);
    canvas.on("text:editing:exited", handleTextEditingExited);
    canvas.on("mouse:dblclick", handleDoubleClick);

    // Fix existing text objects that might not have styles initialized
    canvas.on("selection:created", (e: any) => {
      const activeObject = e.target;
      if (
        activeObject &&
        (activeObject.type === "textbox" || activeObject.type === "i-text")
      ) {
        if (!activeObject.styles) {
          activeObject.styles = {};
        }
      }
    });

    canvas.on("selection:updated", (e: any) => {
      const activeObject = e.target;
      if (
        activeObject &&
        (activeObject.type === "textbox" || activeObject.type === "i-text")
      ) {
        if (!activeObject.styles) {
          activeObject.styles = {};
        }
      }
    });

    // Enhanced text object setup
    canvas.on("object:added", (e: any) => {
      const obj = e.target;
      if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
        // Initialize styles array to prevent removeStyleFromTo errors
        if (!obj.styles) {
          obj.styles = {};
        }

        // Ensure text objects have proper editing configuration
        obj.set({
          editable: true,
          splitByGrapheme: false,
          // Immediate focus capability
          focusOnInit: true,
        });

        // Special configuration for sticky note and table cell text
        if (obj._stickyNoteText || obj._isTableCell) {
          obj.set({
            // Prevent the text from being moved outside bounds
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            hasBorders: false,
            // Ensure it can still be selected for editing
            selectable: true,
            evented: true,
          });
        }
      }
    });

    // Cleanup
    return () => {
      canvas.off("text:editing:entered", handleTextEditingEntered);
      canvas.off("text:editing:exited", handleTextEditingExited);
      canvas.off("mouse:dblclick", handleDoubleClick);
      canvas.off("selection:created");
      canvas.off("selection:updated");
    };
  }, [canvas, fabric]);

  return null; // This is a behavior-only component
};

export default TextEditingEnhancer;
