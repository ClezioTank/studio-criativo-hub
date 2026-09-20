import { supabase } from "@/integrations/supabase/client";

export async function logActivity(params: {
  userId: string;
  studioId?: string | null;
  event: string;
  entity?: string;
  description?: string;
}) {
  await supabase.from("activity_logs").insert({
    user_id: params.userId,
    studio_id: params.studioId ?? null,
    event: params.event,
    entity: params.entity ?? null,
    description: params.description ?? null,
  });
}
