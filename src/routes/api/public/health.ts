import { createFileRoute } from "@tanstack/react-router";

/** Health check for containers, load balancers and uptime monitors. */
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            status: "ok",
            ai: Boolean(
              process.env["AI_API_KEY"] ||
              process.env["OPENAI_API_KEY"] ||
              process.env["GEMINI_API_KEY"] ||
              process.env["LOVABLE_API_KEY"],
            ),
            time: new Date().toISOString(),
          },
          { headers: { "Cache-Control": "no-store" } },
        ),
    },
  },
});
