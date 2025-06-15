// /server/api/dashboard/kpis.get.ts (VERSI FINAL DENGAN RPC)

import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { startDate, endDate } = query;
  const supabase = await serverSupabaseClient(event);

  if (!startDate || !endDate) {
    return {
      totalUsers: 0,
      totalSquads: 0,
      totalSubtasksCreated: 0,
      totalHours: 0.0,
    };
  }

  try {
    // Ambil data user & squad (tidak berubah)
    const { count: totalUsers } = await supabase
      .from("jira_users")
      .select("*", { count: "exact", head: true });
    const { count: totalSquads } = await supabase
      .from("jira_squads")
      .select("*", { count: "exact", head: true });

    // ====================================================================
    // PERUBAHAN UTAMA: Panggil fungsi RPC, bukan select
    // ====================================================================
    const { data: kpiResult, error } = await supabase
      .rpc("get_kpi_stats", {
        start_date: startDate,
        end_date: endDate,
      })
      .single(); // Kita tahu fungsi ini hanya mengembalikan satu baris hasil

    if (error) throw error;

    const totalSubtasksCreated = kpiResult?.total_subtasks_created ?? 0;
    const totalTimeInSeconds = kpiResult?.total_time_seconds ?? 0;
    const totalHours = parseFloat((totalTimeInSeconds / 3600).toFixed(1));

    return {
      totalUsers: totalUsers ?? 0,
      totalSquads: totalSquads ?? 0,
      totalSubtasksCreated,
      totalHours,
    };
  } catch (error: any) {
    console.error("Error di KPI Endpoint:", error.data || error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal mengambil data KPI: ${error.message}`,
    });
  }
});
