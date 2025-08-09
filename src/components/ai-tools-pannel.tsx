"use client";
import { FabricCanvas } from "@/app/page";
import { FabricObject } from "fabric";
import { useState } from "react";

interface AIToolsPanelProps {
  generateAITemplate: (prompt: string) => Promise<void>;
  addImageFromURL: (url: string) => void;
  canvas: FabricCanvas;
  selectedObject: FabricObject;
}
const AIToolsPanel: React.FC<AIToolsPanelProps> = ({
  generateAITemplate,
  canvas,
  addImageFromURL,
  selectedObject,
}) => {
  const [templatePrompt, setTemplatePrompt] = useState("");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [colorPrompt, setColorPrompt] = useState("");
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);
  const [colorPalette, setColorPalette] = useState<string[]>([]);

  const handleGenerateTemplate = async () => {
    if (!templatePrompt) return;
    setIsGeneratingTemplate(true);
    await generateAITemplate(templatePrompt);
    setIsGeneratingTemplate(false);
  };
  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      const payload = {
        instances: [{ prompt: imagePrompt }],
        parameters: { sampleCount: 1 },
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API call failed`);
      const result = await response.json();
      if (result.predictions && result.predictions[0].bytesBase64Encoded) {
        addImageFromURL(
          `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`
        );
      } else {
        throw new Error("Image generation failed");
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  const handleGenerateColors = async () => {
    if (!colorPrompt) return;
    setIsGeneratingColors(true);
    setColorPalette([]);
    const prompt = `Based on the theme "${colorPrompt}", generate a harmonious color palette. Return a JSON object with a single key "colors" which is an array of 5 hex color codes. Example: {"colors": ["#RRGGBB", ...]}`;
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              colors: { type: "ARRAY", items: { type: "STRING" } },
            },
          },
        },
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API call failed`);
      const result = await response.json();
      const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        setColorPalette(JSON.parse(jsonText).colors || []);
      } else {
        throw new Error("Color generation failed");
      }
    } catch (error) {
      console.error("Error generating color palette:", error);
    } finally {
      setIsGeneratingColors(false);
    }
  };
  const applyColor = (color: string) => {
    if (selectedObject && canvas) {
      selectedObject.set(
        selectedObject.type === "line" || selectedObject.type === "group"
          ? "stroke"
          : "fill",
        color
      );
      canvas.renderAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="font-semibold text-purple-800">
          ✨ AI Template Generator
        </h3>
        <textarea
          value={templatePrompt}
          onChange={(e) => setTemplatePrompt(e.target.value)}
          placeholder="e.g., A formal certificate for a business award"
          className="w-full p-2 border rounded-md h-24"
          disabled={isGeneratingTemplate}
        />
        <button
          onClick={handleGenerateTemplate}
          disabled={isGeneratingTemplate || !templatePrompt}
          className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
        >
          {isGeneratingTemplate ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            "Generate Template"
          )}
        </button>
      </div>
      <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800">✨ AI Image Generator</h3>
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="e.g., A golden laurel wreath logo"
          className="w-full p-2 border rounded-md h-24"
          disabled={isGeneratingImage}
        />
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImage || !imagePrompt}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
        >
          {isGeneratingImage ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            "Generate Image"
          )}
        </button>
      </div>
      <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">✨ AI Color Palette</h3>
        <textarea
          value={colorPrompt}
          onChange={(e) => setColorPrompt(e.target.value)}
          placeholder="e.g., A calm and professional theme"
          className="w-full p-2 border rounded-md h-24"
          disabled={isGeneratingColors}
        />
        <button
          onClick={handleGenerateColors}
          disabled={isGeneratingColors || !colorPrompt}
          className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-yellow-400"
        >
          {isGeneratingColors ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            "Suggest Colors"
          )}
        </button>
        {colorPalette.length > 0 && (
          <p className="text-xs text-center text-gray-600">
            Click a color to apply it to the selected object.
          </p>
        )}
        <div className="flex justify-center space-x-2 pt-2">
          {colorPalette.map((color) => (
            <div
              key={color}
              onClick={() => applyColor(color)}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AIToolsPanel;
