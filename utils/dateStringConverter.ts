type MonthAbbreviation =
  | "JAN"
  | "FEB"
  | "MAR"
  | "APR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AUG"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DEC";

/**
 * Mem-parsing string dengan format "DDMONYYYY" (misal: "21JUN2025") menjadi objek Date.
 * @param dateString String tanggal yang akan di-parsing.
 * @returns Objek Date yang valid, atau Invalid Date jika format salah.
 */
export function parseDDMONYYYY(dateString: string): Date {
  // Pengecekan awal untuk panjang string
  if (dateString.length !== 9) {
    return new Date(NaN); // Mengembalikan Invalid Date
  }

  const monthMap: Record<MonthAbbreviation, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  // Ekstrak hari, bulan, dan tahun
  const day = parseInt(dateString.substring(0, 2), 10);
  const monthStr = dateString
    .substring(2, 5)
    .toUpperCase() as MonthAbbreviation;
  const year = parseInt(dateString.substring(5, 9), 10);

  // Ubah singkatan bulan menjadi angka indeks
  const monthIndex = monthMap[monthStr];

  if (isNaN(day) || isNaN(year) || monthIndex === undefined) {
    return new Date(NaN); // Mengembalikan Invalid Date
  }

  return new Date(year, monthIndex, day);
}

/*

const tanggalString = "08JUN2025";
const tanggalObjek = parseDDMONYYYY(tanggalString);

if (!isNaN(tanggalObjek.getTime())) {
  console.log(
    "Tanggal berhasil dikenali:",
    tanggalObjek.toLocaleDateString("id-ID"),
  );
} else {
  console.log("Gagal mengenali tanggal.");
}
console.log("Tanggal dalam format lokal:", tanggalObjek.toLocaleDateString('id-ID', {
  year: 'numeric',  // Menghasilkan '2025'
  month: 'long',   // Menghasilkan 'Juni'
  day: 'numeric'    // Menghasilkan '8' (atau '08' tergantung browser/locale)
}));
// Output: 8 Juni 2025
 */
