/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextPanelProps {
  addHeading: (options?: object) => void;
  addSubheading: (options?: object) => void;
  addBodyText: (options?: object) => void;
  addText: (text: string, options?: object) => void;
  canvas?: any;
}

const TextPanel: React.FC<TextPanelProps> = ({
  addHeading,
  addSubheading,
  addBodyText,
  addText,
  canvas,
}) => {
  const [searchText, setSearchText] = useState("");

  // Function to add page number at bottom right
  const addPageNumber = () => {
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const margin = 40; // 40px margin from edges

    // Create page number text positioned at bottom right
    addText("1", {
      fontSize: 18,
      fontWeight: "normal",
      fontFamily: "Arial",
      fill: "#666666",
      left: canvasWidth - margin - 30, // Position near right edge
      top: canvasHeight - margin - 25, // Position near bottom edge
    });
  };

  // Function to add font combination text
  const addFontCombination = (combo: any) => {
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Add main text centered
    addText(combo.preview, {
      fontSize: combo.fontSize || 32,
      fontWeight: combo.fontWeight || "bold",
      fontFamily: combo.fontFamily || "Arial",
      fill: combo.color || "#000000",
      left: canvasWidth / 2 - 100, // Approximate center
      top: canvasHeight / 2 - 30,
    });

    // Add subtitle if exists
    if (combo.subtitle) {
      addText(combo.subtitle, {
        fontSize: combo.subtitleFontSize || 18,
        fontWeight: combo.subtitleFontWeight || "normal",
        fontFamily: combo.subtitleFontFamily || "Arial",
        fill: combo.subtitleColor || "#666666",
        left: canvasWidth / 2 - 80, // Approximate center
        top: canvasHeight / 2 + 10,
      });
    }
  };

  // Font combination data
  const fontCombinations = [
    {
      id: 1,
      preview: "ITEM",
      subtitle: "",
      titleStyle: "font-black text-2xl tracking-tight",
      subtitleStyle: "",
      fontSize: 32,
      fontWeight: "900",
      color: "#000000",
      fontFamily: "Arial Black",
    },
    {
      id: 2,
      preview: "brand",
      subtitle: "IDENTITY",
      titleStyle: "text-2xl font-light text-purple-600",
      subtitleStyle: "text-sm font-medium text-gray-600 tracking-widest",
      fontSize: 28,
      fontWeight: "300",
      color: "#9333ea",
      subtitleFontSize: 14,
      subtitleFontWeight: "500",
      subtitleColor: "#6b7280",
      fontFamily: "Arial",
    },
    {
      id: 3,
      preview: "user",
      subtitle: "FLOW",
      titleStyle: "text-xl font-light italic text-gray-800",
      subtitleStyle: "text-2xl font-black text-gray-900",
      fontSize: 24,
      fontWeight: "300",
      color: "#1f2937",
      subtitleFontSize: 32,
      subtitleFontWeight: "900",
      subtitleColor: "#111827",
      fontFamily: "Arial",
    },
    {
      id: 4,
      preview: "Net",
      subtitle: "REVENUE",
      titleStyle: "text-2xl font-light italic text-gray-700",
      subtitleStyle: "text-lg font-black text-blue-600 tracking-wider",
      fontSize: 28,
      fontWeight: "300",
      color: "#374151",
      subtitleFontSize: 20,
      subtitleFontWeight: "900",
      subtitleColor: "#2563eb",
      fontFamily: "Arial",
    },
    {
      id: 5,
      preview: "BULK",
      subtitle: "DEAL",
      titleStyle: "text-3xl font-black text-purple-700",
      subtitleStyle: "text-xl font-black text-blue-900",
      fontSize: 36,
      fontWeight: "900",
      color: "#7c3aed",
      subtitleFontSize: 24,
      subtitleFontWeight: "900",
      subtitleColor: "#1e3a8a",
      fontFamily: "Arial Black",
    },
    {
      id: 6,
      preview: "TEAM",
      subtitle: "EFFORT",
      titleStyle: "text-sm font-medium text-gray-500 tracking-[0.3em]",
      subtitleStyle: "text-xl font-black text-green-600",
      fontSize: 16,
      fontWeight: "500",
      color: "#6b7280",
      subtitleFontSize: 24,
      subtitleFontWeight: "900",
      subtitleColor: "#059669",
      fontFamily: "Arial",
    },
    {
      id: 7,
      preview: "modern",
      subtitle: "STYLE",
      titleStyle: "text-xl font-thin text-gray-900",
      subtitleStyle: "text-sm font-bold text-pink-600 tracking-wider",
      fontSize: 24,
      fontWeight: "100",
      color: "#111827",
      subtitleFontSize: 16,
      subtitleFontWeight: "700",
      subtitleColor: "#db2777",
      fontFamily: "Arial",
    },
    {
      id: 8,
      preview: "BOLD",
      subtitle: "impact",
      titleStyle: "text-2xl font-black text-red-600",
      subtitleStyle: "text-lg font-light italic text-gray-700",
      fontSize: 28,
      fontWeight: "900",
      color: "#dc2626",
      subtitleFontSize: 20,
      subtitleFontWeight: "300",
      subtitleColor: "#374151",
      fontFamily: "Arial Black",
    },
  ];
  const FrameIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-4" />
      <path d="M2 12H6" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <rect width="16" height="16" x="4" y="4" rx="2" />
    </svg>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search fonts and combinations"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4"
          />
        </div>

        {/* Add Text Box Button */}
        <Button
          onClick={() => addBodyText()}
          className="w-full bg-purple-400 hover:bg-purple-800 hover:cursor-pointer py-3 px-4 font-medium flex items-center justify-center space-x-2"
        >
          <span className="text-xl">T</span>
          <span>Add a text box</span>
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="h-[600px] w-full">
        <div className="p-4 space-y-8">
          {/* Default Text Styles Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Default text styles
            </h3>

            {/* Heading */}
            <Button
              onClick={() => addHeading()}
              variant="outline"
              className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
            >
              <div className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Add a heading
              </div>
            </Button>

            {/* Subheading */}
            <Button
              onClick={() => addSubheading()}
              variant="outline"
              className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
            >
              <div className="text-xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                Add a subheading
              </div>
            </Button>

            {/* Body Text */}
            <Button
              onClick={() => addBodyText()}
              variant="outline"
              className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
            >
              <div className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                Add a little bit of body text
              </div>
            </Button>
          </div>

          {/* Dynamic Text Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Dynamic text
            </h2>
            <Button
              onClick={addPageNumber}
              variant="outline"
              className="p-0 h-auto w-full hover:cursor-pointer"
            >
              <div className="flex items-center p-3 space-x-4 w-full max-w-xs cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                {/* Icon Container */}
                <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-orange-400 to-red-600 shadow-md border-2 border-yellow-200">
                  {/* Bottom right number '2' */}
                  <span className="absolute bottom-1 right-2 text-2xl font-bold text-white">
                    2
                  </span>

                  {/* Top left box with icon and number '1' */}
                  <div className="absolute top-1 left-1 w-8 h-8 bg-red-900 rounded-sm flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <FrameIcon className="absolute inset-0 w-full h-full text-white opacity-70" />
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                        1
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Label */}
                <p className="font-semibold text-gray-700 text-lg">
                  Page numbers
                </p>
              </div>
            </Button>
          </div>

          {/* Font Combinations Section */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Font combinations
            </h3>
            <p className="text-xs text-gray-500">
              Click any combination to add both texts to your design
            </p>

            <div className="grid grid-cols-2 gap-3">
              {fontCombinations.map((combo) => (
                <Button
                  key={combo.id}
                  onClick={() => addFontCombination(combo)}
                  variant="outline"
                  className="relative p-4 h-auto text-left justify-start group hover:cursor-pointer"
                >
                  <div className="space-y-1">
                    <div
                      className={`${
                        combo.titleStyle || "font-bold text-xl"
                      } text-gray-900 group-hover:text-purple-600 transition-colors truncate`}
                    >
                      {combo.preview}
                    </div>
                    {combo.subtitle && (
                      <div
                        className={`${
                          combo.subtitleStyle || "text-sm text-gray-600"
                        } group-hover:text-purple-500 transition-colors truncate`}
                      >
                        {combo.subtitle}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TextPanel;
