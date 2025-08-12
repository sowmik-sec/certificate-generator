/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";
import jsPDF from "jspdf";
import { CanvasSize } from "@/components/canvas-size-panel";
import { useFileDownload } from "./useFileDownload";

export const useCanvasExport = (canvas: any, canvasSize: CanvasSize) => {
  const { downloadFile } = useFileDownload();

  const exportAsPNG = useCallback(() => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
    downloadFile(dataURL, "certificate.png");
  }, [canvas, downloadFile]);

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

    // Use the blob method to download
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    downloadFile(url, "certificate.pdf");
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [canvas, canvasSize, downloadFile]);

  return {
    exportAsPNG,
    exportAsPDF,
  };
};
