
import React from 'react';
import * as fabric from 'fabric';
import { FabricCanvasApi } from './FabricCanvas';

interface TemplatePickerProps {
  fabricCanvasRef: React.RefObject<FabricCanvasApi | null>;
}

const templates = [
  { name: 'Classic', path: '/templates/classic.svg' },
  { name: 'Gold Frame', path: '/templates/gold-frame.png' },
];

const TemplatePicker: React.FC<TemplatePickerProps> = ({ fabricCanvasRef }) => {
  const setBackground = (path: string) => {
    const canvas = fabricCanvasRef.current?.getCanvas();
    if (canvas) {
      fabric.Image.fromURL(path).then((img) => {
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scaleX = canvasWidth / (img.width || 1);
        const scaleY = canvasHeight / (img.height || 1);

        img.scaleX = scaleX;
        img.scaleY = scaleY;
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h4>Templates</h4>
      <div style={{ display: 'flex', gap: '10px' }}>
        {templates.map((template) => (
          <div key={template.name} onClick={() => setBackground(template.path)} style={{ cursor: 'pointer' }}>
            <img src={template.path} alt={template.name} style={{ width: '100px', height: '75px', border: '1px solid #ccc' }} />
            <p style={{ textAlign: 'center', marginTop: '5px' }}>{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatePicker;
