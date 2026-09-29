import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: () => <h1 className="text-2xl font-bold">Feedback administrativo</h1>,
});
