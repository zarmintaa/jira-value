// /server/api/dashboard/kpis.get.ts (Dengan Kalkulasi Total Jam)

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
    const { count: totalUsers } = await supabase
      .from("jira_users")
      .select("*", { count: "exact", head: true });
    const { count: totalSquads } = await supabase
      .from("jira_squads")
      .select("*", { count: "exact", head: true });

    const inclusiveEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");
    const jql = `project = "ITBOA" AND issuetype = Sub-task AND created >= "${startDate}" AND created < "${inclusiveEndDate}"`;

    // 1. Minta field 'timeestimate' juga dari Jira
    const searchResult = await $fetch<{
      issues: { fields: { created: string; timeestimate: number | null } }[];
    }>("/api/jira/search", {
      method: "POST",
      body: {
        jql,
        fields: ["created", "timeestimate"],
      },
    });

    if (!searchResult || !searchResult.issues) {
      return {
        totalUsers: totalUsers ?? 0,
        totalSquads: totalSquads ?? 0,
        totalSubtasksCreated: 0,
        totalHours: 0,
      };
    }

    // Filter tanggal tetap sama, tapi sekarang kita punya data timeestimate
    const filteredSubtasks = searchResult.issues; // Filter sudah dilakukan di JQL
    const totalSubtasksCreated = filteredSubtasks.length;

    // 2. Kalkulasi BARU: jumlahkan semua timeestimate (dalam detik)
    const totalTimeInSeconds = filteredSubtasks.reduce((total, issue) => {
      return total + (issue.fields.timeestimate || 0);
    }, 0);

    // 3. Konversi detik ke jam, bulatkan ke satu desimal
    const totalHours = parseFloat((totalTimeInSeconds / 3600).toFixed(1));

    // 4. Tambahkan totalHours ke hasil akhir
    return {
      totalUsers: totalUsers ?? 0,
      totalSquads: totalSquads ?? 0,
      totalSubtasksCreated,
      totalHours, // <-- PROPERTI BARU
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
