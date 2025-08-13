/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FabricCanvas } from "@/types/fabric";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  GripVertical,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Shapes,
} from "lucide-react";
import { useEffect, useCallback } from "react";
import { useLayerStore } from "@/stores/useLayerStore";

interface LayerPanelProps {
  canvas: FabricCanvas;
  selectedObjects?: any[];
  onSelectionChange?: (objects: any[]) => void;
}

interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: any;
  zIndex: number;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  canvas,
  onSelectionChange,
}) => {
  // Zustand store
  const {
    layers,
    setLayers,
    draggedLayer,
    setDraggedLayer,
    editingLayer,
    setEditingLayer,
    editingName,
    setEditingName,
    generateLayerName,
  } = useLayerStore();

  // Get icon for layer type
  const getLayerIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "textbox":
      case "text":
        return <Type size={16} className="text-blue-500" />;
      case "rect":
      case "rectangle":
        return <Square size={16} className="text-green-500" />;
      case "circle":
      case "ellipse":
        return <Circle size={16} className="text-purple-500" />;
      case "image":
        return <ImageIcon size={16} className="text-orange-500" />;
      case "group":
        return <Shapes size={16} className="text-indigo-500" />;
      default:
        return <Shapes size={16} className="text-gray-500" />;
    }
  };


  // Update layers list when canvas changes
  const updateLayers = useCallback(() => {
    if (!canvas) return;

    const objects = canvas
      .getObjects()
      .filter(
        (obj: any) => obj.id !== "grid-line" && obj.id !== "alignment-line"
      );

    const layerInfos: LayerInfo[] = objects.map((obj: any, index: number) => {
      // Ensure object has an ID
      if (!obj.id) {
        obj.id = `layer-${Date.now()}-${index}`;
      }

      return {
        id: obj.id,
        name: obj.layerName || generateLayerName(obj, index),
        type: obj.type || "object",
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        object: obj,
        zIndex: canvas.getObjects().indexOf(obj),
      };
    });

    // Sort by z-index (top to bottom in layer panel)
    layerInfos.sort((a, b) => b.zIndex - a.zIndex);
    setLayers(layerInfos);
  }, [canvas, generateLayerName, setLayers]);

  // Update layers when canvas objects change
  useEffect(() => {
    if (!canvas) return;

    updateLayers();

    const handleObjectChange = () => {
      setTimeout(updateLayers, 10); // Small delay to ensure canvas is updated
    };

    canvas.on("object:added", handleObjectChange);
    canvas.on("object:removed", handleObjectChange);
    canvas.on("object:modified", handleObjectChange);
    canvas.on("selection:created", handleObjectChange);
    canvas.on("selection:updated", handleObjectChange);
    canvas.on("selection:cleared", handleObjectChange);

    return () => {
      canvas.off("object:added", handleObjectChange);
      canvas.off("object:removed", handleObjectChange);
      canvas.off("object:modified", handleObjectChange);
      canvas.off("selection:created", handleObjectChange);
      canvas.off("selection:updated", handleObjectChange);
      canvas.off("selection:cleared", handleObjectChange);
    };
  }, [canvas, updateLayers]);

  // Select layer
  const selectLayer = (layer: LayerInfo, multiSelect = false) => {
    if (!canvas) return;

    if (multiSelect) {
      const currentSelection = canvas.getActiveObjects();
      const isSelected = currentSelection.includes(layer.object);

      if (isSelected) {
        // Remove from selection
        const newSelection = currentSelection.filter(
          (obj: any) => obj !== layer.object
        );
        if (newSelection.length === 0) {
          canvas.discardActiveObject();
        } else if (newSelection.length === 1) {
          canvas.setActiveObject(newSelection[0]);
        } else {
          const selection = new (window as any).fabric.ActiveSelection(
            newSelection,
            {
              canvas: canvas,
            }
          );
          canvas.setActiveObject(selection);
        }
      } else {
        // Add to selection
        if (currentSelection.length === 0) {
          canvas.setActiveObject(layer.object);
        } else {
          const newSelection = [...currentSelection, layer.object];
          const selection = new (window as any).fabric.ActiveSelection(
            newSelection,
            {
              canvas: canvas,
            }
          );
          canvas.setActiveObject(selection);
        }
      }
    } else {
      canvas.setActiveObject(layer.object);
    }

    canvas.renderAll();
    onSelectionChange?.(canvas.getActiveObjects());
  };

  // Toggle layer visibility
  const toggleVisibility = (layerId: string) => {
    if (!canvas) return;

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    const newVisible = !layer.visible;
    layer.object.set({ visible: newVisible });
    canvas.renderAll();
    updateLayers();
  };

  // Toggle layer lock
  const toggleLock = (layerId: string) => {
    if (!canvas) return;

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    const newLocked = !layer.locked;
    layer.object.set({
      selectable: !newLocked,
      evented: !newLocked,
    });
    canvas.renderAll();
    updateLayers();
  };

  // Delete layer
  const deleteLayer = (layerId: string) => {
    if (!canvas) return;

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    canvas.remove(layer.object);
    canvas.renderAll();
  };

  // Duplicate layer
  const duplicateLayer = (layerId: string) => {
    if (!canvas) return;

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    layer.object.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
        id: `${layer.id}-copy-${Date.now()}`,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  // Rename layer
  const renameLayer = (layerId: string, newName: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    layer.object.layerName = newName;
    updateLayers();
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayer(layerId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();

    if (!canvas || !draggedLayer || draggedLayer === targetLayerId) {
      setDraggedLayer(null);
      return;
    }

    const draggedLayerInfo = layers.find((l) => l.id === draggedLayer);
    const targetLayerInfo = layers.find((l) => l.id === targetLayerId);

    if (!draggedLayerInfo || !targetLayerInfo) {
      setDraggedLayer(null);
      return;
    }

    // Reorder objects in canvas
    const draggedObject = draggedLayerInfo.object;
    const targetObject = targetLayerInfo.object;

    const draggedIndex = canvas.getObjects().indexOf(draggedObject);
    const targetIndex = canvas.getObjects().indexOf(targetObject);

    if (draggedIndex < targetIndex) {
      // Moving down (toward front)
      for (let i = draggedIndex; i < targetIndex; i++) {
        canvas.bringForward(draggedObject);
      }
    } else {
      // Moving up (toward back)
      for (let i = draggedIndex; i > targetIndex; i--) {
        canvas.sendBackward(draggedObject);
      }
    }

    canvas.renderAll();
    setDraggedLayer(null);
    updateLayers();
  };

  const isLayerSelected = (layer: LayerInfo) => {
    const activeObjects = canvas?.getActiveObjects() || [];
    return activeObjects.includes(layer.object);
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Layers</h3>
        <p className="text-xs text-gray-500 mt-1">
          {layers.length} layer{layers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <Shapes size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No layers</p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {layers.map((layer) => (
              <div
                key={layer.id}
                draggable
                onDragStart={(e) => handleDragStart(e, layer.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, layer.id)}
                className={`group flex items-center px-3 py-2 mx-2 mb-1 rounded cursor-pointer transition-all ${
                  isLayerSelected(layer)
                    ? "bg-blue-100 border border-blue-200"
                    : "hover:bg-gray-50"
                } ${draggedLayer === layer.id ? "opacity-50" : ""}`}
                onClick={(e) => selectLayer(layer, e.ctrlKey || e.metaKey)}
              >
                {/* Drag Handle */}
                <div className="opacity-0 group-hover:opacity-100 mr-2 cursor-move">
                  <GripVertical size={14} className="text-gray-400" />
                </div>

                {/* Layer Icon */}
                <div className="flex-shrink-0 mr-3">
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  {editingLayer === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        renameLayer(layer.id, editingName);
                        setEditingLayer(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameLayer(layer.id, editingName);
                          setEditingLayer(null);
                        }
                        if (e.key === "Escape") {
                          setEditingLayer(null);
                          setEditingName(layer.name);
                        }
                      }}
                      className="w-full px-1 py-0.5 text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                      onDoubleClick={() => {
                        setEditingLayer(layer.id);
                        setEditingName(layer.name);
                      }}
                      title="Double-click to rename"
                    >
                      {layer.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 capitalize">
                    {layer.type}
                  </p>
                </div>

                {/* Layer Controls */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title={layer.visible ? "Hide layer" : "Show layer"}
                  >
                    {layer.visible ? (
                      <Eye size={14} className="text-gray-600" />
                    ) : (
                      <EyeOff size={14} className="text-gray-400" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title={layer.locked ? "Unlock layer" : "Lock layer"}
                  >
                    {layer.locked ? (
                      <Lock size={14} className="text-red-500" />
                    ) : (
                      <Unlock size={14} className="text-gray-600" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Duplicate layer"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete layer"
                  >
                    <Trash2 size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layer Actions */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Drag to reorder</span>
          <span>Ctrl+Click to multi-select</span>
        </div>
      </div>
    </div>
  );
};

export default LayerPanel;
