
import React, { useState, useEffect } from 'react';
import * as fabric from 'fabric';

import { FabricCanvasApi } from './FabricCanvas';

interface ToolbarTextProps {
  fabricCanvasRef: React.RefObject<FabricCanvasApi | null>;
}

const safeFonts = [
  'Arial',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
];

const ToolbarText: React.FC<ToolbarTextProps> = ({ fabricCanvasRef }) => {
  const [text, setText] = useState('');
  const [activeObject, setActiveObject] = useState<fabric.FabricObject | null>(null);

  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fillColor, setFillColor] = useState('#000000');

  useEffect(() => {
    const canvas = fabricCanvasRef.current?.getCanvas();
    if (!canvas) return;

    const updateActiveObject = () => {
      const obj = canvas.getActiveObject();
      setActiveObject(obj || null);
      if (obj instanceof fabric.Textbox) {
        setFontSize(obj.get('fontSize') || 20);
        setFontFamily(obj.get('fontFamily') || 'Arial');
        setIsBold(obj.get('fontWeight') === 'bold');
        setIsItalic(obj.get('fontStyle') === 'italic');
        setFillColor(obj.get('fill') as string || '#000000');
      }
    };

    canvas.on('selection:created', updateActiveObject);
    canvas.on('selection:updated', updateActiveObject);
    canvas.on('selection:cleared', () => setActiveObject(null));

    return () => {
      canvas.off('selection:created', updateActiveObject);
      canvas.off('selection:updated', updateActiveObject);
      canvas.off('selection:cleared');
    };
  }, [fabricCanvasRef]);

  const addText = () => {
    const canvas = fabricCanvasRef.current?.getCanvas();
    if (canvas && text) {
      const textbox = new fabric.Textbox(text, {
        left: 50,
        top: 50,
        width: 200,
        fontSize,
        fontFamily,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        fill: fillColor,
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      setText('');
    }
  };

  const updateProperty = (prop: string, value: string | number | boolean) => {
    const canvas = fabricCanvasRef.current?.getCanvas();
    const obj = canvas?.getActiveObject();
    if (obj instanceof fabric.Textbox) {
      obj.set(prop, value);
      canvas?.renderAll();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          style={{ flexGrow: 1 }}
        />
        <button onClick={addText}>Add</button>
      </div>
      {activeObject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Font Size:</label>
            <input
              type="range"
              min="10"
              max="120"
              value={fontSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                setFontSize(newSize);
                updateProperty('fontSize', newSize);
              }}
            />
            <span>{fontSize}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Font Family:</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                const newFamily = e.target.value;
                setFontFamily(newFamily);
                updateProperty('fontFamily', newFamily);
              }}
            >
              {safeFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                const newBold = !isBold;
                setIsBold(newBold);
                updateProperty('fontWeight', newBold ? 'bold' : 'normal');
              }}
              style={{ fontWeight: isBold ? 'bold' : 'normal' }}
            >
              Bold
            </button>
            <button
              onClick={() => {
                const newItalic = !isItalic;
                setIsItalic(newItalic);
                updateProperty('fontStyle', newItalic ? 'italic' : 'normal');
              }}
              style={{ fontStyle: isItalic ? 'italic' : 'normal' }}
            >
              Italic
            </button>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setFillColor(newColor);
                updateProperty('fill', newColor);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolbarText;
