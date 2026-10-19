import { Hero } from "@/components/home/hero";
import { AdhdSection, Features, FinalCta, LessonFlow, PracticeStrip, TermMarquee, TopicTracks, type TopicSummary } from "@/components/home/sections";
import { EXAM_QUESTIONS, GLOSSARY, LESSONS, lessonsForTopic } from "@/content";
import { WIDGET_COUNT } from "@/components/widgets/catalogue";
import { TOPICS, topicMeta } from "@/lib/topics";
import { shuffle } from "@/lib/utils";

export default function HomePage() {
  const topics: TopicSummary[] = TOPICS.map((t) => ({
    topic: t.topic,
    lessons: lessonsForTopic(t.topic).map((l) => ({ slug: l.slug, title: l.title, emoji: l.emoji })),
  }));
  const marquee = shuffle(GLOSSARY, "home").slice(0, 14).map((g) => ({ title: g.term, text: g.def, colour: topicMeta(g.topic).colour }));
  return (
    <>
      <Hero stats={{ lessons: LESSONS.length, tools: WIDGET_COUNT, cards: GLOSSARY.length, exam: EXAM_QUESTIONS.length }} />
      <TermMarquee terms={marquee} />
      <TopicTracks topics={topics} />
      <PracticeStrip />
      <Features />
      <LessonFlow />
      <AdhdSection />
      <FinalCta firstSlug={LESSONS[0].slug} />
    </>
  );
}
