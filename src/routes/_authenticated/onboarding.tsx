import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { completeOnboarding, studioTypes } from "@/features/onboarding/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: ({ context }) => {
    if (context.profile.onboarded) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const saveOnboarding = useServerFn(completeOnboarding);
  const [studioName, setStudioName] = useState("");
  const [studioType, setStudioType] = useState<(typeof studioTypes)[number]>("Designer");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await saveOnboarding({ data: { studioName, studioType } });
      toast.success("Studio configurado com sucesso.");
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível concluir o onboarding.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg py-10">
      <h1 className="text-2xl font-bold">Configure o seu studio</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conte-nos um pouco sobre o seu trabalho para preparar o seu workspace.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="studio-name">Nome do studio ou agência</Label>
          <Input
            id="studio-name"
            required
            maxLength={120}
            value={studioName}
            onChange={(event) => setStudioName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studio-type">Tipo de trabalho</Label>
          <select
            id="studio-type"
            value={studioType}
            onChange={(event) => setStudioType(event.target.value as (typeof studioTypes)[number])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {studioTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "A configurar..." : "Concluir configuração"}
        </Button>
      </form>
    </div>
  );
}
