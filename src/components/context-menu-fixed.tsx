/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback } from "react";

interface ContextMenuProps {
  canvas: any;
  fabric: any;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  objects: any[];
  clickedPoint: { x: number; y: number };
}

const ContextMenu: React.FC<ContextMenuProps> = ({ canvas, fabric }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    objects: [],
    clickedPoint: { x: 0, y: 0 },
  });

  const hideMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, visible: false }));
  }, []);

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
              description: `Line (${Math.round(obj.strokeWidth)}px thick)`,
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
              description: `Group (${groupObjects.length} items)${
                hasLineInGroup ? " - contains lines" : ""
              }`,
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
              description = `Text: "${obj.text?.substring(0, 20)}..."`;
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
      e.e.preventDefault();

      const pointer = canvas.getPointer(e.e);
      const objectsAtPoint = findAllObjectsAtPoint(pointer);

      // Only show context menu if there are multiple objects or if there's a line
      if (
        objectsAtPoint.length > 1 ||
        objectsAtPoint.some((obj) => obj.type === "line")
      ) {
        setMenuState({
          visible: true,
          x: e.e.clientX,
          y: e.e.clientY,
          objects: objectsAtPoint,
          clickedPoint: pointer,
        });
      } else {
        // Normal selection for single non-line objects
        if (objectsAtPoint.length === 1) {
          canvas.setActiveObject(objectsAtPoint[0].object);
          canvas.renderAll();
        }
      }
    };

    const handleClick = () => {
      hideMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hideMenu();
      }
    };

    canvas.on("mouse:down:before", handleRightClick);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.off("mouse:down:before", handleRightClick);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [canvas, findAllObjectsAtPoint, hideMenu]);

  const selectObject = (objectData: any) => {
    if (!canvas) return;

    canvas.setActiveObject(objectData.object);
    canvas.renderAll();
    hideMenu();
  };

  if (!menuState.visible) return null;

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50 min-w-48"
      style={{
        left: menuState.x,
        top: menuState.y,
        maxHeight: "300px",
        overflowY: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 border-b border-gray-200">
        Select Object ({menuState.objects.length} found)
      </div>

      {menuState.objects.map((objData, index) => (
        <button
          key={index}
          className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
          onClick={() => selectObject(objData)}
        >
          <span className="flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                objData.type === "line"
                  ? "bg-red-500"
                  : objData.type === "group" && objData.hasLines
                  ? "bg-orange-500"
                  : objData.type === "group"
                  ? "bg-purple-500"
                  : objData.type === "textbox"
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
            ></span>
            {objData.description}
          </span>

          {objData.type === "line" && (
            <span className="text-xs text-red-600 font-medium">LINE</span>
          )}
        </button>
      ))}

      <div className="px-3 py-1 text-xs text-gray-400 border-t border-gray-200 mt-1">
        Right-click to select from overlapping objects
      </div>
    </div>
  );
};

export default ContextMenu;
