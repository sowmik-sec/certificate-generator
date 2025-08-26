/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Trash2, Download, Share, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
