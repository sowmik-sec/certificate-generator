"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileBottomPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxHeight?: string;
  enableSwipeGestures?: boolean;
  className?: string;
}

const MobileBottomPanel: React.FC<MobileBottomPanelProps> = ({
  children,
  isOpen,
  onClose,
  title,
  maxHeight = "70vh",
  enableSwipeGestures = true,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  // Handle touch events for swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    setDragY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeGestures || !isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = Math.max(0, currentY - startY.current); // Only allow downward drag
    setDragY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!enableSwipeGestures || !isDragging) return;

    setIsDragging(false);

    // If dragged down more than 100px, close the panel
    if (dragY > 100) {
      onClose();
    }

    setDragY(0);
  };

  // Close panel when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleBackdropClick}
          />

          {/* Bottom Panel */}
          <motion.div
            ref={panelRef}
            initial={{ y: "100%" }}
            animate={{
              y: isDragging ? dragY : 0,
              transition: isDragging
                ? { duration: 0 }
                : { duration: 0.3, ease: "easeOut" },
            }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-50",
              "flex flex-col overflow-hidden",
              className
            )}
            style={{ maxHeight }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              {/* Drag Handle */}
              <div className="w-full flex flex-col items-center">
                {enableSwipeGestures && (
                  <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-2 top-2 h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomPanel;
