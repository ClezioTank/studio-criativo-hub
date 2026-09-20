export const CURRENCIES = ["Kz", "BRL", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PROJECT_STATUS = [
  "Planejamento",
  "Aguardando cliente",
  "Em andamento",
  "Em revisão",
  "Entregue",
  "Concluído",
  "Cancelado",
] as const;

export const TASK_STATUS = ["A fazer", "Em andamento", "Concluída"] as const;
export const TASK_PRIORITY = ["Baixa", "Normal", "Alta"] as const;

export const PROPOSAL_STATUS = [
  "Rascunho",
  "Enviada",
  "Aceita",
  "Recusada",
  "Alteração solicitada",
] as const;

export const FEEDBACK_TYPES = ["Bug", "Sugestão", "Dificuldade", "Outro"] as const;
export const FEEDBACK_STATUS = ["Novo", "Em análise", "Resolvido"] as const;

export const STUDIO_TYPES = [
  "Designer",
  "Editor de vídeo",
  "Video Maker",
  "Agência",
  "Marketing",
  "Outro",
] as const;

export const PLANS = ["free", "beta", "pro"] as const;
export const SUBSCRIPTION_STATUS = [
  "inactive",
  "trialing",
  "active",
  "past_due",
  "canceled",
] as const;

export const PLAN_LABEL: Record<string, string> = {
  free: "Gratuito",
  beta: "Beta",
  pro: "Pro",
};

export const SUBSCRIPTION_LABEL: Record<string, string> = {
  inactive: "Inativa",
  trialing: "Período de teste",
  active: "Ativa",
  past_due: "Pagamento em atraso",
  canceled: "Cancelada",
};

export const SUPPORT_WHATSAPP = "https://wa.me/244900000000";
