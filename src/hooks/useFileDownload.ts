/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useFileDownload = () => {
  const downloadFile = useCallback(
    async (dataUrl: string, filename: string) => {
      try {
        // Modern approach: Use File System Access API if available
        if ("showSaveFilePicker" in window) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: filename,
              types: [
                {
                  description: "Image files",
                  accept: {
                    "image/png": [".png"],
                    "image/jpeg": [".jpg"],
                    "application/pdf": [".pdf"],
                  },
                },
              ],
            });

            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
            return;
          } catch {
            // User cancelled or API not supported, fall back
          }
        }

        // Fallback: Create temporary link and trigger download
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
    []
  );

  const downloadBlob = useCallback(
    async (blob: Blob, filename: string) => {
      try {
        // Modern approach: Use File System Access API if available
        if ("showSaveFilePicker" in window) {
          try {
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: filename,
              types: [
                {
                  description: "Files",
                  accept: {
                    "image/png": [".png"],
                    "image/jpeg": [".jpg"],
                    "application/pdf": [".pdf"],
                  },
                },
              ],
            });

            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
            return;
          } catch {
            // User cancelled or API not supported, fall back
          }
        }

        // Fallback: Use object URL
        const url = URL.createObjectURL(blob);
        await downloadFile(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("Blob download failed:", error);
      }
    },
    [downloadFile]
  );

  return {
    downloadFile,
    downloadBlob,
  };
};
