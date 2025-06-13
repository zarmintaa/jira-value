// /server/api/users/update.put.ts

import { serverSupabaseClient } from "#supabase/server";
import type { UpdateUserPayload } from "~/types/dto/jira-dto";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody<UpdateUserPayload>(event);

  if (!payload.uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: "User UUID is required",
    });
  }

  const { uuid, ...updateData } = payload;

  const { data, error } = await client
    .from("jira_users")
    .update(updateData)
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    // Ini akan menangkap error dari trigger jika mencoba memindahkan seorang lead
    if (error.message.includes("Invalid move: This user leads squad")) {
      throw createError({ statusCode: 409, statusMessage: error.message });
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
