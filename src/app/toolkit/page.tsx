import type { Metadata } from "next";
import { Toolkit } from "@/components/pages/toolkit";

export const metadata: Metadata = { title: "Interactive toolkit", description: "Cyclone simulators, river profiles, urban models, map calculators, cross-sections and GIS tools." };

export default function ToolkitPage() {
  return <Toolkit />;
}
