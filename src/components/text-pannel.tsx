/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

interface TextPanelProps {
  addHeading: (options?: object) => void;
  addSubheading: (options?: object) => void;
  addBodyText: (options?: object) => void;
  selectedObject?: any;
  canvas?: any;
}

const TextPanel: React.FC<TextPanelProps> = ({
  addHeading,
  addSubheading,
  addBodyText,
  selectedObject,
}) => {
  // Check if selected object is a text object
  const isSelectedTextObject =
    selectedObject &&
    (selectedObject.type === "textbox" ||
      selectedObject.type === "text" ||
      selectedObject.type === "i-text");

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            {isSelectedTextObject ? "Add New Text" : "Quick Add"}
          </h4>

          {isSelectedTextObject && (
            <p className="text-xs text-gray-500 mb-3">
              Click below to add new text with current settings, or modify
              properties above to edit selected text.
            </p>
          )}

          <button
            onClick={() => addHeading()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm text-left hover:cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 truncate">
                  Add Heading
                </p>
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
            onClick={() => addSubheading()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:cursor-pointer text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold text-gray-700 truncate">
                  Add Subheading
                </p>
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
            onClick={() => addBodyText()}
            className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:cursor-pointer text-left transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 truncate">Add Body Text</p>
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
      </div>
    </div>
  );
};

export default TextPanel;
