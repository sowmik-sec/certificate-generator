import { Template } from "./templateMap";

export const generateTemplateUrl = (templateId: string): string => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/design/${templateId}/edit`;
  }
  return `/design/${templateId}/edit`;
};

export const generateShareableText = (template: Template): string => {
  const url = generateTemplateUrl(template.id);
  return `Check out this ${template.name} certificate template: ${url}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      return true;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
