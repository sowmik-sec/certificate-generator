"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UndoRedoButtonsProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabels?: boolean;
}

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  className,
  variant = "outline",
  size = "icon",
  showLabels = false,
}) => {
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={undo}
            disabled={!canUndo}
            className={cn("transition-all duration-200", {
              "opacity-50 cursor-not-allowed": !canUndo,
            })}
          >
            <Undo2 className="h-4 w-4" />
            {showLabels && <span className="ml-2">Undo</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={redo}
            disabled={!canRedo}
            className={cn("transition-all duration-200", {
              "opacity-50 cursor-not-allowed": !canRedo,
            })}
          >
            <Redo2 className="h-4 w-4" />
            {showLabels && <span className="ml-2">Redo</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>
    </div>
  );
};

// Separate components for individual buttons if needed
export const UndoButton: React.FC<
  Omit<UndoRedoButtonsProps, "showLabels"> & { showLabel?: boolean }
> = ({ className, variant = "outline", size = "icon", showLabel = false }) => {
  const { canUndo, undo } = useHistoryStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={undo}
          disabled={!canUndo}
          className={cn("transition-all duration-200", className, {
            "opacity-50 cursor-not-allowed": !canUndo,
          })}
        >
          <Undo2 className="h-4 w-4" />
          {showLabel && <span className="ml-2">Undo</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
    </Tooltip>
  );
};

export const RedoButton: React.FC<
  Omit<UndoRedoButtonsProps, "showLabels"> & { showLabel?: boolean }
> = ({ className, variant = "outline", size = "icon", showLabel = false }) => {
  const { canRedo, redo } = useHistoryStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={redo}
          disabled={!canRedo}
          className={cn("transition-all duration-200", className, {
            "opacity-50 cursor-not-allowed": !canRedo,
          })}
        >
          <Redo2 className="h-4 w-4" />
          {showLabel && <span className="ml-2">Redo</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
    </Tooltip>
  );
};
