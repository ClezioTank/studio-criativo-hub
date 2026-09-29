import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const studioTypes = [
  "Designer",
  "Video Editor",
  "Video Maker",
  "Agência",
  "Marketing",
  "Outro",
] as const;

const onboardingInput = z.object({
  studioName: z.string().trim().min(1, "Informe o nome do studio.").max(120),
  studioType: z.enum(studioTypes),
});

type Profile = {
  id: string;
  is_active: boolean;
  onboarded: boolean;
  studio_id: string | null;
};

async function getSupabaseAdmin() {
  // This import stays inside a server-function handler. The service-role client
  // never becomes part of the browser bundle and is only used after the bearer
  // token middleware has established the authenticated user ID.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function profileValues(userId: string, claims: Record<string, unknown>) {
  const metadata = claims["user_metadata"];
  const fullName =
    metadata && typeof metadata === "object" && "full_name" in metadata
      ? String(metadata.full_name ?? "").trim() || null
      : null;

  return {
    id: userId,
    email: typeof claims["email"] === "string" ? claims["email"] : null,
    full_name: fullName,
  };
}

async function getOrCreateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  claims: Record<string, unknown>,
): Promise<Profile> {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id, is_active, onboarded, studio_id")
    .eq("id", userId)
    .maybeSingle();

  if (readError) throw new Error("Não foi possível verificar o seu perfil.");
  if (existing) return existing;

  const { error: insertError } = await supabase
    .from("profiles")
    .insert(profileValues(userId, claims));
  if (insertError && insertError.code !== "23505") {
    throw new Error("Não foi possível criar o seu perfil. Tente novamente.");
  }

  const { data: profile, error: retryError } = await supabase
    .from("profiles")
    .select("id, is_active, onboarded, studio_id")
    .eq("id", userId)
    .single();
  if (retryError || !profile) throw new Error("Não foi possível recuperar o seu perfil.");
  return profile;
}

export const getAuthenticatedProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getSupabaseAdmin();
    return getOrCreateProfile(supabase, context.userId, context.claims);
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(onboardingInput)
  .handler(async ({ data, context }) => {
    const supabase = await getSupabaseAdmin();
    const profile = await getOrCreateProfile(supabase, context.userId, context.claims);
    if (!profile.is_active) throw new Error("A sua conta está desativada. Contacte o suporte.");
    if (profile.onboarded) return { studioId: profile.studio_id };

    let studioId = profile.studio_id;
    if (!studioId) {
      const { data: existingStudio, error: existingStudioError } = await supabase
        .from("studios")
        .select("id")
        .eq("owner_id", context.userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (existingStudioError) {
        throw new Error("Não foi possível verificar o seu studio. Tente novamente.");
      }

      if (existingStudio) {
        studioId = existingStudio.id;
      } else {
        const { data: studio, error: studioError } = await supabase
          .from("studios")
          .insert({ owner_id: context.userId, name: data.studioName, type: data.studioType })
          .select("id")
          .single();
        if (studioError || !studio) {
          throw new Error("Não foi possível criar o seu studio. Tente novamente.");
        }
        studioId = studio.id;
      }
    }

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({ studio_id: studioId, studio_type: data.studioType, onboarded: true })
      .eq("id", context.userId)
      .select("id")
      .maybeSingle();
    if (profileError || !updatedProfile) {
      throw new Error(
        "O studio foi criado, mas não foi possível concluir o onboarding. Tente novamente.",
      );
    }

    return { studioId };
  });

export { studioTypes };
