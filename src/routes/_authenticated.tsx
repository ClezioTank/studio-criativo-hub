import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { getAuthenticatedProfile } from "@/features/onboarding/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    const profile = await getAuthenticatedProfile();
    if (!profile.is_active) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login" });
    }
    if (!profile.onboarded && location.pathname !== "/onboarding") {
      throw redirect({ to: "/onboarding" });
    }

    return { user: data.user, profile };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
