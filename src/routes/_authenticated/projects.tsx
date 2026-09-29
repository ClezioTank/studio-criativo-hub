import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects")({
  component: () => <PlaceholderPage title="Projetos" />,
});

function PlaceholderPage({ title }: { title: string }) {
  return <h1 className="text-2xl font-bold">{title}</h1>;
}
