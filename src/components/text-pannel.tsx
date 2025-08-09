"use client";
interface TextPanelProps {
  addHeading: () => void;
  addSubheading: () => void;
  addBodyText: () => void;
}
const TextPanel: React.FC<TextPanelProps> = ({
  addHeading,
  addSubheading,
  addBodyText,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Text Styles</h3>
      <button
        onClick={addHeading}
        className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left"
      >
        <p className="text-2xl font-bold text-gray-800">Add a heading</p>
      </button>
      <button
        onClick={addSubheading}
        className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left"
      >
        <p className="text-lg font-semibold text-gray-700">Add a subheading</p>
      </button>
      <button
        onClick={addBodyText}
        className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md text-left"
      >
        <p className="text-base text-gray-600">Add a little bit of body text</p>
      </button>
    </div>
  );
};
export default TextPanel;
