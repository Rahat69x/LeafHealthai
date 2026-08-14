import { createFileRoute } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLang } from "@/lib/i18n";

const TITLE = "Help and questions | LeafCheck";
const DESCRIPTION =
  "Answers about photo rules, privacy, offline use and how accurate the leaf check is.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

const QUESTIONS = [
  {
    q: "What photo should I upload?",
    a: "One leaf, filling most of the frame, in good daylight, on a plain background. Hold the camera still so the photo is sharp.",
  },
  {
    q: "Which file types work?",
    a: "JPG, JPEG, PNG, WEBP, HEIC, AVIF, BMP, TIFF and GIF all work. We check the photo whatever type it is.",
  },
  {
    q: "Why was my photo refused?",
    a: "It may be too dark, too bright, blurry, too small, or it may not show a leaf. The message tells you the reason.",
  },
  {
    q: "Where are my photos saved?",
    a: "Only on this device, in your browser. Nothing is uploaded to a server.",
  },
  {
    q: "Does it work without internet?",
    a: "Yes. The leaf check runs on your device. Only the weather part needs internet.",
  },
  {
    q: "How correct is the result?",
    a: "It is a guide, not a final answer. Always ask a local plant expert before using any chemical.",
  },
  {
    q: "Can I get a report?",
    a: "Yes. Every result has a Download report button that makes a PDF you can print or share.",
  },
  {
    q: "Can I use my language?",
    a: "Yes. Use the language button in the header for English, Bangla or Hindi menus.",
  },
];

function FaqPage() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {t("navFaq")}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Short answers to the most common questions.
      </p>

      <Accordion type="single" collapsible className="mt-6">
        {QUESTIONS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
