
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';

// TypeScript interface for the exposed API
export interface FabricCanvasApi {
  addText: (text: string, options?: fabric.ITextboxOptions) => void;
  addImageFromFile: (file: File) => void;
  addImageFromUrl: (url: string) => void;
  exportPNG: () => string;
  exportSVG: () => string;
  exportJSON: () => Record<string, any>;
  loadFromJSON: (json: Record<string, any>) => void;
}

// Default options for added text
const defaultTextOptions: fabric.ITextboxOptions = {
  left: 50,
  top: 50,
  width: 200,
  fontSize: 20,
  fill: '#000000',
};

const FabricCanvas = forwardRef<FabricCanvasApi, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas and event listeners
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const container = containerRef.current;
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: container.offsetWidth,
        height: (container.offsetWidth * 8.5) / 11, // Maintain 11x8.5 aspect ratio
        backgroundColor: '#ffffff',
      });
      fabricCanvasRef.current = canvas;

      const handleResize = () => {
        if (fabricCanvasRef.current && containerRef.current) {
          const newWidth = containerRef.current.offsetWidth;
          fabricCanvasRef.current.setWidth(newWidth);
          fabricCanvasRef.current.setHeight((newWidth * 8.5) / 11);
          fabricCanvasRef.current.renderAll();
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, []);

  // Expose canvas manipulation methods
  useImperativeHandle(ref, () => ({
    /**
     * Adds a text box to the canvas.
     * @param text - The text content.
     * @param opts - Fabric.js textbox options.
     */
    addText: (text, opts) => {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        const textbox = new fabric.Textbox(text, {
          ...defaultTextOptions,
          ...opts,
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.renderAll();
      }
    },

    /**
     * Adds an image to the canvas from a local file.
     * @param file - The image file.
     */
    addImageFromFile: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          fabric.Image.fromURL(e.target.result as string, (img) => {
            fabricCanvasRef.current?.add(img);
            fabricCanvasRef.current?.renderAll();
          });
        }
      };
      reader.readAsDataURL(file);
    },

    /**
     * Adds an image to the canvas from a URL.
     * @param url - The URL of the image.
     */
    addImageFromUrl: (url) => {
      fabric.Image.fromURL(url, (img) => {
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.renderAll();
      }, { crossOrigin: 'anonymous' });
    },

    /**
     * Exports the canvas content as a PNG data URL.
     * @returns The PNG data URL.
     */
    exportPNG: () => {
      return fabricCanvasRef.current?.toDataURL({ format: 'png' }) || '';
    },

    /**
     * Exports the canvas content as an SVG string.
     * @returns The SVG string.
     */
    exportSVG: () => {
      return fabricCanvasRef.current?.toSVG() || '';
    },

    /**
     * Exports the canvas state as a JSON object.
     * @returns The canvas state in JSON format.
     */
    exportJSON: () => {
      return fabricCanvasRef.current?.toJSON() || {};
    },

    /**
     * Loads canvas state from a JSON object.
     * @param json - The canvas state in JSON format.
     */
    loadFromJSON: (json) => {
      fabricCanvasRef.current?.loadFromJSON(json, () => {
        fabricCanvasRef.current?.renderAll();
      });
    },
  }));

  return (
    <div ref={containerRef} style={{ width: '100%', height: 'auto' }}>
      <canvas ref={canvasRef} />
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
