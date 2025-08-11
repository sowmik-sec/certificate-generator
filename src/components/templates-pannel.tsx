"use client";
import { classicTemplate } from "@/templates/classic-template";
import { modernTemplate } from "@/templates/modern-template";
import { playfulTemplate } from "@/templates/playful-template";
import { ImageIcon, Palette } from "lucide-react";
import { useRef, useState } from "react";

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
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  
  const templates = [
    { name: "Modern", json: modernTemplate },
    { name: "Classic", json: classicTemplate },
    { name: "Playful", json: playfulTemplate },
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
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ImageIcon size={16} />
          <span>Upload an Image</span>
        </button>
      </div>
      
      {/* Background Color Selector */}
      <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
          <Palette size={16} className="mr-2" />
          Background Color
        </h3>
        <div className="space-y-3">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="w-full h-10 rounded-md border border-purple-300 cursor-pointer"
          />
          <div className="flex flex-wrap gap-2">
            {[
              '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
              '#fdf5e6', '#fff8dc', '#f0f8ff', '#f5f5f5',
              '#ffe4e1', '#f0fff0', '#f5f5dc', '#ffefd5'
            ].map((color) => (
              <button
                key={color}
                onClick={() => handleBackgroundColorChange(color)}
                className={`w-8 h-8 rounded border-2 ${
                  backgroundColor === color ? 'border-purple-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold my-4 pt-4 border-t">
        Choose a Template
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.name}
            className="border rounded-lg p-2 cursor-pointer hover:shadow-md bg-white transition-all"
            onClick={() => handleTemplateSelect(template.json)}
          >
            <div className="h-32 bg-gray-300 flex items-center justify-center text-gray-500 rounded">
              {template.name} Certificate
            </div>
            <p className="text-center mt-2 text-sm text-gray-800 font-medium">
              {template.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPanel;
