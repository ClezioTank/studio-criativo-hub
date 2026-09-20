import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-accent text-accent-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-warning-foreground",
  danger: "bg-destructive/12 text-destructive",
};

const MAP: Record<string, keyof typeof TONES> = {
  // projetos
  Planejamento: "neutral",
  "Aguardando cliente": "warning",
  "Em andamento": "info",
  "Em revisão": "warning",
  Entregue: "success",
  "Concluído": "success",
  Cancelado: "danger",
  // tarefas
  "A fazer": "neutral",
  "Concluída": "success",
  // propostas
  Rascunho: "neutral",
  Enviada: "info",
  Aceita: "success",
  Recusada: "danger",
  "Alteração solicitada": "warning",
  // feedback
  Novo: "info",
  "Em análise": "warning",
  Resolvido: "success",
  // pagamentos
  Pago: "success",
  Pendente: "warning",
  // prioridade
  Baixa: "neutral",
  Normal: "info",
  Alta: "danger",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = MAP[value] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}
