import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudioOS — Organize o seu estúdio criativo" },
      {
        name: "description",
        content:
          "Clientes, projetos, propostas e tarefas num workspace simples para designers, editores de vídeo e agências criativas.",
      },
      { property: "og:title", content: "StudioOS — Organize o seu estúdio criativo" },
      {
        property: "og:description",
        content: "Workspace simples para designers, editores de vídeo e pequenas agências criativas.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <span className="text-base font-extrabold tracking-tight">
          Studio<span className="text-muted-foreground">OS</span>
        </span>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Criar conta</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pt-14 pb-24">
        <p className="text-sm font-medium text-muted-foreground">
          Para designers, editores de vídeo e agências criativas
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] font-extrabold sm:text-6xl">
          O seu estúdio organizado num único lugar.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Clientes, projetos, propostas e tarefas sem planilhas espalhadas. Simples o suficiente para
          usar pelo celular, entre uma entrega e outra.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/signup">Começar agora</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clientes", "Dados, contactos e histórico de cada cliente."],
            ["Projetos", "Valores, prazos e estado de cada entrega."],
            ["Propostas", "Link público para o cliente aceitar ou pedir alteração."],
            ["Tarefas", "O que fazer hoje, por projeto e prioridade."],
          ].map(([title, text]) => (
            <div key={title} className="surface p-5">
              <p className="font-semibold">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
