/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { ArrowLeft, Download, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileHeaderProps {
  selectedObject?: any;
  deleteSelected?: () => void;
  exportAsPNG?: () => void;
  exportAsPDF?: () => void;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  selectedObject,
  deleteSelected,
  exportAsPNG,
  exportAsPDF,
  className,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 px-4 py-2 flex items-center justify-between ${className}`}
    >
      {/* Left side - Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="h-10 w-10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Center - Title */}
      <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 mx-4 text-center">
        Certificate Editor
      </h1>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Export */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={exportAsPNG}
          className="h-10 w-10"
          title="Export as PNG"
        >
          <Download className="h-5 w-5" />
        </Button> */}

        {/* More actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={exportAsPNG}>
              <Download className="mr-2 h-4 w-4" />
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            {selectedObject && (
              <DropdownMenuItem onClick={deleteSelected}>
                Delete Selected
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default MobileHeader;
