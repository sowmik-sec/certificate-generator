/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import jsPDF from "jspdf";
import { CanvasSize } from "@/components/canvas-size-panel";

export const useCanvasExport = (canvas: any, canvasSize: CanvasSize) => {
  const exportAsPNG = useCallback(() => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [canvas]);

  const exportAsPDF = useCallback(() => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    const orientation =
      canvasSize.orientation === "portrait" ? "portrait" : "landscape";
    const pdf = new jsPDF({ orientation });
    const imgProps = pdf.getImageProperties(dataURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataURL, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("certificate.pdf");
  }, [canvas, canvasSize]);

  return {
    exportAsPNG,
    exportAsPDF,
  };
};
