import { createFileRoute } from "@tanstack/react-router";
import { handleExplain } from "@/lib/explain.server";

export const Route = createFileRoute("/api/explain")({
  server: { handlers: { POST: ({ request }) => handleExplain(request) } },
});
