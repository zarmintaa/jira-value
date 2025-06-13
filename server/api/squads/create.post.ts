// /server/api/squads/create.post.ts

import { serverSupabaseClient } from "#supabase/server";
import { NewSquadPayload } from "~/types/dto/jira-dto";

export default defineEventHandler(async (event) => {
  // 1. Dapatkan Supabase client khusus untuk server
  const client = await serverSupabaseClient(event);

  // 2. Baca data yang dikirim dari frontend
  const payload = await readBody<NewSquadPayload>(event);

  // Validasi sederhana
  if (!payload.display_name || !payload.email_address) {
    throw createError({
      statusCode: 400,
      statusMessage: "Display name and email address are required",
    });
  }

  // 3. Lakukan operasi INSERT ke database
  const { data, error } = await client
    .from("jira_squads")
    .insert({
      display_name: payload.display_name,
      email_address: payload.email_address,
      // lead_uuid akan NULL secara default sesuai skema kita
    })
    .select() // Ambil kembali data yang baru saja dibuat
    .single(); // Karena kita hanya membuat satu

  // 4. Handle error jika ada
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  // 5. Kembalikan data squad yang baru dibuat ke frontend
  return data;
});
