import { useEffect, useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Lets the user give this plant a name (e.g. "Tomato bed 1") so repeat checks
 * line up into one growth and recovery timeline.
 */
export function PlantTagBox({
  value,
  known,
  onSave,
}: {
  value?: string | undefined;
  known: string[];
  onSave: (tag: string) => void;
}) {
  const [tag, setTag] = useState(value ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTag(value ?? "");
    setSaved(false);
  }, [value]);

  const save = (next: string) => {
    const clean = next.trim().slice(0, 40);
    if (!clean) return;
    onSave(clean);
    setTag(clean);
    setSaved(true);
  };

  return (
    <section className="mt-5 rounded-2xl border bg-muted/40 p-4" aria-labelledby="tag-heading">
      <h3
        id="tag-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <Leaf className="size-4 text-primary" aria-hidden="true" /> Follow this plant over time
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Give it a name and use the same name next time. We will then show how it gets better or
        worse.
      </p>

      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          save(tag);
        }}
      >
        <div className="grid min-w-48 flex-1 gap-1.5">
          <Label htmlFor="plant-tag" className="sr-only">
            Plant name
          </Label>
          <Input
            id="plant-tag"
            value={tag}
            maxLength={40}
            placeholder="Tomato bed 1"
            onChange={(event) => {
              setTag(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <Button type="submit" className="min-h-11" disabled={!tag.trim() || saved}>
          {saved ? <ShieldCheck aria-hidden="true" /> : null}
          {saved ? "Saved" : "Save name"}
        </Button>
      </form>

      {known.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {known.slice(0, 6).map((name) => (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9"
              onClick={() => save(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
