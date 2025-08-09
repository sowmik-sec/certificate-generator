"use client";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
const floralCornerSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNTAsMEMyMi40LDAsMCwyMi40LDAsNTBjMCwxMy44LDExLjIsMjUsMjUsMjVjMTMuOCwwLDI1LTExLjIsMjUtMjVjMC0xMy44LTExLjItMjUtMjUtMjV6IE0yNSw2Mi41Yy02LjksMC0xMi41LTUuNi0xMi41LTEyLjVzNS42LTEyLjUsMTIuNS0xMi41czEyLjUsNS42LDEyLjUsMTIuNVMzMS45LDYyLjUsMjUsNjIuNXoiIGZpbGw9IiM4YmMzNDkiLz48cGF0aCBkPSJNMTAwLDUwYzAtMjcuNi0yMi40LTUwLTUwLTUwcy01MCwyMi40LTUwLDUwYzAsMTMuOCwxMS4yLDI1LDI1LDI1czI1LTExLjIsMjUtMjVjMC0xMy44LTExLjItMjUtMjUtMjVzLTI1LDExLjItMjUsMjVjMCw2LjksNS42LDEyLjUsMTIuNSwxMi41czEyLjUtNS42LDEyLjUtMTIuNVM1Ni45LDM3LjUsNTAsMzcuNVMzNy41LDQzLjEsMzcuNSw1MHM1LjYsMTIuNSwxMi41LDEyLjVTNzUsNTYuOSw3NSw1MFM2OC4xLDM3LjUsNjAuNSwzNy41Yy02LjksMC0xMi41LDUuNi0xMi41LDEyLjVjMCw2LjksNS42LDEyLjUsMTIuNSwxMi41YzYuOSwwLDEyLjUtNS42LDEyLjUtMTIuNVM5My4xLDM3LjUsODYuNSwzNy41Yy02LjksMC0xMi41LDUuNi0xMi41LDEyLjVjMCw2LjksNS42LDEyLjUsMTIuNSwxMi41YzYuOSwwLDEyLjUtNS42LDEyLjUtMTIuNVMxMDYuOSwzNy41LDEwMCwzNy41eiIgZmlsbD0iIzRjYWY1MEAiLz48L3N2Zz4=`;

const floralTemplate = {
  version: "5.3.0",
  background: "#FFFBF5",
  objects: [
    {
      type: "image",
      src: floralCornerSvg,
      left: 30,
      top: 30,
      scaleX: 0.8,
      scaleY: 0.8,
    },
    {
      type: "image",
      src: floralCornerSvg,
      left: 770,
      top: 30,
      scaleX: 0.8,
      scaleY: 0.8,
      angle: 90,
      originX: "center",
      originY: "center",
    },
    {
      type: "image",
      src: floralCornerSvg,
      left: 770,
      top: 536,
      scaleX: 0.8,
      scaleY: 0.8,
      angle: 180,
      originX: "center",
      originY: "center",
    },
    {
      type: "image",
      src: floralCornerSvg,
      left: 30,
      top: 536,
      scaleX: 0.8,
      scaleY: 0.8,
      angle: 270,
      originX: "center",
      originY: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 80,
      width: 600,
      fill: "#5D4037",
      text: "Certificate of Appreciation",
      fontSize: 55,
      fontWeight: "bold",
      fontFamily: "Georgia",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 180,
      width: 300,
      fill: "#795548",
      text: "IS PROUDLY PRESENTED TO",
      fontSize: 20,
      fontFamily: "Georgia",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 240,
      width: 500,
      fill: "#3E2723",
      text: "[Recipient Name]",
      fontSize: 48,
      fontFamily: "Times New Roman",
      textAlign: "center",
    },
    {
      type: "rect",
      left: 150,
      top: 320,
      width: 500,
      height: 1,
      fill: "#A1887F",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 350,
      width: 550,
      fill: "#6D4C41",
      text: "For outstanding contribution and dedicated service. Your efforts have made a significant impact.",
      fontSize: 18,
      fontFamily: "Georgia",
      textAlign: "center",
    },
  ],
};
const modernTemplate = {
  version: "5.3.0",
  objects: [
    { type: "rect", left: 50, top: 40, width: 700, height: 2, fill: "#3498db" },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 80,
      width: 600,
      fill: "#2c3e50",
      text: "CERTIFICATE OF ACHIEVEMENT",
      fontSize: 60,
      fontWeight: "bold",
      fontFamily: "Georgia",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 200,
      width: 300,
      fill: "#34495e",
      text: "PROUDLY PRESENTED TO",
      fontSize: 22,
      fontFamily: "Arial",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 250,
      width: 500,
      fill: "#3498db",
      text: "Recipient Name",
      fontSize: 50,
      fontWeight: "bold",
      fontFamily: "Times New Roman",
      textAlign: "center",
    },
    {
      type: "rect",
      left: 50,
      top: 520,
      width: 700,
      height: 2,
      fill: "#3498db",
    },
  ],
  background: "#ffffff",
};
const classicTemplate = {
  version: "5.3.0",
  objects: [
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 60,
      width: 600,
      fill: "#c0392b",
      text: "Certificate of Completion",
      fontSize: 70,
      fontFamily: "Times New Roman",
      textAlign: "center",
      fontStyle: "italic",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 220,
      width: 600,
      fill: "#2c3e50",
      text: "This certifies that",
      fontSize: 20,
      fontFamily: "Georgia",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 270,
      width: 600,
      fill: "#2c3e50",
      text: "STUDENT'S NAME",
      fontSize: 60,
      fontWeight: "bold",
      fontFamily: "Georgia",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 380,
      width: 600,
      fill: "#2c3e50",
      text: "has successfully completed the course on Web Development.",
      fontSize: 20,
      fontFamily: "Georgia",
      textAlign: "center",
    },
  ],
  background: "#fdf5e6",
};
const playfulTemplate = {
  version: "5.3.0",
  objects: [
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 70,
      width: 500,
      fill: "#e67e22",
      text: "Awesome Award!",
      fontSize: 80,
      fontWeight: "bold",
      fontFamily: "Verdana",
      textAlign: "center",
    },
    {
      type: "rect",
      left: 100,
      top: 180,
      width: 600,
      height: 10,
      fill: "#2ecc71",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 220,
      width: 300,
      fill: "#8e44ad",
      text: "This award goes to...",
      fontSize: 22,
      fontFamily: "Courier New",
      textAlign: "center",
    },
    {
      type: "textbox",
      originX: "center",
      left: 400,
      top: 270,
      width: 500,
      fill: "#3498db",
      text: "Superstar Name",
      fontSize: 50,
      fontWeight: "bold",
      fontFamily: "Verdana",
      textAlign: "center",
    },
    {
      type: "rect",
      left: 100,
      top: 450,
      width: 600,
      height: 10,
      fill: "#f1c40f",
    },
  ],
  background: "#ecf0f1",
};

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
          className="hidden"
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
            <p className="text-center mt-2 text-sm">{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPanel;
