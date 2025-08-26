import { classicTemplate } from "@/templates/classic-template";
import { modernTemplate } from "@/templates/modern-template";
import { playfulTemplate } from "@/templates/playful-template";
import { elegantTemplate } from "@/templates/elegant-template";
import { minimalistTemplate } from "@/templates/minimalist-template";
import { corporateTemplate } from "@/templates/corporate-template";
import { luxuryTemplate } from "@/templates/luxury-template";
import { techTemplate } from "@/templates/tech-template";
import { creativeTemplate } from "@/templates/creative-template";
import { vintageTemplate } from "@/templates/vintage-template";
import { professionalTemplate } from "@/templates/professional-template";
import { academicTemplate } from "@/templates/academic-template";
import { achievementTemplate } from "@/templates/achievement-template";
import { artisticTemplate } from "@/templates/artistic-template";

export interface Template {
  id: string;
  name: string;
  json: Record<string, unknown>;
}

export const templateMap: Record<string, Template> = {
  blank: {
    id: "blank",
    name: "Blank Canvas",
    json: {
      version: "5.3.1",
      objects: [],
      background: "#ffffff",
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    json: modernTemplate,
  },
  classic: {
    id: "classic",
    name: "Classic",
    json: classicTemplate,
  },
  playful: {
    id: "playful",
    name: "Playful",
    json: playfulTemplate,
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    json: elegantTemplate,
  },
  minimalist: {
    id: "minimalist",
    name: "Minimalist",
    json: minimalistTemplate,
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    json: corporateTemplate,
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    json: luxuryTemplate,
  },
  tech: {
    id: "tech",
    name: "Tech",
    json: techTemplate,
  },
  creative: {
    id: "creative",
    name: "Creative",
    json: creativeTemplate,
  },
  vintage: {
    id: "vintage",
    name: "Vintage",
    json: vintageTemplate,
  },
  professional: {
    id: "professional",
    name: "Professional",
    json: professionalTemplate,
  },
  academic: {
    id: "academic",
    name: "Academic",
    json: academicTemplate,
  },
  achievement: {
    id: "achievement",
    name: "Achievement",
    json: achievementTemplate,
  },
  artistic: {
    id: "artistic",
    name: "Artistic",
    json: artisticTemplate,
  },
};

export const getTemplate = (templateId: string): Template | null => {
  return templateMap[templateId] || null;
};

export const getAllTemplates = (): Template[] => {
  return Object.values(templateMap);
};

export const isValidTemplateId = (templateId: string): boolean => {
  return templateId in templateMap;
};
