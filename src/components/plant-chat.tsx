import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Sparkles, User } from "lucide-react";
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
    <section
      className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-gradient-to-b from-card/85 to-card/55 backdrop-blur-2xl p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-7"
      aria-labelledby="chat-heading"
    >
      <div className="flex items-center gap-2.5">
        <span className="glass-icon-3d size-9 rounded-xl">
          <Bot className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </span>
        <h2 id="chat-heading" className="text-lg font-extrabold tracking-tight text-foreground">
          Ask the plant doctor
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask anything about your crop or leaf symptoms.{" "}
        {result ? "Answers use your last scan." : "Scan a leaf first for personalized answers."}
      </p>

      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                className="rounded-full h-8 px-3 text-xs"
                onClick={() => void send(item)}
              >
                <Sparkles className="size-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                {item}
              </Button>
            ))}
          </div>
        )}
        {turns.map((turn, index) => (
          <div
            key={index}
            className={`flex gap-2.5 items-end ${turn.role === "user" ? "justify-end" : ""}`}
          >
            {turn.role === "assistant" && (
              <span className="glass-icon-3d size-7 rounded-lg shrink-0 mb-1">
                <Bot
                  className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              </span>
            )}
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                turn.role === "user"
                  ? "bg-gradient-to-b from-fern to-forest text-white rounded-br-sm"
                  : "border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 text-foreground backdrop-blur-md rounded-bl-sm"
              }`}
            >
              {turn.content}
            </p>
            {turn.role === "user" && (
              <span className="glass-icon-3d size-7 rounded-lg shrink-0 mb-1">
                <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </span>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 animate-spin text-emerald-600" />
            <span>The plant doctor is thinking...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="mt-5 flex gap-2.5"
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
          className="min-h-11 rounded-xl border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-sm backdrop-blur-md"
        />
        <Button
          type="submit"
          size="icon"
          variant="default"
          className="size-11 rounded-xl shrink-0 shadow-md"
          disabled={busy}
          aria-label="Send question"
        >
          <Send className="size-4.5" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
