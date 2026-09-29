import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => <h1 className="text-2xl font-bold">Usuários</h1>,
});
