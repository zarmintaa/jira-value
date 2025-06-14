// /composables/useUsers.ts

import type { NewUserPayload, UpdateUserPayload } from "~/types/dto/jira-dto";
import type { JiraUserWithSquad } from "~/types/supabase-table";

export const useUsers = () => {
  const client = useSupabaseClient();

  // CREATE
  const createUser = async (payload: NewUserPayload) => {
    try {
      const newUser = await $fetch("/api/users/create", {
        method: "POST",
        body: payload,
      });
      return newUser;
    } catch (error) {
      console.error("Gagal membuat user:", error);
      return null;
    }
  };

  // READ (ALL)
  const getAllUsers = async () => {
    try {
      const { data, error } = await client
        .from("jira_users")
        // Beri tahu Supabase untuk menggunakan relasi spesifik dan beri nama hasilnya 'jira_squads'
        .select(
          "*, jira_squads:jira_squads!jira_users_squad_uuid_fkey(display_name)",
        )
        .order("display_name");
      if (error) throw error;
      return data as JiraUserWithSquad[];
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      return [];
    }
  };

  // READ (ONE) - Jika diperlukan
  const getUserById = async (uuid: string) => {
    try {
      const { data, error } = await client
        .from("jira_users")
        .select("*, jira_squads:jira_squads!jira_users_squad_uuid_fkey(*)")
        .eq("uuid", uuid)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Gagal mengambil user ${uuid}:`, error);
      return null;
    }
  };

  // UPDATE
  const updateUser = async (payload: UpdateUserPayload) => {
    try {
      const updatedUser = await $fetch("/api/users/update", {
        method: "PUT",
        body: payload,
      });
      return updatedUser;
    } catch (error) {
      console.error("Gagal mengupdate user:", error);
      return null;
    }
  };

  // DELETE
  const deleteUser = async (uuid: string) => {
    try {
      await $fetch("/api/users/delete", { method: "DELETE", body: { uuid } });
      return true;
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      return false;
    }
  };

  const getAvailableUsers = async () => {
    const client = useSupabaseClient();
    try {
      const { data, error } = await client
        .from("jira_users")
        .select("uuid, display_name, key")
        .is("squad_uuid", null) // Hanya ambil user yang squad_uuid nya NULL
        .order("display_name");
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Gagal mengambil user yang tersedia:", err);
      return [];
    }
  };

  const getUserByKey = async (key: string) => {
    const client = useSupabaseClient();
    try {
      const { data, error } = await client
        .from("jira_users")
        // Ambil data user beserta detail squad-nya
        .select("*, jira_squads(*)")
        .eq("key", key) // Cari berdasarkan kolom 'key'
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Gagal mengambil user dengan key ${key}:`, err);
      return null;
    }
  };

  return {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAvailableUsers,
    getUserByKey,
  };
};
