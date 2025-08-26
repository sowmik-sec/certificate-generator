"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplate } from "@/lib/templateMap";

const Breadcrumb: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.templateId as string;
  const template = getTemplate(templateId);

  if (!template) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
        className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Home size={14} />
        <span>Templates</span>
      </Button>

      <ChevronRight size={14} className="text-gray-400" />

      <span className="font-medium text-gray-900">{template.name}</span>

      <ChevronRight size={14} className="text-gray-400" />

      <span className="text-gray-500">Edit</span>
    </nav>
  );
};

export default Breadcrumb;
