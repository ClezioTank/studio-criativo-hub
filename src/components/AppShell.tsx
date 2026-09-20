import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
  MessageSquare,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MAIN = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/projects", label: "Projetos", icon: FolderKanban },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/proposals", label: "Propostas", icon: FileText },
  { to: "/tasks", label: "Tarefas", icon: CheckSquare },
] as const;

const SECONDARY = [
  { to: "/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/billing", label: "Plano", icon: CreditCard },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/dashboard" className="text-base font-extrabold tracking-tight">
            Studio<span className="text-muted-foreground">OS</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {MAIN.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(item.to)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-2 flex flex-col gap-1 px-4 pb-6">
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    {data?.profile?.full_name || data?.user.email}
                  </p>
                  {[...MAIN, ...SECONDARY].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
                  {data?.isAdmin ? (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <Shield className="size-4 text-muted-foreground" />
                      Administração
                    </Link>
                  ) : null}
                  <button
                    onClick={signOut}
                    className="mt-2 flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {MAIN.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                isActive(item.to) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
