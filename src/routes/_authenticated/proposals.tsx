import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/proposals")({
  component: () => <PlaceholderPage title="Propostas" />,
});

function PlaceholderPage({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold">{title}</h1>;
}
