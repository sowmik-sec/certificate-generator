"use client";
import React from "react";
import {
  Image as ImageIcon,
  Type,
  Wrench,
  Component,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/useResponsive";

export type EditorMode =
  | "templates"
  | "elements"
  | "text"
  | "tools"
  | "advanced-settings"
  | "position"
  | "effects"
  | "context-menu"
  | null;

interface SidebarNavigationProps {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onImageUpload: () => void;
  hoveredMode: EditorMode;
  setHoveredMode: (mode: EditorMode) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  editorMode,
  setEditorMode,
  onImageUpload,
  hoveredMode,
  setHoveredMode,
}) => {
  const { isMobile } = useResponsive();

  const handleMouseEnter = (mode: EditorMode) => {
    // Disable hover on mobile
    if (!isMobile) {
      setHoveredMode(mode);
    }
  };

  const handleClick = (mode: EditorMode) => {
    // If clicking on the currently hovered mode, toggle it
    if (editorMode === mode) {
      setEditorMode(null);
    } else {
      setEditorMode(mode);
    }
  };

  // Hide sidebar on mobile - will be replaced by bottom toolbar
  if (isMobile) {
    return null;
  }

  return (
    <aside
      className="w-full md:w-20 flex md:flex-col items-center p-2 md:py-4 flex-shrink-0 relative z-30"
      data-sidebar-nav
    >
      <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8 text-[var(--color-sidebar-foreground)]">
        CG
      </div>
      <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-6">
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("templates")}
            onMouseEnter={() => handleMouseEnter("templates")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "templates"
                ? "bg-[var(--color-chart-1)] shadow-md text-[var(--color-sidebar-primary-foreground)] hover:bg-[var(--color-chart-1)]"
                : hoveredMode === "templates"
                ? "bg-[var(--color-sidebar-accent)] shadow-sm text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                : "hover:bg-[var(--color-muted)] text-[var(--color-sidebar-foreground)]"
            }`}
            title="Templates"
          >
            <LayoutTemplate size={24} />
          </Button>
          <span>Design</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("elements")}
            onMouseEnter={() => handleMouseEnter("elements")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "elements"
                ? "bg-[var(--color-chart-2)] shadow-md text-[var(--color-sidebar-primary-foreground)] hover:bg-[var(--color-chart-2)]"
                : hoveredMode === "elements"
                ? "bg-[var(--color-sidebar-accent)] shadow-sm text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                : "hover:bg-[var(--color-muted)] text-[var(--color-sidebar-foreground)]"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </Button>

          <span>Elements</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("text")}
            onMouseEnter={() => handleMouseEnter("text")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "text"
                ? "bg-[var(--color-chart-3)] shadow-md text-[var(--color-sidebar-primary-foreground)] hover:bg-[var(--color-chart-3)]"
                : hoveredMode === "text"
                ? "bg-[var(--color-sidebar-accent)] shadow-sm text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                : "hover:bg-[var(--color-muted)] text-[var(--color-sidebar-foreground)]"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </Button>
          <span>Text</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={() => handleClick("tools")}
            onMouseEnter={() => handleMouseEnter("tools")}
            variant="ghost"
            size="icon"
            className={`p-2 rounded-lg hover:cursor-pointer transition-all duration-200 ${
              editorMode === "tools"
                ? "bg-[var(--color-chart-4)] shadow-md text-[var(--color-sidebar-primary-foreground)] hover:bg-[var(--color-chart-4)]"
                : hoveredMode === "tools"
                ? "bg-[var(--color-sidebar-accent)] shadow-sm text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                : "hover:bg-[var(--color-muted)] text-[var(--color-sidebar-foreground)]"
            }`}
            title="Tools"
          >
            <Wrench size={24} />
          </Button>
          <span>Tools</span>
        </div>
        <div className="flex items-center justify-center flex-col">
          <Button
            onClick={onImageUpload}
            variant="ghost"
            size="icon"
            className="p-2 rounded-lg hover:cursor-pointer hover:bg-[var(--color-muted)] transition-all duration-200 text-[var(--color-sidebar-foreground)]"
            title="Add Image"
          >
            <ImageIcon size={24} />
          </Button>
          <span>Uploads</span>
        </div>
      </nav>
    </aside>
  );
};

export default SidebarNavigation;
