/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  Group,
  Ungroup,
  MoveUp,
  MoveDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";

interface LayerControlsProps {
  selectedObjects: any[];
  groupObjects: () => void;
  ungroupObjects: () => void;
  bringToFront: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  sendToBack: () => void;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  selectedObjects,
  groupObjects,
  ungroupObjects,
  bringToFront,
  bringForward,
  sendBackward,
  sendToBack,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {selectedObjects.length > 1 && (
        <Button
          onClick={groupObjects}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Group Objects"
        >
          <Group size={16} />
          <span className="text-sm">Group</span>
        </Button>
      )}
      {selectedObjects.length === 1 && selectedObjects[0]?.type === "group" && (
        <Button
          onClick={ungroupObjects}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Ungroup Objects"
        >
          <Ungroup size={16} />
          <span className="text-sm">Ungroup</span>
        </Button>
      )}
      {selectedObjects.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-300"></div>
          <Button
            onClick={bringToFront}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Bring to Front"
          >
            <MoveUp size={16} />
          </Button>
          <Button
            onClick={bringForward}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Bring Forward"
          >
            <ChevronUp size={16} />
          </Button>
          <Button
            onClick={sendBackward}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Send Backward"
          >
            <ChevronDown size={16} />
          </Button>
          <Button
            onClick={sendToBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Send to Back"
          >
            <MoveDown size={16} />
          </Button>
        </>
      )}
    </div>
  );
};

export default LayerControls;
