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

    // Calculate multiplier for high-quality export on mobile devices
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth <= 768;
    const multiplier = isMobile
      ? Math.max(devicePixelRatio * 2, 3)
      : devicePixelRatio * 2;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: multiplier,
    });

    downloadFile(dataURL, "certificate.png");
  }, [canvas, downloadFile]);

  const exportAsPDF = useCallback(() => {
    if (!canvas) return;

    // Calculate multiplier for high-quality export on mobile devices
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isMobile = window.innerWidth <= 768;
    const multiplier = isMobile
      ? Math.max(devicePixelRatio * 2, 3)
      : devicePixelRatio * 2;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: multiplier,
    });

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
