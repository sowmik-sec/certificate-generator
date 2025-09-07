/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Frame, Search, Type } from "lucide-react";

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
      color: "var(--color-foreground)",
      fontFamily: "Arial Black",
    },
    {
      id: 2,
      preview: "brand",
      subtitle: "IDENTITY",
      titleStyle: "text-2xl font-light text-[var(--color-primary)]",
      subtitleStyle:
        "text-sm font-medium text-[var(--color-muted-foreground)] tracking-widest",
      fontSize: 28,
      fontWeight: "300",
      color: "var(--color-primary)",
      subtitleFontSize: 14,
      subtitleFontWeight: "500",
      subtitleColor: "var(--color-muted-foreground)",
      fontFamily: "Arial",
    },
    {
      id: 3,
      preview: "user",
      subtitle: "FLOW",
      titleStyle: "text-xl font-light italic text-[var(--color-foreground)]",
      subtitleStyle: "text-2xl font-black text-[var(--color-foreground)]",
      fontSize: 24,
      fontWeight: "300",
      color: "var(--color-foreground)",
      subtitleFontSize: 32,
      subtitleFontWeight: "900",
      subtitleColor: "var(--color-foreground)",
      fontFamily: "Arial",
    },
    {
      id: 4,
      preview: "Net",
      subtitle: "REVENUE",
      titleStyle:
        "text-2xl font-light italic text-[var(--color-muted-foreground)]",
      subtitleStyle:
        "text-lg font-black text-[var(--color-destructive)] tracking-wider",
      fontSize: 28,
      fontWeight: "300",
      color: "var(--color-muted-foreground)",
      subtitleFontSize: 20,
      subtitleFontWeight: "900",
      subtitleColor: "var(--color-destructive)",
      fontFamily: "Arial",
    },
    {
      id: 5,
      preview: "BULK",
      subtitle: "DEAL",
      titleStyle: "text-3xl font-black text-[var(--color-primary)]",
      subtitleStyle: "text-xl font-black text-[var(--color-destructive)]",
      fontSize: 36,
      fontWeight: "900",
      color: "var(--color-primary)",
      subtitleFontSize: 24,
      subtitleFontWeight: "900",
      subtitleColor: "var(--color-destructive)",
      fontFamily: "Arial Black",
    },
    {
      id: 6,
      preview: "TEAM",
      subtitle: "EFFORT",
      titleStyle:
        "text-sm font-medium text-[var(--color-muted-foreground)] tracking-[0.3em]",
      subtitleStyle: "text-xl font-black text-[var(--color-destructive)]",
      fontSize: 16,
      fontWeight: "500",
      color: "var(--color-muted-foreground)",
      subtitleFontSize: 24,
      subtitleFontWeight: "900",
      subtitleColor: "var(--color-destructive)",
      fontFamily: "Arial",
    },
    {
      id: 7,
      preview: "modern",
      subtitle: "STYLE",
      titleStyle: "text-xl font-thin text-[var(--color-foreground)]",
      subtitleStyle:
        "text-sm font-bold text-[var(--color-destructive)] tracking-wider",
      fontSize: 24,
      fontWeight: "100",
      color: "var(--color-foreground)",
      subtitleFontSize: 16,
      subtitleFontWeight: "700",
      subtitleColor: "var(--color-destructive)",
      fontFamily: "Arial",
    },
    {
      id: 8,
      preview: "BOLD",
      subtitle: "impact",
      titleStyle: "text-2xl font-black text-[var(--color-destructive)]",
      subtitleStyle:
        "text-lg font-light italic text-[var(--color-muted-foreground)]",
      fontSize: 28,
      fontWeight: "900",
      color: "var(--color-destructive)",
      subtitleFontSize: 20,
      subtitleFontWeight: "300",
      subtitleColor: "var(--color-muted-foreground)",
      fontFamily: "Arial Black",
    },
  ];
  const FrameIcon = ({ className }: { className?: string }) => (
    <Frame className={className} />
  );

  return (
    <div className="h-full flex flex-col bg-[var(--color-background)]">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[var(--color-background)] border-b border-[var(--color-border)] z-10 p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--color-muted-foreground)]" />
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => addBodyText()}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:cursor-pointer py-3 px-4 font-medium flex items-center justify-center space-x-2"
            >
              <Type className="w-5 h-5" />
              <span>Add a text box</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a customizable text box to your design</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="h-[600px] w-full">
        <TooltipProvider>
          <div className="p-4 space-y-8">
            {/* Default Text Styles Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[var(--color-foreground)]">
                  Default text styles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Heading */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => addHeading()}
                      variant="outline"
                      className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
                    >
                      <div className="text-3xl font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                        Add a heading
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a large heading text to your design</p>
                  </TooltipContent>
                </Tooltip>

                {/* Subheading */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => addSubheading()}
                      variant="outline"
                      className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
                    >
                      <div className="text-xl font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                        Add a subheading
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a medium subheading text to your design</p>
                  </TooltipContent>
                </Tooltip>

                {/* Body Text */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => addBodyText()}
                      variant="outline"
                      className="w-full p-4 h-auto text-left justify-start hover:cursor-pointer"
                    >
                      <div className="text-sm text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                        Add a little bit of body text
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add regular body text to your design</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            <Separator />

            {/* Dynamic Text Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[var(--color-foreground)]">
                  Dynamic text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={addPageNumber}
                      variant="outline"
                      className="p-0 h-auto w-full hover:cursor-pointer"
                    >
                      <div className="flex items-center p-3 space-x-4 w-full max-w-xs cursor-pointer hover:bg-[var(--color-muted)] transition-colors duration-200">
                        {/* Icon Container */}
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-destructive)] shadow-md border-2 border-[var(--color-accent)]">
                          {/* Bottom right number '2' */}
                          <span className="absolute bottom-1 right-2 text-2xl font-bold text-[var(--color-primary-foreground)]">
                            2
                          </span>

                          {/* Top left box with icon and number '1' */}
                          <div className="absolute top-1 left-1 w-8 h-8 bg-[var(--color-destructive)] rounded-sm flex items-center justify-center">
                            <div className="relative w-full h-full">
                              <FrameIcon className="absolute inset-0 w-full h-full text-[var(--color-primary-foreground)] opacity-70" />
                              <span className="absolute inset-0 flex items-center justify-center text-[var(--color-primary-foreground)] font-bold text-sm">
                                1
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Text Label */}
                        <p className="font-semibold text-[var(--color-muted-foreground)] text-lg">
                          Page numbers
                        </p>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add automatic page numbering to your design</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            <Separator />

            {/* Font Combinations Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[var(--color-foreground)]">
                  Font combinations
                </CardTitle>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Click any combination to add both texts to your design
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {fontCombinations.map((combo) => (
                    <Tooltip key={combo.id}>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => addFontCombination(combo)}
                          variant="outline"
                          className="relative p-4 h-auto text-left justify-start group hover:cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div
                              className={`${
                                combo.titleStyle || "font-bold text-xl"
                              } text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate`}
                            >
                              {combo.preview}
                            </div>
                            {combo.subtitle && (
                              <div
                                className={`${
                                  combo.subtitleStyle ||
                                  "text-sm text-[var(--color-muted-foreground)]"
                                } group-hover:text-[var(--color-destructive)] transition-colors truncate`}
                              >
                                {combo.subtitle}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 text-xs"
                          >
                            {combo.id}
                          </Badge>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Add &quot;{combo.preview}&quot;{" "}
                          {combo.subtitle &&
                            `with &quot;${combo.subtitle}&quot;`}{" "}
                          to your design
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>
      </ScrollArea>
    </div>
  );
};

export default TextPanel;
