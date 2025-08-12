/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback } from "react";

export const useFileDownloadPure = () => {
  const downloadFile = useCallback(
    async (dataUrl: string, filename: string) => {
      try {
        // Primary: Use File System Access API (modern browsers)
        if ("showSaveFilePicker" in globalThis) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            const fileHandle = await (globalThis as any).showSaveFilePicker({
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
            return true;
          } catch (error) {
            // User cancelled or API failed
            console.warn("File System Access API failed:", error);
          }
        }

        // Secondary: Use Web Share API (mobile browsers)
        if ("share" in navigator && "canShare" in navigator) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });

            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: "Download " + filename,
              });
              return true;
            }
          } catch (error) {
            console.warn("Web Share API failed:", error);
          }
        }

        // Fallback: Inform user to save manually
        console.warn(
          "No modern download API available. File download not supported without DOM manipulation."
        );

        // Could trigger a custom event that a parent component could listen to
        const customEvent = new CustomEvent("manual-download-requested", {
          detail: { dataUrl, filename },
        });
        globalThis.dispatchEvent?.(customEvent);

        return false;
      } catch (error) {
        console.error("Download failed:", error);
        return false;
      }
    },
    []
  );

  const downloadBlob = useCallback(
    async (blob: Blob, filename: string) => {
      try {
        // Use File System Access API if available
        if ("showSaveFilePicker" in globalThis) {
          try {
            const fileHandle = await (globalThis as any).showSaveFilePicker({
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
            return true;
          } catch (error) {
            console.warn("File System Access API failed:", error);
          }
        }

        // Fallback: Create object URL and use downloadFile
        const url = URL.createObjectURL(blob);
        const result = await downloadFile(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return result;
      } catch (error) {
        console.error("Blob download failed:", error);
        return false;
      }
    },
    [downloadFile]
  );

  return {
    downloadFile,
    downloadBlob,
  };
};
