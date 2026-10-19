import type { Metadata } from "next";
import { GLOSSARY } from "@/content";
import { Games } from "@/components/pages/games";

export const metadata: Metadata = { title: "Revision games", description: "Concept pairs, true/false blitz, odd one out and definition hangman for Grade 12 Geography." };

export default function GamesPage() {
  return <Games terms={GLOSSARY.map(({ term, def, topic }) => ({ term, def, topic }))} />;
}
