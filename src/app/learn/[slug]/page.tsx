import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/learn/lesson-player";
import { getLesson, LESSONS, neighbours } from "@/content";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };
  return { title: `${lesson.title} (${lesson.topic})`, description: lesson.tagline };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = neighbours(slug);
  return (
    <LessonPlayer
      lesson={lesson}
      prev={prev && { slug: prev.slug, title: prev.title }}
      next={next && { slug: next.slug, title: next.title }}
    />
  );
}
