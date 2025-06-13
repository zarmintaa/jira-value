// /server/api/squads/update-details.put.ts
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody(event);

  const {
    uuid,
    display_name,
    email_address,
    lead_uuid,
    members_to_add,
    members_to_remove,
  } = payload;

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Squad UUID wajib diisi",
    });
  }

  const { error } = await client.rpc("update_squad_details", {
    target_squad_uuid: uuid,
    new_display_name: display_name,
    new_email_address: email_address,
    new_lead_uuid: lead_uuid,
    add_member_uuids: members_to_add,
    remove_member_uuids: members_to_remove,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { status: 200, message: "Squad berhasil diperbarui" };
});
