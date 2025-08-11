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
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-lg font-semibold text-gray-800">Text Styles</h3>
          <p className="text-sm text-gray-500 mt-1">
            Customize your text appearance
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Quick Add
          </h4>

          <button
            onClick={() => addHeading(textOptions)}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-800 truncate">
                  Add Heading
                </p>
                <span className="text-xs text-gray-500">
                  Large title text - 88px
                </span>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => addSubheading(textOptions)}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-700 truncate">
                  Add Subheading
                </p>
                <span className="text-xs text-gray-500">
                  Medium subtitle - 44px
                </span>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => addBodyText(textOptions)}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 truncate">Add Body Text</p>
                <span className="text-xs text-gray-500">
                  Regular paragraph text
                </span>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Font Properties */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Font Properties
          </h4>

          {/* Font Family & Weight Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Font Family
              </label>
              <select
                value={textOptions.fontFamily}
                onChange={(e) =>
                  handleOptionChange("fontFamily", e.target.value)
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Weight
              </label>
              <select
                value={textOptions.fontWeight}
                onChange={(e) =>
                  handleOptionChange("fontWeight", e.target.value)
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {fontWeights.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Font Size
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="8"
                max="120"
                value={textOptions.fontSize}
                onChange={(e) =>
                  handleOptionChange("fontSize", parseInt(e.target.value))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center space-x-1 w-20 flex-shrink-0">
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={textOptions.fontSize}
                  onChange={(e) =>
                    handleOptionChange("fontSize", parseInt(e.target.value))
                  }
                  className="w-12 p-1.5 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Line Height
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={textOptions.lineHeight}
                onChange={(e) =>
                  handleOptionChange("lineHeight", parseFloat(e.target.value))
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center space-x-1 w-20 flex-shrink-0">
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={textOptions.lineHeight}
                  onChange={(e) =>
                    handleOptionChange("lineHeight", parseFloat(e.target.value))
                  }
                  className="w-12 p-1.5 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500"></span>
              </div>
            </div>
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Letter Spacing
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="-5"
                max="20"
                step="0.5"
                value={textOptions.letterSpacing}
                onChange={(e) =>
                  handleOptionChange(
                    "letterSpacing",
                    parseFloat(e.target.value)
                  )
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center space-x-1 w-20 flex-shrink-0">
                <input
                  type="number"
                  min="-5"
                  max="20"
                  step="0.5"
                  value={textOptions.letterSpacing}
                  onChange={(e) =>
                    handleOptionChange(
                      "letterSpacing",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-12 p-1.5 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Colors
          </h4>

          {/* Text Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={textOptions.fill}
                onChange={(e) => handleOptionChange("fill", e.target.value)}
                className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={textOptions.fill}
                onChange={(e) => handleOptionChange("fill", e.target.value)}
                className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Background Color
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={textOptions.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleOptionChange("backgroundColor", e.target.value)
                  }
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={textOptions.backgroundColor}
                  onChange={(e) =>
                    handleOptionChange("backgroundColor", e.target.value)
                  }
                  className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => handleOptionChange("backgroundColor", "")}
                className="w-full px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Background
              </button>
            </div>
          </div>
        </div>

        {/* Alignment & Transform */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Alignment & Style
          </h4>

          {/* Text Alignment */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Alignment
            </label>
            <div className="grid grid-cols-4 gap-2">
              {textAlignments.map((align) => (
                <button
                  key={align.value}
                  onClick={() => handleOptionChange("textAlign", align.value)}
                  className={`p-2 text-xs rounded-lg border transition-colors ${
                    textOptions.textAlign === align.value
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {align.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Transform */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Transform
            </label>
            <select
              value={textOptions.textTransform}
              onChange={(e) =>
                handleOptionChange("textTransform", e.target.value)
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">Capitalize Each Word</option>
            </select>
          </div>

          {/* Text Style Toggles */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Style
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() =>
                  handleOptionChange(
                    "fontStyle",
                    textOptions.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
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
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  textOptions.underline
                    ? "bg-blue-100 border-blue-300 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <u>Underline</u>
              </button>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Effects
          </h4>

          {/* Text Stroke */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Text Stroke
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={textOptions.stroke || "#000000"}
                  onChange={(e) => handleOptionChange("stroke", e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={textOptions.stroke}
                  onChange={(e) => handleOptionChange("stroke", e.target.value)}
                  className="flex-1 min-w-0 p-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="No stroke"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Stroke Width
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={textOptions.strokeWidth}
                    onChange={(e) =>
                      handleOptionChange(
                        "strokeWidth",
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={textOptions.strokeWidth}
                    onChange={(e) =>
                      handleOptionChange(
                        "strokeWidth",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-16 p-1.5 border border-gray-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shadow Effect */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Shadow Effect
            </label>
            <button
              type="button"
              onClick={() => handleOptionChange("shadow", !textOptions.shadow)}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                textOptions.shadow
                  ? "bg-purple-100 border-purple-300 text-purple-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Drop Shadow
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Quick Presets
          </h4>

          <div className="grid grid-cols-2 gap-3">
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
              className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span className="block font-medium text-blue-800 text-sm">
                Elegant
              </span>
              <span className="block text-xs text-blue-600 mt-1">
                Georgia, Center
              </span>
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
              className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <span className="block font-medium text-green-800 text-sm">
                Modern
              </span>
              <span className="block text-xs text-green-600 mt-1">
                Arial, Semi-bold
              </span>
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
              className="p-3 text-left bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <span className="block font-medium text-amber-800 text-sm">
                Classic
              </span>
              <span className="block text-xs text-amber-600 mt-1">
                Times, Justify
              </span>
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
              className="p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
              <span className="block font-medium text-red-800 text-sm">
                Bold
              </span>
              <span className="block text-xs text-red-600 mt-1">
                Impact, Bold
              </span>
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Live Preview
          </h4>
          <div className="p-4 bg-white border border-gray-200 rounded-lg min-h-[100px] flex items-center justify-center">
            <p
              style={{
                fontFamily: textOptions.fontFamily,
                fontWeight: textOptions.fontWeight,
                fontSize: `${Math.min(textOptions.fontSize, 24)}px`,
                color: textOptions.fill,
                textAlign: textOptions.textAlign,
                lineHeight: textOptions.lineHeight,
                letterSpacing: `${textOptions.letterSpacing}px`,
                fontStyle: textOptions.fontStyle,
                textDecoration: textOptions.underline ? "underline" : "none",
                textTransform: textOptions.textTransform,
                backgroundColor: textOptions.backgroundColor || "transparent",
                padding: textOptions.backgroundColor ? "6px 12px" : "0",
                borderRadius: textOptions.backgroundColor ? "6px" : "0",
                textShadow: textOptions.shadow
                  ? "2px 2px 4px rgba(0,0,0,0.3)"
                  : "none",
                WebkitTextStroke:
                  textOptions.strokeWidth > 0
                    ? `${textOptions.strokeWidth}px ${textOptions.stroke}`
                    : "none",
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              Sample Text Preview
            </p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Preview displays text at reduced size for optimal viewing
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
