import type { Metadata } from "next";
import { GLOSSARY, lessonsForTopic } from "@/content";
import { ProgressDashboard, type TopicLessons } from "@/components/pages/progress-dashboard";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: "Your progress" };

export default function ProgressPage() {
  const topics: TopicLessons[] = TOPICS.map((t) => ({ topic: t.topic, colour: t.colour, emoji: t.emoji, lessons: lessonsForTopic(t.topic).map((l) => ({ slug: l.slug, title: l.title, emoji: l.emoji })) }));
  return <ProgressDashboard topics={topics} cardTotal={GLOSSARY.length} />;
}
