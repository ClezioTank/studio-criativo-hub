import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: () => <h1 className="text-2xl font-bold">Pagamentos</h1>,
});
