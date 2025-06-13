// /composables/useSquads.ts

import type { NewSquadPayload } from "~/types/dto/jira-dto";
import type { JiraSquad } from "~/types/supabase-table";

export const useSquads = () => {
  // Fungsi untuk membuat squads baru
  const createSquad = async (payload: NewSquadPayload) => {
    try {
      // Panggil API endpoint yang kita buat di server
      const newSquad = await $fetch("/api/squads/create", {
        method: "POST",
        body: payload,
      });

      console.log("squads baru berhasil dibuat:", newSquad);
      return newSquad as JiraSquad;
    } catch (error) {
      console.error("Gagal membuat squads:", error);
      // Anda bisa menampilkan notifikasi error ke pengguna di sini
      return null;
    }
  };

  // Fungsi untuk mengambil semua squads
  const getAllSquads = async () => {
    const client = useSupabaseClient();
    try {
      const { data, error } = await client
        .from("jira_squads")
        // Kita ambil juga nama lead-nya untuk ditampilkan di daftar
        .select("*, lead:jira_users!fk_squad_lead(display_name)")
        .order("display_name");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Gagal mengambil daftar squads:", error);
      return null;
    }
  };

  // Fungsi untuk mengambil detail satu squads berdasarkan UUID
  const getSquadById = async (squadId: string) => {
    const client = useSupabaseClient();
    try {
      const { data, error } = await client
        .from("jira_squads")
        .select(
          `
        *,
        lead:jira_users!fk_squad_lead(uuid, key, display_name),
        jira_users!jira_users_squad_uuid_fkey(uuid, key, display_name)
      `,
        )
        .eq("uuid", squadId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Gagal mengambil detail squad:", error);
      return null;
    }
  };

  const updateSquad = async (payload: {
    uuid: string;
    display_name?: string;
    lead_uuid?: string | null;
  }) => {
    try {
      const updatedSquad = await $fetch("/api/squads/update", {
        method: "PUT", // Gunakan method PUT untuk update
        body: payload,
      });
      return updatedSquad;
    } catch (error) {
      console.error("Gagal mengupdate squads:", error);
      return null;
    }
  };

  const deleteSquad = async (uuid: string) => {
    try {
      await $fetch("/api/squads/delete", {
        method: "DELETE",
        body: { uuid },
      });
      return true; // Berhasil
    } catch (error) {
      console.error("Gagal menghapus squads:", error);
      return false; // Gagal
    }
  };

  return {
    createSquad,
    getAllSquads,
    getSquadById,
    updateSquad,
    deleteSquad,
  };
};
