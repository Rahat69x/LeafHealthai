import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackBox({ onAnswer }: { onAnswer: (answer: "yes" | "no") => void }) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  function pick(value: "yes" | "no") {
    setAnswer(value);
    onAnswer(value);
    if (value === "yes") toast.success("Thank you for telling us.");
  }

  return (
    <div className="mt-5 rounded-2xl border border-dashed p-4">
      <p className="text-sm font-semibold text-foreground">Was this result helpful?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={answer === "yes" ? "default" : "outline"}
          className="min-h-11"
          onClick={() => pick("yes")}
          aria-pressed={answer === "yes"}
        >
          <ShieldCheck aria-hidden="true" /> Yes
        </Button>
        <Button
          variant={answer === "no" ? "default" : "outline"}
          className="min-h-11"
          onClick={() => pick("no")}
          aria-pressed={answer === "no"}
        >
          <ShieldCheck aria-hidden="true" /> No
        </Button>
      </div>

      {answer === "no" && !sent && (
        <div className="mt-3 space-y-2">
          <label htmlFor="feedback-note" className="text-sm text-muted-foreground">
            Tell us what looked wrong. This helps us get better.
          </label>
          <Textarea
            id="feedback-note"
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="For example: the plant name is wrong."
          />
          <Button
            className="min-h-11"
            onClick={() => {
              setSent(true);
              toast.success("Thank you. Your note is saved on this device.");
            }}
          >
            Send note
          </Button>
        </div>
      )}
      {sent && (
        <p className="mt-3 text-sm text-fern-ink">Thank you. We will use this to improve.</p>
      )}
    </div>
  );
}
