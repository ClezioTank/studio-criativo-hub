import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    },
    staleTime: 30_000,
  });
}

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  studio_id: string | null;
  studio_type: string | null;
  plan: string;
  subscription_status: string;
  payment_source: string | null;
  is_active: boolean;
  is_tester: boolean;
  onboarded: boolean;
  created_at: string;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);

      return {
        user,
        profile: (profile as Profile | null) ?? null,
        isAdmin: (roles ?? []).some((r) => r.role === "admin"),
      };
    },
  });
}
