import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/billing")({
  component: () => <PlaceholderPage title="Plano" />,
});

function PlaceholderPage({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold">{title}</h1>;
}
