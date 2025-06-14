// /server/api/users/all.get.ts
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { data: users, error } = await supabase
    .from("jira_users")
    .select("key, display_name, email_address"); // Ambil kolom yang dibutuhkan

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil pengguna dari DB.",
    });
  }
  return users;
});
