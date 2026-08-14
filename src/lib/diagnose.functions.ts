import { createServerFn } from "@tanstack/react-start";

import {
  LEAF_CONCURRENCY,
  pickPrimary,
  summariseLeaves,
  type AiDiagnosis,
  type LeafBox,
  type LeafCheck,
  type VerifyResult,
} from "./leaf-types";
import { FRUIT_CONCURRENCY, type FruitCheck, type FruitDiagnosis } from "./fruit-types";

export type { FoundFruit, FruitCheck, FruitDiagnosis, FruitSummary } from "./fruit-types";
export { MAX_FRUITS, SUPPORTED_FRUITS, matchFruit, summariseFruits } from "./fruit-types";

export type {
  AiDiagnosis,
  FoundLeaf,
  LeafBox,
  LeafCheck,
  LeafDiagnosis,
  LeafMask,
  LeafSummary,
  RejectKind,
  VerifyResult,
} from "./leaf-types";
export {
  CHEMICAL_CONFIDENCE,
  MAX_LEAVES,
  MIN_CONFIDENCE,
  SUPPORTED_PLANTS,
  matchPlant,
  summariseLeaves,
} from "./leaf-types";

function readImage(image: unknown) {
  if (typeof image !== "string" || !image.startsWith("data:image/"))
    throw new Error("A leaf photo is required.");
  if (image.length > 8_000_000)
    throw new Error("This photo is too big. Please take a new photo and try again.");
  return image;
}

/** Stage 1: check the photo and find every leaf in it. */
export const verifyLeafPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: { image: string }) => ({ image: readImage(input?.image) }))
  .handler(async ({ data }): Promise<VerifyResult> => {
    const { verifyPhoto } = await import("./leaf-pipeline.server");
    const { GatewayError } = await import("./ai-gateway.server");
    try {
      return await verifyPhoto(data.image);
    } catch (error) {
      if (error instanceof GatewayError) throw new Error(error.message);
      throw error;
    }
  });

/** Stage 2: check one single leaf. The UI calls this once per leaf, in parallel. */
export const diagnoseOneLeaf = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      image: string;
      index: number;
      total: number;
      box: LeafBox;
      plant: string;
      where?: string | undefined;
      place?: string | undefined;
      weather?: string | undefined;
    }) => ({
      image: readImage(input?.image),
      index: Math.max(1, Math.round(Number(input?.index) || 1)),
      total: Math.max(1, Math.round(Number(input?.total) || 1)),
      box: input.box,
      plant: String(input?.plant ?? "Unknown plant").slice(0, 60),
      where: typeof input.where === "string" ? input.where.slice(0, 40) : undefined,
      place: typeof input.place === "string" ? input.place.slice(0, 120) : undefined,
      weather: typeof input.weather === "string" ? input.weather.slice(0, 400) : undefined,
    }),
  )
  .handler(async ({ data }): Promise<LeafCheck> => {
    const { diagnoseOne } = await import("./leaf-pipeline.server");
    return diagnoseOne(data);
  });

/** Stage 2 for fruits: check one single fruit. Called once per fruit, in parallel. */
export const diagnoseOneFruit = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      image: string;
      index: number;
      total: number;
      box: LeafBox;
      fruit: string;
      where?: string | undefined;
      place?: string | undefined;
      weather?: string | undefined;
    }) => ({
      image: readImage(input?.image),
      index: Math.max(1, Math.round(Number(input?.index) || 1)),
      total: Math.max(1, Math.round(Number(input?.total) || 1)),
      box: input.box,
      fruit: String(input?.fruit ?? "Fruit").slice(0, 60),
      where: typeof input.where === "string" ? input.where.slice(0, 40) : undefined,
      place: typeof input.place === "string" ? input.place.slice(0, 120) : undefined,
      weather: typeof input.weather === "string" ? input.weather.slice(0, 400) : undefined,
    }),
  )
  .handler(async ({ data }): Promise<FruitCheck> => {
    const { diagnoseFruitOne } = await import("./leaf-pipeline.server");
    return { fruit: await diagnoseFruitOne(data) };
  });

/** Whole photo in one call. Used for offline photos synced later. */
export const diagnoseLeaf = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { image: string; place?: string | undefined; weather?: string | undefined }) => ({
      image: readImage(input?.image),
      place: typeof input.place === "string" ? input.place.slice(0, 120) : undefined,
      weather: typeof input.weather === "string" ? input.weather.slice(0, 400) : undefined,
    }),
  )
  .handler(async ({ data }): Promise<AiDiagnosis> => {
    const { verifyPhoto, diagnoseOne, diagnoseFruitOne, reject, empty } =
      await import("./leaf-pipeline.server");
    const { GatewayError } = await import("./ai-gateway.server");
    try {
      const verify = await verifyPhoto(data.image);
      if (!verify.ok) {
        return {
          ...empty(),
          ok: false,
          rejectKind: verify.rejectKind,
          rejectReason: verify.rejectReason,
          rejectHelp: verify.rejectHelp,
        };
      }

      const checks: LeafCheck[] = [];
      for (let start = 0; start < verify.leaves.length; start += LEAF_CONCURRENCY) {
        const batch = verify.leaves.slice(start, start + LEAF_CONCURRENCY);
        const done = await Promise.all(
          batch.map((leaf) =>
            diagnoseOne({
              image: data.image,
              index: leaf.index,
              total: verify.leaves.length,
              box: leaf.box,
              plant: leaf.plant,
              where: leaf.where,
              place: data.place,
              weather: data.weather,
            }),
          ),
        );
        checks.push(...done);
      }

      const fruits: FruitDiagnosis[] = [];
      for (let start = 0; start < verify.fruits.length; start += FRUIT_CONCURRENCY) {
        const batch = verify.fruits.slice(start, start + FRUIT_CONCURRENCY);
        const done = await Promise.all(
          batch.map((fruit) =>
            diagnoseFruitOne({
              image: data.image,
              index: fruit.index,
              total: verify.fruits.length,
              box: fruit.box,
              fruit: fruit.fruit,
              where: fruit.where,
              place: data.place,
              weather: data.weather,
            }),
          ),
        );
        fruits.push(...done);
      }

      const leaves = checks.map((check) => check.leaf);
      const primary = pickPrimary(checks);
      const summary = summariseLeaves(leaves);
      const notice =
        summary.skipped > 0 ? "Some leaves could not be analysed accurately." : undefined;

      if (!primary) {
        const { fruitPrimary } = await import("./fruit-summary");
        const fruitOnly = fruitPrimary(fruits);
        if (fruitOnly) return { ...fruitOnly, leaves, fruits, notice };
        const firstProblem = checks.find((check) => check.full && !check.full.ok)?.full;
        const fallback =
          firstProblem ??
          reject("unknown-disease", "We could not identify a disease on these leaves.", [
            "Take a closer photo of the worst leaf, in soft daylight.",
            "If the plant keeps getting worse, ask a local agriculture officer.",
          ]);
        return { ...fallback, leaves, fruits, notice };
      }

      return { ...primary, leaves, fruits, notice };
    } catch (error) {
      if (error instanceof GatewayError) throw new Error(error.message);
      throw error;
    }
  });
