import { createServerFn } from "@tanstack/react-start";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const askPlantDoctor = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatTurn[]; context?: string; lang?: string }) => {
    if (!Array.isArray(input?.messages) || input.messages.length === 0) {
      throw new Error("Please type a question.");
    }
    return {
      messages: input.messages.slice(-12).map((turn) => ({
        role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(turn.content ?? "").slice(0, 2000),
      })),
      context: typeof input.context === "string" ? input.context.slice(0, 2000) : "",
      lang: input.lang === "bn" || input.lang === "hi" ? input.lang : "en",
    };
  })
  .handler(async ({ data }) => {
    const { callGateway, GatewayError } = await import("./ai-gateway.server");
    const language =
      data.lang === "bn" ? "Bangla" : data.lang === "hi" ? "Hindi" : "very simple English";

    const system = `You are a friendly plant doctor for small farmers. Answer in ${language}.
Use short sentences and simple words. Give practical steps. Keep answers under 120 words.
Always say to ask a local expert before using strong chemicals.
${data.context ? `The farmer's last scan result: ${data.context}` : "There is no scan result yet."}`;

    try {
      const reply = await callGateway([{ role: "system", content: system }, ...data.messages]);
      return { reply: reply.trim() || "Sorry, I could not answer that. Please ask again." };
    } catch (error) {
      if (error instanceof GatewayError) throw new Error(error.message);
      throw error;
    }
  });
