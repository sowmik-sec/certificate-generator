/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";

interface PrecisionSelectionProps {
  canvas: any;
  fabric: any;
}

const PrecisionSelection: React.FC<PrecisionSelectionProps> = ({
  canvas,
  fabric,
}) => {
  useEffect(() => {
    if (!canvas || !fabric) return;

    // Enhanced target finding for thin lines and small objects
    const enhanceObjectTargeting = () => {
      // Override the default target finding to improve precision
      const originalFindTarget = canvas.findTarget;

      canvas.findTarget = function (e: any, skipGroup?: boolean) {
        const pointer = this.getPointer(e, true);
        const activeObject = this.getActiveObject();

        // First, try to find thin lines or small objects with higher tolerance
        const objects = this.getObjects();
        let bestMatch = null;
        let minDistance = Infinity;

        // Enhanced targeting for lines and thin objects
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];

          // Skip non-interactive objects
          if (!obj.selectable || !obj.visible || obj.excludeFromExport)
            continue;

          // Special handling for lines
          if (obj.isType && obj.isType("line")) {
            const tolerance = Math.max(obj.strokeWidth * 3, 10); // Minimum 10px tolerance for lines
            const objCenter = obj.getCenterPoint();
            const distance = Math.sqrt(
              Math.pow(pointer.x - objCenter.x, 2) +
                Math.pow(pointer.y - objCenter.y, 2)
            );

            // Check if pointer is within tolerance of the line
            if (distance <= tolerance) {
              // For lines, also check if we're close to the actual line path
              const lineDistance = this.getDistanceFromLine(pointer, obj);
              if (lineDistance <= tolerance && distance < minDistance) {
                bestMatch = obj;
                minDistance = distance;
              }
            }
          }

          // Special handling for paths (including custom shapes)
          else if (
            obj.isType &&
            (obj.isType("path") || obj.isType("polygon"))
          ) {
            const tolerance = 15; // Higher tolerance for paths
            if (obj.containsPoint && obj.containsPoint(pointer, null, true)) {
              const objCenter = obj.getCenterPoint();
              const distance = Math.sqrt(
                Math.pow(pointer.x - objCenter.x, 2) +
                  Math.pow(pointer.y - objCenter.y, 2)
              );
              if (distance < minDistance) {
                bestMatch = obj;
                minDistance = distance;
              }
            }
          }

          // For groups, check if we can select individual objects within
          else if (obj.isType && obj.isType("group") && !skipGroup) {
            const groupObjects = obj.getObjects();
            let foundInGroup = null;
            let minGroupDistance = Infinity;

            // Transform pointer to group's local coordinates
            const groupTransform = obj.calcTransformMatrix();
            const invertedTransform =
              fabric.util.invertTransform(groupTransform);
            const localPointer = fabric.util.transformPoint(
              pointer,
              invertedTransform
            );

            // Check each object in the group
            for (const groupObj of groupObjects) {
              if (!groupObj.selectable || !groupObj.visible) continue;

              // Special handling for lines in groups
              if (groupObj.isType && groupObj.isType("line")) {
                const tolerance = Math.max(groupObj.strokeWidth * 4, 12);
                const objBounds = groupObj.getBoundingRect();
                const objCenter = {
                  x: objBounds.left + objBounds.width / 2,
                  y: objBounds.top + objBounds.height / 2,
                };

                const distance = Math.sqrt(
                  Math.pow(localPointer.x - objCenter.x, 2) +
                    Math.pow(localPointer.y - objCenter.y, 2)
                );

                if (distance <= tolerance && distance < minGroupDistance) {
                  foundInGroup = groupObj;
                  minGroupDistance = distance;
                }
              }

              // Check other objects in group
              else if (
                groupObj.containsPoint &&
                groupObj.containsPoint(localPointer, null, true)
              ) {
                const objBounds = groupObj.getBoundingRect();
                const objCenter = {
                  x: objBounds.left + objBounds.width / 2,
                  y: objBounds.top + objBounds.height / 2,
                };

                const distance = Math.sqrt(
                  Math.pow(localPointer.x - objCenter.x, 2) +
                    Math.pow(localPointer.y - objCenter.y, 2)
                );

                if (distance < minGroupDistance) {
                  foundInGroup = groupObj;
                  minGroupDistance = distance;
                }
              }
            }

            // If we found a specific object in the group and it's closer than the group itself
            if (foundInGroup && minGroupDistance < minDistance) {
              // For thin lines or small objects, prefer individual selection
              if (
                (foundInGroup.isType && foundInGroup.isType("line")) ||
                (foundInGroup.getBoundingRect &&
                  (foundInGroup.getBoundingRect().width < 50 ||
                    foundInGroup.getBoundingRect().height < 50))
              ) {
                // Temporarily ungroup to allow individual selection
                if (this._tempUngroupedObjects) {
                  this._tempUngroupedObjects.forEach((tempObj: any) => {
                    if (this.contains(tempObj)) this.remove(tempObj);
                  });
                }

                // Store original group info
                foundInGroup._originalGroup = obj;
                foundInGroup._wasInGroup = true;

                // Extract the object temporarily
                const objectsInGroup = obj.getObjects();
                const extractedObject = objectsInGroup.find(
                  (o: any) => o === foundInGroup
                );

                if (extractedObject) {
                  // Create a copy with global coordinates
                  const globalCoords = fabric.util.transformPoint(
                    { x: extractedObject.left, y: extractedObject.top },
                    obj.calcTransformMatrix()
                  );

                  extractedObject.set({
                    left: globalCoords.x,
                    top: globalCoords.y,
                  });

                  bestMatch = extractedObject;
                  minDistance = minGroupDistance;
                }
              }
            }

            // If no specific object found, check the group normally
            if (
              !foundInGroup &&
              obj.containsPoint &&
              obj.containsPoint(pointer, null, true)
            ) {
              const objCenter = obj.getCenterPoint();
              const distance = Math.sqrt(
                Math.pow(pointer.x - objCenter.x, 2) +
                  Math.pow(pointer.y - objCenter.y, 2)
              );
              if (distance < minDistance) {
                bestMatch = obj;
                minDistance = distance;
              }
            }
          }

          // Standard object detection
          else if (
            obj.containsPoint &&
            obj.containsPoint(pointer, null, true)
          ) {
            const objCenter = obj.getCenterPoint();
            const distance = Math.sqrt(
              Math.pow(pointer.x - objCenter.x, 2) +
                Math.pow(pointer.y - objCenter.y, 2)
            );
            if (distance < minDistance) {
              bestMatch = obj;
              minDistance = distance;
            }
          }
        }

        // If we found a better match, return it
        if (bestMatch && minDistance < 50) {
          // Within reasonable distance
          return bestMatch;
        }

        // Fall back to original method
        return originalFindTarget.call(this, e, skipGroup);
      };
    };

    // Helper function to calculate distance from pointer to line
    canvas.getDistanceFromLine = function (pointer: any, line: any) {
      if (!line.isType || !line.isType("line")) return Infinity;

      const lineCoords = line.calcLinePoints();
      const x1 = lineCoords.x1;
      const y1 = lineCoords.y1;
      const x2 = lineCoords.x2;
      const y2 = lineCoords.y2;

      // Calculate distance from point to line segment
      const A = pointer.x - x1;
      const B = pointer.y - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;

      if (lenSq === 0) return Math.sqrt(A * A + B * B);

      let param = dot / lenSq;
      param = Math.max(0, Math.min(1, param));

      const xx = x1 + param * C;
      const yy = y1 + param * D;

      const dx = pointer.x - xx;
      const dy = pointer.y - yy;

      return Math.sqrt(dx * dx + dy * dy);
    };

    // Enhanced hover cursor for better UX
    const handleMouseMove = (e: any) => {
      const target = canvas.findTarget(e.e);

      if (target && target.isType && target.isType("line")) {
        canvas.setCursor("move");
      } else if (target) {
        canvas.setCursor("move");
      } else {
        canvas.setCursor("default");
      }
    };

    // Apply enhancements
    enhanceObjectTargeting();

    // Add mouse move handler for cursor changes
    canvas.on("mouse:move", handleMouseMove);

    return () => {
      // Cleanup
      canvas.off("mouse:move", handleMouseMove);

      // Restore original findTarget if needed
      if (canvas._originalFindTarget) {
        canvas.findTarget = canvas._originalFindTarget;
      }
    };
  }, [canvas, fabric]);

  return null;
};

export default PrecisionSelection;
