// /server/api/users/create.post.ts

import { serverSupabaseClient } from "#supabase/server";
import type { NewUserPayload } from "~/types/dto/jira-dto";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody<NewUserPayload>(event);

  // Validasi dasar
  if (!payload.key || !payload.display_name || !payload.email_address) {
    throw createError({
      statusCode: 400,
      statusMessage: "Key, Display Name, and Email are required",
    });
  }

  const { data, error } = await client
    .from("jira_users")
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Error jika 'key' sudah ada (karena UNIQUE constraint)
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "User with this key already exists.",
      });
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
