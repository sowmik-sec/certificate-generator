"use client";
import { useRouter } from "next/navigation";
import { getAllTemplates } from "@/lib/templateMap";
import { Palette, Upload, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useTemplatesStore } from "@/stores/useTemplatesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HexColorPicker } from "react-colorful";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TemplatesPanelProps {
  onSelectTemplate: (template: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canvas?: any;
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onSelectTemplate,
  onImageUpload,
  canvas,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use zustand store for templates state
  const { backgroundColor, setBackgroundColor } = useTemplatesStore();

  const templates = getAllTemplates();

  const handleTemplateSelect = (templateJson: any, templateId?: string) => {
    if (templateId) {
      // Navigate to the template editor route
      router.push(`/design/${templateId}/edit`);
    } else {
      // Fallback to the current method for custom templates
      const customTemplate = {
        ...templateJson,
        background: backgroundColor,
      };
      onSelectTemplate(customTemplate);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    if (canvas) {
      canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-background)]">
      <TooltipProvider>
        <div className="p-4 space-y-6">
          {/* Custom Template Upload Section */}
          <Card className="bg-[var(--color-primary)] border-[var(--color-primary)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-primary-foreground)] flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Use Your Own Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onImageUpload}
                className="hidden"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/80 hover:cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Upload an Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload your own image to use as a template</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>

          <Separator />

          {/* Background Color Selector */}
          <Card className="bg-[var(--color-secondary)] border-[var(--color-accent)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-accent-foreground)] flex items-center gap-2">
                <Palette size={16} />
                Background Color
                <Badge variant="outline" className="ml-auto">
                  {backgroundColor}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] overflow-hidden">
                <HexColorPicker
                  color={backgroundColor}
                  onChange={handleBackgroundColorChange}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "#ffffff",
                  "#f8f9fa",
                  "#e9ecef",
                  "#dee2e6",
                  "#fdf5e6",
                  "#fff8dc",
                  "#f0f8ff",
                  "#f5f5f5",
                  "#ffe4e1",
                  "#f0fff0",
                  "#f5f5dc",
                  "#ffefd5",
                ].map((color) => (
                  <Tooltip key={color}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleBackgroundColorChange(color)}
                        variant="outline"
                        className={`w-8 h-8 p-0 rounded border-2 ${
                          backgroundColor === color
                            ? "border-[var(--color-primary)]"
                            : "border-[var(--color-border)]"
                        } hover:cursor-pointer`}
                        style={{ backgroundColor: color }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set background to {color}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Templates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                Choose a Template
              </h3>
              <Badge variant="secondary">{templates.length} templates</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <Tooltip key={template.id}>
                  <TooltipTrigger asChild>
                    <Card
                      className="p-2 cursor-pointer hover:shadow-md transition-all hover:cursor-pointer"
                      onClick={() =>
                        handleTemplateSelect(template.json, template.id)
                      }
                    >
                      <div
                        className={`h-24 flex items-center justify-center text-[var(--color-muted-foreground)] rounded text-xs ${
                          template.id === "blank"
                            ? "bg-[var(--color-muted)] border-2 border-dashed border-[var(--color-border)]"
                            : "bg-[var(--color-secondary)]"
                        }`}
                      >
                        {template.id === "blank" ? (
                          <div className="text-center">
                            <div className="text-lg mb-1">📄</div>
                            <div className="text-xs">Start Fresh</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-xs font-medium">
                              {template.name}
                            </div>
                            <div className="text-xs opacity-70">
                              Certificate
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-center mt-1 text-xs text-[var(--color-foreground)] font-medium truncate">
                        {template.name}
                      </p>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {template.id === "blank"
                        ? "Start with a blank canvas"
                        : `Use the ${template.name} template`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default TemplatesPanel;
