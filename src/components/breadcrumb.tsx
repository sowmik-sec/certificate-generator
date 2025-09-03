"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb as ShadBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTemplate } from "@/lib/templateMap";

const Breadcrumb: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.templateId as string;
  const template = getTemplate(templateId);

  if (!template) return null;

  return (
    <ShadBreadcrumb className="text-sm text-muted-foreground">
      <BreadcrumbList className="flex items-center space-x-2">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => router.push("/")}
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-accent/5"
          >
            <Home size={14} />
            <span>Templates</span>
          </BreadcrumbLink>
          <BreadcrumbSeparator>
            <ChevronRight size={14} className="text-muted-foreground" />
          </BreadcrumbSeparator>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            className="font-medium text-foreground pointer-events-none"
            aria-current="page"
          >
            {template.name}
          </BreadcrumbLink>
          <BreadcrumbSeparator>
            <ChevronRight size={14} className="text-muted-foreground" />
          </BreadcrumbSeparator>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink className="text-muted-foreground pointer-events-none">
            Edit
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </ShadBreadcrumb>
  );
};

export default Breadcrumb;
