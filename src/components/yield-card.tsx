import { useEffect, useState } from "react";
import { Droplet, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalysisResult } from "@/lib/demo-analysis";
import {
  DEFAULT_INPUTS,
  GROWTH_STAGES,
  estimateYield,
  loadInputs,
  saveInputs,
  type FarmInputs,
  type GrowthStage,
} from "@/lib/yield-estimate";

const IMPACT_STYLE = {
  None: "border-fern/40 bg-fern/15 text-fern-ink",
  Low: "border-fern/40 bg-fern/15 text-fern-ink",
  Medium: "border-amber/40 bg-amber/15 text-amber-ink",
  High: "border-destructive/40 bg-destructive/10 text-destructive-ink",
} as const;

/** Rough harvest loss and money impact for the field this leaf came from. */
export function YieldCard({
  result,
  weather,
}: {
  result: AnalysisResult;
  weather?: { humidity: number; rainChance: number } | null;
}) {
  const [inputs, setInputs] = useState<FarmInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    setInputs(loadInputs());
  }, []);

  const update = (patch: Partial<FarmInputs>) => {
    const next = { ...inputs, ...patch };
    setInputs(next);
    saveInputs(next);
  };

  const estimate = estimateYield(result, inputs, weather ?? null);

  return (
    <section className="rounded-2xl border bg-muted/40 p-4" aria-labelledby="yield-heading">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3
            id="yield-heading"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Droplet className="size-4 text-primary" aria-hidden="true" /> Possible harvest loss
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A rough guide for your field, not an exact number.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 rounded-full ${IMPACT_STYLE[estimate.impact]}`}
        >
          {estimate.impact} impact
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Harvest if healthy</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{estimate.healthyTons} t</p>
        </div>
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Harvest expected now</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{estimate.expectedTons} t</p>
        </div>
        <div className="rounded-xl border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Possible loss</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {estimate.lossPercent}%{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({estimate.range[0]}–{estimate.range[1]}%)
            </span>
          </p>
        </div>
      </div>

      <p className="mt-3 rounded-xl border bg-background/60 p-3 text-sm text-foreground">
        That is about <strong>{estimate.lossTons} tons</strong>, worth roughly{" "}
        <strong>
          {estimate.currency} {estimate.money.toLocaleString()}
        </strong>{" "}
        at the price you entered.
      </p>

      {estimate.drivers.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {estimate.drivers.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm text-foreground">{estimate.ifIgnored}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="yield-area">Field size (hectares)</Label>
          <Input
            id="yield-area"
            type="number"
            min={0.01}
            step={0.1}
            inputMode="decimal"
            value={inputs.areaHa}
            onChange={(event) => update({ areaHa: Number(event.target.value) || 0.01 })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="yield-price">Price for 1 kg</Label>
          <Input
            id="yield-price"
            type="number"
            min={0}
            step={0.05}
            inputMode="decimal"
            value={inputs.pricePerKg}
            onChange={(event) => update({ pricePerKg: Number(event.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="yield-currency">Currency</Label>
          <Input
            id="yield-currency"
            value={inputs.currency}
            maxLength={6}
            onChange={(event) => update({ currency: event.target.value.toUpperCase() })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="yield-stage">Crop stage</Label>
          <Select
            value={inputs.stage ?? "Fruiting"}
            onValueChange={(value) => update({ stage: value as GrowthStage })}
          >
            <SelectTrigger id="yield-stage">
              <SelectValue placeholder="Pick a stage" />
            </SelectTrigger>
            <SelectContent>
              {GROWTH_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        This is an estimate based on average yields
        {estimate.approximateCrop
          ? " (no average is available for this crop, so we use a general figure)"
          : ""}
        , the disease severity and the weather. Real results depend on your soil, seed and care. Do
        not use it for insurance or loan decisions.
      </p>
    </section>
  );
}
