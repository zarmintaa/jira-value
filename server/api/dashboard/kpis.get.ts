// /server/api/dashboard/kpis.get.ts (VERSI FINAL YANG PALING ANDAL)

import { serverSupabaseClient } from "#supabase/server";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate =
    (query.startDate as string) ||
    dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const endDate = (query.endDate as string) || dayjs().format("YYYY-MM-DD");

  const supabase = await serverSupabaseClient(event);

  try {
    // Ambil data dari Supabase
    const { count: totalUsers } = await supabase
      .from("jira_users")
      .select("*", { count: "exact", head: true });
    const { count: totalSquads } = await supabase
      .from("jira_squads")
      .select("*", { count: "exact", head: true });

    // 1. Buat JQL sederhana tanpa filter tanggal
    const jql = `project = "ITBOA" AND issuetype = Sub-task`;

    // 2. Panggil proxy /api/jira/search untuk mengambil SEMUA subtask
    // Proxy Anda sudah canggih karena bisa menangani paginasi
    const searchResult = await $fetch<{
      issues: { fields: { created: string } }[];
    }>("/api/jira/search", {
      method: "POST",
      body: {
        jql,
        fields: ["created"], // Kita hanya butuh field 'created' untuk memfilter
      },
    });

    if (!searchResult || !searchResult.issues) {
      // Jika Jira tidak mengembalikan isu, langsung kirim 0
      return {
        totalUsers: totalUsers ?? 0,
        totalSquads: totalSquads ?? 0,
        totalSubtasksCreated: 0,
        range: { startDate, endDate },
      };
    }

    // 3. Lakukan filter tanggal di sini menggunakan JavaScript (Day.js)
    const filterStart = dayjs(startDate);
    const filterEnd = dayjs(endDate);

    const filteredSubtasks = searchResult.issues.filter((issue) => {
      const createdDate = dayjs(issue.fields.created);
      // Cek apakah tanggal 'created' berada di antara atau sama dengan startDate dan endDate
      return (
        !createdDate.isBefore(filterStart, "day") &&
        !createdDate.isAfter(filterEnd, "day")
      );
    });

    // 4. Jumlahnya adalah panjang dari array yang SUDAH TERFILTER
    const totalSubtasksCreated = filteredSubtasks.length;

    // Kembalikan hasil akhir
    return {
      totalUsers: totalUsers ?? 0,
      totalSquads: totalSquads ?? 0,
      totalSubtasksCreated,
      range: { startDate, endDate },
    };
  } catch (error: any) {
    console.error("Error di KPI Endpoint:", error.data || error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal mengambil data KPI: ${error.message}`,
    });
  }
});
