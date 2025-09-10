/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useCallback } from "react";

interface ContextMenuProps {
  canvas: any;
  fabric: any;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ canvas, fabric }) => {
  const findAllObjectsAtPoint = useCallback(
    (pointer: { x: number; y: number }) => {
      if (!canvas) return [];

      const objects = canvas.getObjects();
      const foundObjects: any[] = [];

      objects.forEach((obj: any) => {
        if (!obj.selectable || !obj.visible || obj.excludeFromExport) return;

        // For lines, use enhanced detection
        if (obj.isType && obj.isType("line")) {
          const tolerance = Math.max(obj.strokeWidth * 3, 12);
          const objCenter = obj.getCenterPoint();
          const distance = Math.sqrt(
            Math.pow(pointer.x - objCenter.x, 2) +
              Math.pow(pointer.y - objCenter.y, 2)
          );

          if (distance <= tolerance) {
            foundObjects.push({
              object: obj,
              type: "line",
              description: "Line (" + Math.round(obj.strokeWidth) + "px thick)",
              distance,
            });
          }
        }

        // For groups, check individual objects
        else if (obj.isType && obj.isType("group")) {
          const groupTransform = obj.calcTransformMatrix();
          const invertedTransform = fabric.util.invertTransform(groupTransform);
          const localPointer = fabric.util.transformPoint(
            pointer,
            invertedTransform
          );

          const groupObjects = obj.getObjects();
          let hasLineInGroup = false;

          groupObjects.forEach((groupObj: any) => {
            if (groupObj.isType && groupObj.isType("line")) {
              const tolerance = Math.max(groupObj.strokeWidth * 4, 15);
              const objBounds = groupObj.getBoundingRect();
              const objCenter = {
                x: objBounds.left + objBounds.width / 2,
                y: objBounds.top + objBounds.height / 2,
              };

              const distance = Math.sqrt(
                Math.pow(localPointer.x - objCenter.x, 2) +
                  Math.pow(localPointer.y - objCenter.y, 2)
              );

              if (distance <= tolerance) {
                hasLineInGroup = true;
              }
            }
          });

          // Add group if it contains clicked lines or if clicked normally
          if (
            hasLineInGroup ||
            (obj.containsPoint && obj.containsPoint(pointer, null, true))
          ) {
            const objCenter = obj.getCenterPoint();
            const distance = Math.sqrt(
              Math.pow(pointer.x - objCenter.x, 2) +
                Math.pow(pointer.y - objCenter.y, 2)
            );

            foundObjects.push({
              object: obj,
              type: "group",
              description:
                "Group (" +
                groupObjects.length +
                " items)" +
                (hasLineInGroup ? " - contains lines" : ""),
              distance,
              hasLines: hasLineInGroup,
            });
          }
        }

        // For other objects
        else if (obj.containsPoint && obj.containsPoint(pointer, null, true)) {
          const objCenter = obj.getCenterPoint();
          const distance = Math.sqrt(
            Math.pow(pointer.x - objCenter.x, 2) +
              Math.pow(pointer.y - objCenter.y, 2)
          );

          let description = "Object";
          if (obj.isType) {
            if (obj.isType("rect")) description = "Rectangle";
            else if (obj.isType("circle")) description = "Circle";
            else if (obj.isType("textbox"))
              description =
                "Text: " + (obj.text?.substring(0, 20) || "") + "...";
            else if (obj.isType("path")) description = "Path/Shape";
            else description = obj.type || "Object";
          }

          foundObjects.push({
            object: obj,
            type: obj.type || "object",
            description,
            distance,
          });
        }
      });

      // Sort by distance (closest first) and prioritize lines
      return foundObjects.sort((a, b) => {
        // Prioritize lines over other objects
        if (a.type === "line" && b.type !== "line") return -1;
        if (b.type === "line" && a.type !== "line") return 1;

        // Then sort by distance
        return a.distance - b.distance;
      });
    },
    [canvas, fabric]
  );

  useEffect(() => {
    if (!canvas) return;

    const handleRightClick = (e: any) => {
      // Only handle right-click events (button 2)
      if (e.e.button !== 2) return;

      e.e.preventDefault();

      const pointer = canvas.getPointer(e.e);
      const objectsAtPoint = findAllObjectsAtPoint(pointer);

      // For multiple objects, select the closest one (prioritizing lines)
      if (objectsAtPoint.length > 0) {
        const closestObject = objectsAtPoint[0]; // Already sorted by priority and distance
        canvas.setActiveObject(closestObject.object);
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down:before", handleRightClick);

    return () => {
      canvas.off("mouse:down:before", handleRightClick);
    };
  }, [canvas, findAllObjectsAtPoint]);

  // This component doesn't render anything visible
  return null;
};

export default ContextMenu;
