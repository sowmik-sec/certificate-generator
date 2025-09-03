/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Trash2, Download, Share, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UndoButton, RedoButton } from "@/components/history-toolbar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useParams } from "next/navigation";
import { getTemplate } from "@/lib/templateMap";
import {
  generateTemplateUrl,
  generateShareableText,
  copyToClipboard,
} from "@/lib/urlUtils";

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
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const templateId = params?.templateId as string;

  const handleShare = async () => {
    if (!templateId) return;

    const template = getTemplate(templateId);
    if (!template) return;

    const url = generateTemplateUrl(templateId);
    const shareText = generateShareableText(template);

    // Try to use native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${template.name} Certificate Template`,
          text: `Create a professional ${template.name} certificate`,
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard copy
        console.log("Native sharing failed, falling back to clipboard");
      }
    }

    // Fallback to copying URL to clipboard
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Undo/Redo Controls */}
      <div className="flex items-center space-x-1 mr-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <UndoButton />
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <RedoButton />
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>Redo</TooltipContent>
        </Tooltip>
      </div>

      {selectedObject && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={deleteSelected}
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>Delete</TooltipContent>
        </Tooltip>
      )}

      {templateId && (
        <Button
          variant="ghost"
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {copied ? <Check size={16} /> : <Share size={16} />}
          <span className="text-sm">{copied ? "Copied!" : "Share"}</span>
        </Button>
      )}

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center space-x-2 bg-gradient-to-r hover:cursor-pointer from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <Download size={18} />
              <span>Export</span>
              <svg
                className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180 duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-[14rem] p-2"
            sideOffset={6}
            style={{ zIndex: 70 }}
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
              Export Options
            </div>

            <DropdownMenuItem
              onClick={exportAsPNG}
              className="w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">PNG Image</div>
                <div className="text-sm text-gray-500">
                  High quality image format
                </div>
              </div>
              <Download size={16} className="text-gray-400" />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={exportAsPDF}
              className="w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">PDF Document</div>
                <div className="text-sm text-gray-500">
                  Perfect for printing
                </div>
              </div>
              <Download size={16} className="text-gray-400" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default HeaderActions;
