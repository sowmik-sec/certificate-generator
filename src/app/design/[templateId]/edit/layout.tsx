import { Metadata } from "next";
import { getTemplate, isValidTemplateId } from "@/lib/templateMap";

interface Props {
  params: Promise<{
    templateId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params;

  if (!isValidTemplateId(templateId)) {
    return {
      title: "Template Not Found - Certificate Generator",
      description: "The requested template was not found.",
    };
  }

  const template = getTemplate(templateId);

  return {
    title: `${template?.name} Certificate Template - Certificate Generator`,
    description: `Create a professional ${template?.name.toLowerCase()} certificate. Fully customizable template perfect for awards and achievements.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

// This enables static generation of paths at build time
export async function generateStaticParams() {
  // Import this dynamically to avoid build issues
  const { getAllTemplates } = await import("@/lib/templateMap");
  const templates = getAllTemplates();

  return templates.map((template) => ({
    templateId: template.id,
  }));
}

// Default layout export is required
export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
