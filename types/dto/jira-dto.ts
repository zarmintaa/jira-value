export type NewSquadPayload = {
  display_name: string;
  email_address: string;
};

// Payload untuk membuat user baru
export type NewUserPayload = {
  key: string;
  summary: string;
  display_name: string;
  email_address: string;
  description?: string;
  // User bisa saja dibuat tanpa langsung masuk ke squads
  squad_uuid: string | null;
};

// Payload untuk mengupdate user
// Sebagian besar field bersifat opsional, tapi uuid wajib ada
export type UpdateUserPayload = Partial<Omit<NewUserPayload, "key">> & {
  uuid: string;
};
