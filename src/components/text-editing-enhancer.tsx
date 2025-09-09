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

      // Ensure immediate text editing capability
      setTimeout(() => {
        if (textObject.hiddenTextarea) {
          textObject.hiddenTextarea.focus();
          // Force cursor positioning
          textObject.hiddenTextarea.setSelectionRange(
            textObject.selectionStart || 0,
            textObject.selectionEnd || 0
          );
        }
      }, 0);
    };

    const handleTextEditingExited = (e: any) => {
      const textObject = e.target;
      if (!textObject) return;

      // Special handling for sticky note text
      if (textObject._stickyNoteText) {
        // Re-enable movement after editing (though it should still be constrained)
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

      // Skip if this is a group - let the canvas component handle it
      if (target.isType("group")) {
        console.log("TextEditingEnhancer: Skipping group double-click, letting canvas handle it");
        return;
      }

      // For text objects, ensure immediate editing
      if (target.type === "textbox" || target.type === "i-text") {
        // Special handling for sticky note text to prevent movement
        if (target._stickyNoteText) {
          // Temporarily disable movement during editing
          target.set({
            lockMovementX: true,
            lockMovementY: true,
          });
        }
        
        // Prevent any delays by forcing immediate editing mode
        setTimeout(() => {
          target.enterEditing();
          target.selectAll();
        }, 0);
      }
    };

    // Add event listeners
    canvas.on("text:editing:entered", handleTextEditingEntered);
    canvas.on("text:editing:exited", handleTextEditingExited);
    canvas.on("mouse:dblclick", handleDoubleClick);

    // Enhanced text object setup
    canvas.on("object:added", (e: any) => {
      const obj = e.target;
      if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
        // Ensure text objects have proper editing configuration
        obj.set({
          editable: true,
          splitByGrapheme: false,
          // Immediate focus capability
          focusOnInit: true,
        });

        // Special configuration for sticky note text
        if (obj._stickyNoteText) {
          obj.set({
            // Prevent the text from being moved outside the sticky note bounds
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
    };
  }, [canvas, fabric]);

  return null; // This is a behavior-only component
};

export default TextEditingEnhancer;
