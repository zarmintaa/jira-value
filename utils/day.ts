import dayjs from "dayjs";
import "dayjs/locale/id"; // Locale untuk bahasa Indonesia
import utc from "dayjs/plugin/utc"; // Plugin untuk menangani UTC
import timezone from "dayjs/plugin/timezone"; // Plugin untuk konversi timezone

// Aktifkan plugin yang dibutuhkan
dayjs.extend(utc);
dayjs.extend(timezone);

// Atur locale default jika Anda ingin mayoritas menggunakan bahasa Indonesia
dayjs.locale("id");

// Tipe data untuk opsi agar lebih jelas
interface FormatDateOptions {
  withTime?: boolean;
  locale?: string;
  targetTimezone?: string; // misal: 'Asia/Jakarta' atau 'UTC'
}

/**
 * Mengubah string ISO menjadi format tanggal yang mudah dibaca,
 * dengan penanganan timezone dan input tidak valid yang lebih baik.
 * * @param isoDate string ISO 8601 (contoh: "2025-05-15T14:21:00.000Z")
 * @param isoDate
 * @param options Opsi formatting seperti withTime, locale, dan targetTimezone.
 * @returns string tanggal yang sudah diformat, atau string kosong jika input tidak valid.
 */
export function formatReadableDate(
  isoDate: string | null | undefined,
  options: FormatDateOptions = {},
): string {
  // Opsi default jika tidak disediakan
  const {
    withTime = true,
    locale = "id", // Default ke bahasa Indonesia
    targetTimezone = "Asia/Jakarta", // Selalu tampilkan dalam timezone Jakarta
  } = options;

  // 1. Penanganan input tidak valid (null, undefined, string kosong)
  if (!isoDate) {
    return ""; // Atau "N/A", atau sesuai kebutuhan Anda
  }

  // Buat objek dayjs
  const date = dayjs(isoDate);

  // 2. Penanganan jika string tanggal tidak bisa di-parsing
  if (!date.isValid()) {
    return ""; // Atau "Tanggal Tidak Valid"
  }

  // Tentukan format string berdasarkan opsi `withTime`
  const formatStr = withTime ? "DD MMMM YYYY, HH:mm" : "DD MMMM YYYY";

  // 3. Konversi ke timezone target, atur locale, lalu format
  return date.tz(targetTimezone).locale(locale).format(formatStr);
}

/*

const myIsoDate = "2025-06-09T20:00:00.000Z"; // Jam 8 malam UTC

// Penggunaan dasar (akan menampilkan tanggal & waktu dalam WIB)
// Output: "10 Juni 2025, 03:00" (karena dikonversi ke UTC+7)
console.log(formatReadableDate(myIsoDate));

// Hanya menampilkan tanggal (tanpa waktu)
// Output: "10 Juni 2025"
console.log(formatReadableDate(myIsoDate, { withTime: false }));

// Menampilkan dalam format bahasa Inggris
// Output: "10 June 2025, 03:00"
console.log(formatReadableDate(myIsoDate, { locale: 'en' }));

// Menampilkan dalam waktu UTC asli
// Output: "09 June 2025, 20:00"
console.log(formatReadableDate(myIsoDate, { targetTimezone: 'UTC' }));

// Menangani input yang salah
// Output: "" (string kosong)
console.log(formatReadableDate(null));
console.log(formatReadableDate("ini bukan tanggal"));*/
