/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dna,
  Image as ImageIcon,
  Type,
  Download,
  Trash2,
  Wrench,
  Component,
} from "lucide-react";
import TemplatesPanel from "@/components/templates-pannel";
import ElementsPanel from "@/components/elements-pannel";
import TextPanel from "@/components/text-pannel";
import ToolsPanel from "@/components/tools-pannel";
import CanvasComponent from "@/components/canvas-component";
import PropertiesPanel from "@/components/properties-pannel";

// Simplified types to `any` to prevent build-time type resolution errors on the server.
export type FabricModule = any;
export type FabricObject = any;
export type FabricCanvas = any;
export type EditorMode = "templates" | "elements" | "text" | "tools";

// Main App Component
export default function CertificateGeneratorPage() {
  const [fabric, setFabric] = useState<FabricModule | null>(null);
  const [canvas, setCanvas] = useState<FabricCanvas>(null);
  const [selectedObject, setSelectedObject] = useState<FabricObject>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("templates");
  const [copiedObject, setCopiedObject] = useState<FabricObject>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Dynamically load Fabric.js from a CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
    script.async = true;

    script.onload = () => {
      setFabric((window as any).fabric);
    };

    script.onerror = () => {
      console.error("Failed to load fabric.js from CDN");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSetCanvas = useCallback((canvasInstance: any) => {
    setCanvas(canvasInstance);
  }, []);

  const addText = (text: string, options: object) => {
    if (!canvas || !fabric) return;
    const textObject = new fabric.Textbox(text, {
      left: 150,
      top: 200,
      width: 400,
      fontFamily: "Arial",
      fill: "#000000",
      ...options,
    });
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
  };

  const addHeading = () =>
    addText("Add a heading", { fontSize: 88, fontWeight: "bold" });
  const addSubheading = () =>
    addText("Add a subheading", { fontSize: 44, fontWeight: "normal" });
  const addBodyText = () =>
    addText("Add a little bit of body text", {
      fontSize: 24,
      fontWeight: "normal",
    });

  const addImageFromURL = (url: string) => {
    if (!canvas || !fabric) return;
    fabric.Image.fromURL(
      url,
      (img: any) => {
        img.set({
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const addSquare = () => {
    if (!canvas || !fabric) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 150,
      fill: "#4A90E2",
      width: 150,
      height: 150,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas || !fabric) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 150,
      fill: "#E91E63",
      radius: 75,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const addTriangle = () => {
    if (!canvas || !fabric) return;
    const triangle = new fabric.Triangle({
      left: 200,
      top: 150,
      fill: "#FFC107",
      width: 150,
      height: 150,
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
  };

  const addLine = (options = {}) => {
    if (!canvas || !fabric) return;
    const line = new fabric.Line([50, 50, 250, 50], {
      left: 200,
      top: 200,
      stroke: "#333333",
      strokeWidth: 4,
      ...options,
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  };

  const addDashedLine = (options = {}) =>
    addLine({ strokeDashArray: [10, 5], ...options });

  const addArrowLine = (options: { stroke?: string } = {}) => {
    if (!canvas || !fabric) return;
    const defaultStroke = "#333333";
    const strokeColor = options.stroke || defaultStroke;

    const line = new fabric.Line([50, 50, 250, 50], {
      stroke: strokeColor,
      strokeWidth: 4,
    });
    const arrowhead = new fabric.Triangle({
      width: 15,
      height: 20,
      fill: strokeColor,
      left: 250,
      top: 50,
      originX: "center",
      originY: "center",
      angle: 90,
    });
    const group = new fabric.Group([line, arrowhead], { left: 200, top: 200 });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const addStickyNote = () => {
    if (!canvas || !fabric) return;
    const noteBg = new fabric.Rect({
      width: 200,
      height: 200,
      fill: "#FFF9C4",
      shadow: "rgba(0,0,0,0.2) 2px 2px 5px",
    });
    const noteText = new fabric.Textbox("Your note here...", {
      width: 180,
      top: 10,
      left: 10,
      fontSize: 20,
      fontFamily: "Georgia",
      fill: "#000000",
    });
    const group = new fabric.Group([noteBg, noteText], { left: 150, top: 150 });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const addTable = () => {
    if (!canvas || !fabric) return;
    const cellPadding = 10;
    const cellWidth = 150;
    const cellHeight = 50;
    const tableObjects = [];
    for (let i = 0; i < 2; i++) {
      // rows
      for (let j = 0; j < 2; j++) {
        // cols
        const cell = new fabric.Rect({
          width: cellWidth,
          height: cellHeight,
          fill: "transparent",
          stroke: "#000",
          left: j * cellWidth,
          top: i * cellHeight,
        });
        const text = new fabric.Textbox(`Cell ${i}-${j}`, {
          width: cellWidth - cellPadding,
          height: cellHeight - cellPadding,
          left: j * cellWidth + cellPadding / 2,
          top: i * cellHeight + cellPadding / 2,
          fontSize: 16,
          fill: "#000000",
          fontFamily: "Arial",
        });
        tableObjects.push(cell, text);
      }
    }
    const group = new fabric.Group(tableObjects, { left: 150, top: 150 });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  };

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  }, [canvas, selectedObject]);

  const handleCopy = useCallback(() => {
    if (!selectedObject) return;
    selectedObject.clone((cloned: any) => {
      setCopiedObject(cloned);
    });
  }, [selectedObject]);

  const handlePaste = useCallback(() => {
    if (!copiedObject || !canvas) return;
    copiedObject.clone((clonedObj: any) => {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = canvas;
        clonedObj.forEachObject((obj: any) => {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      setSelectedObject(clonedObj);
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  }, [copiedObject, canvas]);

  // Add keyboard event listener for copy, paste, and delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas?.getActiveObject();
      const isEditing =
        activeObject &&
        (activeObject.isEditing ||
          (activeObject.type === "textbox" && activeObject.isEditing));

      if (isEditing) return; // Don't interfere with text input

      if ((e.key === "Delete" || e.key === "Backspace") && selectedObject) {
        e.preventDefault();
        deleteSelected();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedObject) {
        e.preventDefault();
        handleCopy();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedObject, deleteSelected, handleCopy, handlePaste, canvas]);

  const exportAsPNG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadTemplate = (templateJson: any) => {
    if (!canvas) return;
    canvas.loadFromJSON(templateJson, () => {
      canvas.renderAll();
    });
  };

  const handleBackgroundImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || !fabric) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        fabric.Image.fromURL(data, (img: any) => {
          canvas.clear();
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
          });
        });
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleImageElementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        addImageFromURL(data);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  if (!fabric) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">
          Loading Editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 font-sans">
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden text-gray-700"
        onChange={handleImageElementUpload}
      />
      <aside className="w-full md:w-20 bg-gray-800 text-white flex md:flex-col items-center p-2 md:py-4">
        <div className="text-2xl font-bold mr-auto md:mr-0 md:mb-8">CG</div>
        <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-4">
          <button
            onClick={() => setEditorMode("templates")}
            className={`p-2 rounded-lg ${
              editorMode === "templates" ? "bg-blue-500" : "hover:bg-gray-700"
            }`}
            title="Templates"
          >
            <Dna size={24} />
          </button>

          <button
            onClick={() => setEditorMode("tools")}
            className={`p-2 rounded-lg ${
              editorMode === "tools" ? "bg-indigo-500" : "hover:bg-gray-700"
            }`}
            title="Tools"
          >
            <Wrench size={24} />
          </button>
          <button
            onClick={() => setEditorMode("text")}
            className={`p-2 rounded-lg ${
              editorMode === "text" ? "bg-yellow-500" : "hover:bg-gray-700"
            }`}
            title="Add Text"
          >
            <Type size={24} />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className={`p-2 rounded-lg hover:bg-gray-700`}
            title="Add Image"
          >
            <ImageIcon size={24} />
          </button>
          <button
            onClick={() => setEditorMode("elements")}
            className={`p-2 rounded-lg ${
              editorMode === "elements" ? "bg-green-500" : "hover:bg-gray-700"
            }`}
            title="Elements"
          >
            <Component size={24} />
          </button>
        </nav>
      </aside>

      <aside className="w-full md:w-80 bg-gray-200 p-4 overflow-y-auto h-64 md:h-screen">
        {editorMode === "templates" && (
          <TemplatesPanel
            onSelectTemplate={loadTemplate}
            onImageUpload={handleBackgroundImageUpload}
          />
        )}

        {editorMode === "elements" && (
          <ElementsPanel
            addSquare={addSquare}
            addCircle={addCircle}
            addTriangle={addTriangle}
            addLine={addLine}
            addDashedLine={addDashedLine}
            addArrowLine={addArrowLine}
          />
        )}
        {editorMode === "text" && (
          <TextPanel
            addHeading={addHeading}
            addSubheading={addSubheading}
            addBodyText={addBodyText}
          />
        )}
        {editorMode === "tools" && (
          <ToolsPanel
            canvas={canvas}
            addStickyNote={addStickyNote}
            addTable={addTable}
          />
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-md z-10 flex justify-end items-center p-2 space-x-2">
          {selectedObject && (
            <button
              onClick={deleteSelected}
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={exportAsPNG}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        </header>

        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-300 overflow-hidden">
            <CanvasComponent
              fabric={fabric}
              setCanvas={handleSetCanvas}
              setSelectedObject={setSelectedObject}
            />
          </div>
          {selectedObject && (
            <aside className="hidden lg:block w-80 bg-gray-200 p-4 overflow-y-auto">
              <PropertiesPanel
                selectedObject={selectedObject}
                canvas={canvas}
              />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
