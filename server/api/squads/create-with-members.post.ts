// /server/api/squads/create-with-members.post.ts
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody(event);

  // Ambil data dari payload
  const { display_name, email_address, lead_uuid, member_uuids } = payload;

  if (!display_name || !email_address) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama & Email Squad wajib diisi",
    });
  }

  // Panggil fungsi RPC di database
  const { data, error } = await client.rpc("create_squad_with_members", {
    squad_display_name: display_name,
    squad_email_address: email_address,
    lead_user_uuid: lead_uuid || null,
    member_user_uuids: member_uuids || [],
  });

  if (error) {
    // Cek jika error adalah karena 'unique constraint violation' (kode 23505)
    if (error.code === "23505") {
      // Buat pesan yang lebih ramah pengguna
      throw createError({
        statusCode: 409, // 409 Conflict adalah status yang tepat untuk data duplikat
        statusMessage: "Gagal: Email atau nama squad sudah terdaftar.",
      });
    }

    // Untuk error lainnya, kembalikan pesan umum
    throw createError({
      statusCode: 500,
      statusMessage: "Terjadi kesalahan pada server, silakan coba lagi.",
    });
  }

  return { new_squad_uuid: data };

  return { new_squad_uuid: data };
});
