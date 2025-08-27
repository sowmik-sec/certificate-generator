"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Undo2, Redo2 } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";

/**
 * Undo button component with tooltip and keyboard shortcut display
 * Disabled when not available exactly as specified
 */
export const UndoButton: React.FC = () => {
  const { undo, canUndo } = useHistory();

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcut = isMac ? "⌘Z" : "Ctrl+Z";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
          >
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo ({shortcut})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Redo button component with tooltip and keyboard shortcut display
 * Disabled when not available exactly as specified
 */
export const RedoButton: React.FC = () => {
  const { redo, canRedo } = useHistory();

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcut = isMac ? "⌘⇧Z" : "Ctrl+Shift+Z";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
          >
            <Redo2 className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo ({shortcut})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Example Toolbar with undo/redo buttons wired to the hook exactly as requested
 */
export const HistoryToolbar: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <UndoButton />
      <RedoButton />
    </div>
  );
};
