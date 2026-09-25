import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => <h1 className="text-2xl font-bold">Configurações administrativas</h1>,
});
