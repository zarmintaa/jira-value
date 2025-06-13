// Tipe ini akan merepresentasikan hasil query kita nanti

export interface JiraUserWithSquad {
  uuid: string;
  key: string;
  summary: string;
  // status: string; <-- BARIS INI SEKARANG DIHAPUS
  display_name: string;
  email_address: string;
  // Ini bagian pentingnya: kita akan mengambil data squads yang berelasi
  jira_squads: {
    display_name: string;
    lead_uuid: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

// Tipe data minimal untuk merepresentasikan info pengguna
export interface JiraUserBasicInfo {
  uuid: string;
  key: string;
  display_name: string;
}

// Tipe data lengkap untuk sebuah squads, termasuk relasinya
export interface JiraSquadWithDetails {
  uuid: string;
  display_name: string;
  email_address: string;
  created_at: string;

  // Objek yang berisi info user yang menjadi lead squads ini
  // Bisa null jika squads belum memiliki lead
  lead: JiraUserBasicInfo | null;

  // Array yang berisi daftar user yang menjadi anggota squads ini
  jira_users: JiraUserBasicInfo[];
}

// types/JiraSquad.ts (bisa ditambahkan di file yang sama)

// Tipe data dasar yang merepresentasikan kolom di tabel jira_squads
// Berguna untuk payload saat membuat (create) atau mengubah (update) data
export interface JiraSquad {
  uuid: string;
  display_name: string;
  email_address: string;
  lead_uuid: string | null; // Saat update, Anda mungkin hanya perlu mengirim UUID lead-nya
  created_at: string;
  updated_at: string;
}

export interface JiraUserBasicInfo {
  uuid: string;
  key: string;
  display_name: string;
}
