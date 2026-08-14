import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Leaf, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askPlantDoctor, type ChatTurn } from "@/lib/chat.functions";
import type { AnalysisResult } from "@/lib/demo-analysis";
import { useLang } from "@/lib/i18n";

const SUGGESTIONS = [
  "Why is my plant yellow?",
  "How do I treat this disease?",
  "Can this disease spread?",
  "How long will recovery take?",
];

export function PlantChat({ result }: { result?: AnalysisResult | null }) {
  const { lang } = useLang();
  const ask = useServerFn(askPlantDoctor);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    const next: ChatTurn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const context = result
        ? `${result.plant} · ${result.disease} · severity ${result.severity} · confidence ${result.confidence}%`
        : "";
      const answer = await ask({ data: { messages: next, context, lang } });
      setTurns([...next, { role: "assistant", content: answer.reply }]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The plant doctor is busy. Please try again.",
      );
      setTurns(turns);
    } finally {
      setBusy(false);
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="chat-heading">
      <h2 id="chat-heading" className="flex items-center gap-2 text-lg font-bold text-foreground">
        <ShieldCheck className="size-5 text-primary" aria-hidden="true" /> Ask the plant doctor
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask anything about your plant.{" "}
        {result ? "Answers use your last scan." : "Scan a leaf first for better answers."}
      </p>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-live="polite">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => void send(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        )}
        {turns.map((turn, index) => (
          <div key={index} className={`flex gap-2 ${turn.role === "user" ? "justify-end" : ""}`}>
            {turn.role === "assistant" && (
              <ShieldCheck className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                turn.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {turn.content}
            </p>
            {turn.role === "user" && (
              <Leaf className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        ))}
        {busy && <p className="text-sm text-muted-foreground">The plant doctor is thinking...</p>}
        <div ref={endRef} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your question..."
          aria-label="Your question"
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          className="min-h-11 min-w-11"
          disabled={busy}
          aria-label="Send question"
        >
          <Leaf aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
