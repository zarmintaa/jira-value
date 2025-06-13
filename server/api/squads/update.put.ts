// /server/api/squads/update.put.ts

import { serverSupabaseClient } from "#supabase/server";

// Tipe data untuk payload update
type UpdateSquadPayload = {
  uuid: string; // Wajib ada untuk tahu squads mana yang di-update
  display_name?: string;
  lead_uuid?: string | null;
};

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody<UpdateSquadPayload>(event);

  if (!payload.uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: "squads UUID is required",
    });
  }

  // Siapkan data yang akan diupdate, hapus uuid dari objek
  const { uuid, ...updateData } = payload;

  const { data, error } = await client
    .from("jira_squads")
    .update(updateData)
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    // Cek jika error karena trigger kita (misal, lead bukan anggota squads)
    if (error.message.includes("A squads lead must be a member")) {
      throw createError({ statusCode: 409, statusMessage: error.message });
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
