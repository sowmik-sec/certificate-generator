"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Type,
  Wrench,
  Component,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorMode } from "@/components/sidebar-navigation";

interface MobileToolbarProps {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onImageUpload: () => void;
  isVisible?: boolean;
  className?: string;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  editorMode,
  setEditorMode,
  onImageUpload,
  isVisible = true,
  className,
}) => {
  const [isScrollable] = useState(false);

  const toolbarItems = [
    {
      id: "templates",
      label: "Design",
      icon: LayoutTemplate,
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600",
    },
    {
      id: "elements",
      label: "Elements",
      icon: Component,
      color: "bg-green-500",
      lightColor: "bg-green-50 text-green-600",
    },
    {
      id: "text",
      label: "Text",
      icon: Type,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50 text-yellow-600",
    },
    {
      id: "tools",
      label: "Tools",
      icon: Wrench,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "upload",
      label: "Upload",
      icon: ImageIcon,
      color: "bg-purple-500",
      lightColor: "bg-purple-50 text-purple-600",
      isAction: true,
    },
  ];

  const handleItemClick = (item: (typeof toolbarItems)[0]) => {
    if (item.isAction && item.id === "upload") {
      onImageUpload();
    } else if (item.id === editorMode) {
      // If clicking the same mode, close panel
      setEditorMode(null);
    } else {
      setEditorMode(item.id as EditorMode);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Toolbar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40",
          "flex items-center justify-center py-2 px-4",
          "shadow-lg",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 w-full max-w-md justify-center",
            isScrollable && "overflow-x-auto scrollbar-hide"
          )}
        >
          {toolbarItems.map((item) => {
            const Icon = item.icon;
            const isActive = editorMode === item.id;

            return (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center min-w-0 flex-1"
              >
                <Button
                  onClick={() => handleItemClick(item)}
                  variant="ghost"
                  className={cn(
                    "h-12 w-12 rounded-xl p-2 mb-1 transition-all duration-200",
                    "flex flex-col items-center justify-center",
                    isActive
                      ? `${item.lightColor} shadow-sm border border-current/20`
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-current" : "text-gray-600"
                    )}
                  />
                </Button>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors duration-200 text-center",
                    isActive ? item.lightColor.split(" ")[1] : "text-gray-500"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default MobileToolbar;
