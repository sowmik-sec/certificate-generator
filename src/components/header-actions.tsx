/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderActionsProps {
  selectedObject: any;
  deleteSelected: () => void;
  exportAsPNG: () => void;
  exportAsPDF: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  selectedObject,
  deleteSelected,
  exportAsPNG,
  exportAsPDF,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {selectedObject && (
        <Button
          variant="ghost"
          size="icon"
          onClick={deleteSelected}
          className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
        </Button>
      )}
      <Button
        onClick={exportAsPNG}
        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Download size={20} />
        <span>Export PNG</span>
      </Button>
      <Button
        onClick={exportAsPDF}
        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
      >
        <Download size={20} />
        <span>Export PDF</span>
      </Button>
    </div>
  );
};

export default HeaderActions;
