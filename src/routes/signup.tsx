import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthenticatedProfile } from "@/features/onboarding/auth.functions";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — StudioOS" },
      { name: "description", content: "Crie a sua conta StudioOS e organize o seu estúdio." },
      { property: "og:title", content: "Criar conta — StudioOS" },
      {
        property: "og:description",
        content: "Crie a sua conta StudioOS e organize o seu estúdio.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setSent(true);
      return;
    }
    try {
      await getAuthenticatedProfile();
      await navigate({ to: "/onboarding" });
    } catch (profileError) {
      toast.error(
        profileError instanceof Error
          ? profileError.message
          : "A conta foi criada, mas não foi possível preparar o seu perfil.",
      );
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold">Confirme o seu email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviámos um link de confirmação para <strong>{email}</strong>. Depois de confirmar,
            volte e faça login.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Ir para o login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-base font-extrabold tracking-tight">
          Studio<span className="text-muted-foreground">OS</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Leva menos de um minuto.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "A criar..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
