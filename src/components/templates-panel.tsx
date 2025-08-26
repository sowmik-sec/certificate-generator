"use client";
import { classicTemplate } from "@/templates/classic-template";
import { modernTemplate } from "@/templates/modern-template";
import { playfulTemplate } from "@/templates/playful-template";
import { elegantTemplate } from "@/templates/elegant-template";
import { minimalistTemplate } from "@/templates/minimalist-template";
import { corporateTemplate } from "@/templates/corporate-template";
import { luxuryTemplate } from "@/templates/luxury-template";
import { techTemplate } from "@/templates/tech-template";
import { creativeTemplate } from "@/templates/creative-template";
import { vintageTemplate } from "@/templates/vintage-template";
import { professionalTemplate } from "@/templates/professional-template";
import { academicTemplate } from "@/templates/academic-template";
import { achievementTemplate } from "@/templates/achievement-template";
import { artisticTemplate } from "@/templates/artistic-template";
import { ImageIcon, Palette } from "lucide-react";
import { useRef } from "react";
import { useTemplatesStore } from "@/stores/useTemplatesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use zustand store for templates state
  const { backgroundColor, setBackgroundColor } = useTemplatesStore();

  const templates = [
    {
      name: "Blank Canvas",
      json: {
        version: "5.3.1",
        objects: [],
        background: backgroundColor,
      },
    },
    { name: "Modern", json: modernTemplate },
    { name: "Classic", json: classicTemplate },
    { name: "Playful", json: playfulTemplate },
    { name: "Elegant", json: elegantTemplate },
    { name: "Minimalist", json: minimalistTemplate },
    { name: "Corporate", json: corporateTemplate },
    { name: "Luxury", json: luxuryTemplate },
    { name: "Tech", json: techTemplate },
    { name: "Creative", json: creativeTemplate },
    { name: "Vintage", json: vintageTemplate },
    { name: "Professional", json: professionalTemplate },
    { name: "Academic", json: academicTemplate },
    { name: "Achievement", json: achievementTemplate },
    { name: "Artistic", json: artisticTemplate },
  ];

  const handleTemplateSelect = (templateJson: any) => {
    // Create a copy of the template with custom background color
    const customTemplate = {
      ...templateJson,
      background: backgroundColor,
    };
    onSelectTemplate(customTemplate);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    if (canvas) {
      canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
    }
  };
  return (
    <div>
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <h3 className="font-semibold text-blue-800 mb-2">
            ✨ Use Your Own Template
          </h3>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onImageUpload}
            className="hidden text-gray-700"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-purple-400 hover:bg-purple-800 hover:cursor-pointer flex items-center justify-center space-x-2"
          >
            <ImageIcon size={16} />
            <span>Upload an Image</span>
          </Button>
        </CardContent>
      </Card>{" "}
      {/* Background Color Selector */}
      <Card className="mb-6 bg-purple-50 border-purple-200">
        <CardContent className="p-3">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
            <Palette size={16} className="mr-2" />
            Background Color
          </h3>
          <div className="space-y-3">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background cursor-pointer"
            />
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
                <Button
                  key={color}
                  onClick={() => handleBackgroundColorChange(color)}
                  variant="outline"
                  className={`w-8 h-8 p-0 rounded border-2 ${
                    backgroundColor === color
                      ? "border-purple-500"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <h3 className="text-lg font-semibold my-4 pt-4 border-t">
        Choose a Template
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.name}
            className="p-2 cursor-pointer hover:shadow-md transition-all"
            onClick={() => handleTemplateSelect(template.json)}
          >
            <div
              className={`h-24 flex items-center justify-center text-gray-500 rounded text-xs ${
                template.name === "Blank Canvas"
                  ? "bg-gray-100 border-2 border-dashed border-gray-300"
                  : "bg-gray-300"
              }`}
            >
              {template.name === "Blank Canvas" ? (
                <div className="text-center">
                  <div className="text-lg mb-1">📄</div>
                  <div className="text-xs">Start Fresh</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-xs font-medium">{template.name}</div>
                  <div className="text-xs opacity-70">Certificate</div>
                </div>
              )}
            </div>
            <p className="text-center mt-1 text-xs text-gray-800 font-medium truncate">
              {template.name}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPanel;
