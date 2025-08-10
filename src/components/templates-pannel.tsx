"use client";
import { classicTemplate } from "@/templates/classic-template";
import { floralTemplate } from "@/templates/floral-template";
import { modernTemplate } from "@/templates/modern-template";
import { playfulTemplate } from "@/templates/playful-template";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TemplatesPanelProps {
  onSelectTemplate: (template: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onSelectTemplate,
  onImageUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templates = [
    { name: "Modern", json: modernTemplate },
    { name: "Classic", json: classicTemplate },
    { name: "Playful", json: playfulTemplate },
    { name: "Floral", json: floralTemplate },
  ];
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
      <h3 className="text-lg font-semibold my-4 pt-4 border-t">
        Or Choose a Template
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.name}
            className="border rounded-lg p-2 cursor-pointer hover:shadow-md bg-white"
            onClick={() => onSelectTemplate(template.json)}
          >
            <div className="h-32 bg-gray-300 flex items-center justify-center text-gray-500">
              {template.name} Certificate
            </div>
            <p className="text-center mt-2 text-sm text-gray-800">
              {template.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPanel;
