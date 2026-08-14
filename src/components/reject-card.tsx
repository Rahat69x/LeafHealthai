import { Leaf, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RejectKind } from "@/lib/diagnose.functions";

export interface Rejection {
  kind: RejectKind | undefined;
  reason: string;
  help: string[];
  image?: string | undefined;
}

const ICONS: Record<string, typeof Leaf> = {
  "not-leaf": ShieldCheck,
  "partial-leaf": Leaf,
  quality: Leaf,
  "unsupported-plant": Leaf,
  "low-confidence": ShieldCheck,
  "unknown-disease": ShieldCheck,
};

/** Shown instead of a result whenever we refuse to guess. */
export function RejectCard({ rejection, onRetry }: { rejection: Rejection; onRetry: () => void }) {
  const Icon = ICONS[rejection.kind ?? "quality"] ?? ShieldCheck;
  return (
    <Card role="alert" className="border-destructive/40 bg-destructive/5">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <span className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive-ink">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <CardTitle className="text-lg text-foreground">{rejection.reason}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            No result was given because a wrong answer could harm your crop.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rejection.image && (
          <img
            loading="lazy"
            decoding="async"
            src={rejection.image}
            alt="The photo you uploaded, which we could not check"
            className="h-32 w-32 rounded-lg border border-border object-cover opacity-70"
          />
        )}
        {rejection.help.length > 0 && (
          <ul className="space-y-1.5 text-sm text-foreground">
            {rejection.help.map((line) => (
              <li key={line} className="flex gap-2">
                <Leaf className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        <Button onClick={onRetry} variant="secondary">
          Upload another photo
        </Button>
      </CardContent>
    </Card>
  );
}
