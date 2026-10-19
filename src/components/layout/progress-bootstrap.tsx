"use client";
import { useEffect } from "react";
import { registerTopicIndex } from "@/lib/progress";

/** Tells the progress store which lessons belong to each topic (for topic badges). */
export function ProgressBootstrap({ topicIndex }: { topicIndex: Record<string, string[]> }) {
  useEffect(() => {
    registerTopicIndex(topicIndex);
  }, [topicIndex]);
  return null;
}
