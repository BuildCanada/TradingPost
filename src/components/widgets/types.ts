import { ComponentType } from "react";

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  externalUrl: string;
  size: "small" | "big";
  featured: boolean;
  order: number;
  accentColor: string | null;
}

export interface WidgetProps {
  project: ProjectData;
}

export type WidgetComponent = ComponentType<WidgetProps>;
