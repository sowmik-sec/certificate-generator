"use client";
import { useState } from "react";

type TextAlign = "left" | "center" | "right" | "justify";
type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

interface TextOptions {
  fontFamily: string;
  fontWeight: string;
  textAlign: TextAlign;
  fill: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontStyle: string;
  underline: boolean;
  textTransform: TextTransform;
  stroke: string;
  strokeWidth: number;
  backgroundColor: string;
  shadow: boolean;
}

interface TextPanelProps {
  addHeading: (options?: object) => void;
  addSubheading: (options?: object) => void;
  addBodyText: (options?: object) => void;
}

const TextPanel: React.FC<TextPanelProps> = ({
  addHeading,
  addSubheading,
  addBodyText,
}) => {
  const [textOptions, setTextOptions] = useState<TextOptions>({
    fontFamily: "Arial",
    fontWeight: "normal",
    textAlign: "left",
    fill: "#000000",
    fontSize: 24,
    lineHeight: 1.2,
    letterSpacing: 0,
    fontStyle: "normal",
    underline: false,
    textTransform: "none",
    stroke: "",
    strokeWidth: 0,
    backgroundColor: "",
    shadow: false,
  });

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Palatino",
  ];

  const fontWeights = [
    { label: "Thin", value: "100" },
    { label: "Light", value: "300" },
    { label: "Normal", value: "normal" },
    { label: "Medium", value: "500" },
    { label: "Semi Bold", value: "600" },
    { label: "Bold", value: "bold" },
    { label: "Extra Bold", value: "800" },
    { label: "Black", value: "900" },
  ];

  const textAlignments = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Justify", value: "justify" },
  ];

  const handleOptionChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setTextOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Text Styles</h3>

      {/* Text Style Options */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-md font-medium text-gray-700">Text Properties</h4>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Font Family
          </label>
          <select
            value={textOptions.fontFamily}
            onChange={(e) => handleOptionChange("fontFamily", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Font Weight
          </label>
          <select
            value={textOptions.fontWeight}
            onChange={(e) => handleOptionChange("fontWeight", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {fontWeights.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Text Alignment
          </label>
          <select
            value={textOptions.textAlign}
            onChange={(e) => handleOptionChange("textAlign", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {textAlignments.map((align) => (
              <option key={align.value} value={align.value}>
                {align.label}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textOptions.fill}
              onChange={(e) => handleOptionChange("fill", e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={textOptions.fill}
              onChange={(e) => handleOptionChange("fill", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Font Size
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="8"
              max="120"
              value={textOptions.fontSize}
              onChange={(e) =>
                handleOptionChange("fontSize", parseInt(e.target.value))
              }
              className="flex-1"
            />
            <input
              type="number"
              min="8"
              max="120"
              value={textOptions.fontSize}
              onChange={(e) =>
                handleOptionChange("fontSize", parseInt(e.target.value))
              }
              className="w-16 p-1 border border-gray-300 rounded text-sm text-center"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Line Height
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={textOptions.lineHeight}
              onChange={(e) =>
                handleOptionChange("lineHeight", parseFloat(e.target.value))
              }
              className="flex-1"
            />
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={textOptions.lineHeight}
              onChange={(e) =>
                handleOptionChange("lineHeight", parseFloat(e.target.value))
              }
              className="w-16 p-1 border border-gray-300 rounded text-sm text-center"
            />
          </div>
        </div>

        {/* Letter Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Letter Spacing
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-5"
              max="20"
              step="0.5"
              value={textOptions.letterSpacing}
              onChange={(e) =>
                handleOptionChange("letterSpacing", parseFloat(e.target.value))
              }
              className="flex-1"
            />
            <input
              type="number"
              min="-5"
              max="20"
              step="0.5"
              value={textOptions.letterSpacing}
              onChange={(e) =>
                handleOptionChange("letterSpacing", parseFloat(e.target.value))
              }
              className="w-16 p-1 border border-gray-300 rounded text-sm text-center"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>

        {/* Text Style Options */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Text Style
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleOptionChange(
                  "fontStyle",
                  textOptions.fontStyle === "italic" ? "normal" : "italic"
                )
              }
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                textOptions.fontStyle === "italic"
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <em>Italic</em>
            </button>
            <button
              type="button"
              onClick={() =>
                handleOptionChange("underline", !textOptions.underline)
              }
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                textOptions.underline
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <u>Underline</u>
            </button>
          </div>
        </div>

        {/* Text Transform */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Text Transform
          </label>
          <select
            value={textOptions.textTransform}
            onChange={(e) =>
              handleOptionChange("textTransform", e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize Each Word</option>
          </select>
        </div>

        {/* Text Stroke */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Text Stroke
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textOptions.stroke || "#000000"}
                onChange={(e) => handleOptionChange("stroke", e.target.value)}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={textOptions.stroke}
                onChange={(e) => handleOptionChange("stroke", e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm font-mono"
                placeholder="No stroke"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 w-16">Width:</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={textOptions.strokeWidth}
                onChange={(e) =>
                  handleOptionChange("strokeWidth", parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={textOptions.strokeWidth}
                onChange={(e) =>
                  handleOptionChange("strokeWidth", parseFloat(e.target.value))
                }
                className="w-16 p-1 border border-gray-300 rounded text-sm text-center"
              />
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textOptions.backgroundColor || "#ffffff"}
              onChange={(e) =>
                handleOptionChange("backgroundColor", e.target.value)
              }
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={textOptions.backgroundColor}
              onChange={(e) =>
                handleOptionChange("backgroundColor", e.target.value)
              }
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="No background"
            />
            <button
              type="button"
              onClick={() => handleOptionChange("backgroundColor", "")}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Text Effects */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Effects
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleOptionChange("shadow", !textOptions.shadow)}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                textOptions.shadow
                  ? "bg-purple-100 border-purple-300 text-purple-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Drop Shadow
            </button>
          </div>
        </div>
      </div>

      {/* Text Style Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => addHeading(textOptions)}
          className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left border border-gray-200 transition-shadow"
        >
          <p
            className="text-2xl font-bold text-gray-800"
            style={{
              fontFamily: textOptions.fontFamily,
              fontWeight: textOptions.fontWeight,
              textAlign: textOptions.textAlign,
              color: textOptions.fill,
              lineHeight: textOptions.lineHeight,
              letterSpacing: `${textOptions.letterSpacing}px`,
              fontStyle: textOptions.fontStyle,
              textDecoration: textOptions.underline ? "underline" : "none",
              textTransform: textOptions.textTransform,
            }}
          >
            Add a heading
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Large title text - Default: 88px
          </span>
        </button>

        <button
          onClick={() => addSubheading(textOptions)}
          className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left border border-gray-200 transition-shadow"
        >
          <p
            className="text-lg font-semibold text-gray-700"
            style={{
              fontFamily: textOptions.fontFamily,
              fontWeight: textOptions.fontWeight,
              textAlign: textOptions.textAlign,
              color: textOptions.fill,
              lineHeight: textOptions.lineHeight,
              letterSpacing: `${textOptions.letterSpacing}px`,
              fontStyle: textOptions.fontStyle,
              textDecoration: textOptions.underline ? "underline" : "none",
              textTransform: textOptions.textTransform,
            }}
          >
            Add a subheading
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Medium subtitle text - Default: 44px
          </span>
        </button>

        <button
          onClick={() => addBodyText(textOptions)}
          className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left border border-gray-200 transition-shadow"
        >
          <p
            className="text-base text-gray-600"
            style={{
              fontFamily: textOptions.fontFamily,
              fontWeight: textOptions.fontWeight,
              textAlign: textOptions.textAlign,
              color: textOptions.fill,
              lineHeight: textOptions.lineHeight,
              letterSpacing: `${textOptions.letterSpacing}px`,
              fontStyle: textOptions.fontStyle,
              textDecoration: textOptions.underline ? "underline" : "none",
              textTransform: textOptions.textTransform,
            }}
          >
            Add a little bit of body text
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Regular paragraph text - Uses current font size
          </span>
        </button>
      </div>

      {/* Quick Style Presets */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-700">Quick Presets</h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const elegantOptions: Partial<TextOptions> = {
                fontFamily: "Georgia",
                fontWeight: "normal",
                fill: "#2c3e50",
                textAlign: "center",
              };
              setTextOptions((prev) => ({ ...prev, ...elegantOptions }));
            }}
            className="p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          >
            <span className="font-medium text-blue-800">Elegant</span>
            <br />
            <span className="text-xs text-blue-600">Georgia, Center</span>
          </button>

          <button
            onClick={() => {
              const modernOptions: Partial<TextOptions> = {
                fontFamily: "Arial",
                fontWeight: "600",
                fill: "#34495e",
                textAlign: "left",
              };
              setTextOptions((prev) => ({ ...prev, ...modernOptions }));
            }}
            className="p-2 text-sm bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
          >
            <span className="font-medium text-green-800">Modern</span>
            <br />
            <span className="text-xs text-green-600">Arial, Semi-bold</span>
          </button>

          <button
            onClick={() => {
              const classicOptions: Partial<TextOptions> = {
                fontFamily: "Times New Roman",
                fontWeight: "normal",
                fill: "#000000",
                textAlign: "justify",
              };
              setTextOptions((prev) => ({ ...prev, ...classicOptions }));
            }}
            className="p-2 text-sm bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
          >
            <span className="font-medium text-amber-800">Classic</span>
            <br />
            <span className="text-xs text-amber-600">Times, Justify</span>
          </button>

          <button
            onClick={() => {
              const boldOptions: Partial<TextOptions> = {
                fontFamily: "Impact",
                fontWeight: "bold",
                fill: "#e74c3c",
                textAlign: "center",
              };
              setTextOptions((prev) => ({ ...prev, ...boldOptions }));
            }}
            className="p-2 text-sm bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
          >
            <span className="font-medium text-red-800">Bold</span>
            <br />
            <span className="text-xs text-red-600">Impact, Bold</span>
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-700">Live Preview</h4>
        <div className="p-4 bg-white border border-gray-200 rounded-lg min-h-[80px] flex items-center justify-center">
          <p
            style={{
              fontFamily: textOptions.fontFamily,
              fontWeight: textOptions.fontWeight,
              fontSize: `${Math.min(textOptions.fontSize, 32)}px`,
              color: textOptions.fill,
              textAlign: textOptions.textAlign,
              lineHeight: textOptions.lineHeight,
              letterSpacing: `${textOptions.letterSpacing}px`,
              fontStyle: textOptions.fontStyle,
              textDecoration: textOptions.underline ? "underline" : "none",
              textTransform: textOptions.textTransform,
              backgroundColor: textOptions.backgroundColor || "transparent",
              padding: textOptions.backgroundColor ? "4px 8px" : "0",
              borderRadius: textOptions.backgroundColor ? "4px" : "0",
              textShadow: textOptions.shadow
                ? "2px 2px 4px rgba(0,0,0,0.3)"
                : "none",
              WebkitTextStroke:
                textOptions.strokeWidth > 0
                  ? `${textOptions.strokeWidth}px ${textOptions.stroke}`
                  : "none",
            }}
          >
            Sample Text Preview
          </p>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Preview shows text at reduced size for display purposes
        </p>
      </div>
    </div>
  );
};

export default TextPanel;
