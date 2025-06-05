import dayjs from "dayjs";
import "dayjs/locale/id";
import { v4 as uuidv4 } from "uuid";

dayjs.locale("id");

/**
 * Mengubah ISO string dari Supabase menjadi format tanggal yang mudah dibaca
 * @param isoDate string ISO 8601 (contoh: "2025-05-15T14:21:00.000Z")
 * @param withTime boolean apakah menyertakan jam
 * @returns string dalam format "15 Mei 2025" atau "15 Mei 2025 21:21"
 */
export function formatReadableDate(isoDate: string, withTime = true): string {
  const formatStr = withTime ? "DD MMMM YYYY HH:mm" : "DD MMMM YYYY";
  return dayjs(isoDate).format(formatStr);
}

export function generateUuid(): string {
  return uuidv4();
}
