// /server/api/users/delete.delete.ts

import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const { uuid } = await readBody<{ uuid: string }>(event);

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: "User UUID is required",
    });
  }

  const { error } = await client.from("jira_users").delete().eq("uuid", uuid);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { status: 200, message: "User berhasil dihapus" };
});
