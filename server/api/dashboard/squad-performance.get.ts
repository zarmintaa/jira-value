// /server/api/dashboard/squad-performance.get.ts (DENGAN LOGIKA RASIO YANG BENAR)

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
    // 1. Ambil data dasar dari Supabase (tidak berubah)
    const { data: squads } = await supabase
      .from("jira_squads")
      .select("uuid, display_name");
    const { data: users } = await supabase
      .from("jira_users")
      .select("key, squad_uuid");

    if (!squads || !users)
      throw new Error("Gagal mengambil data squad atau pengguna.");

    const userToSquadMap = new Map<string, string | null>(
      users.map((u) => [u.key, u.squad_uuid]),
    );
    const parentIssueKeys = users.map((u) => u.key);

    const squadPerformance: Record<string, any> = {};
    for (const squad of squads) {
      squadPerformance[squad.uuid] = {
        uuid: squad.uuid,
        name: squad.display_name,
        memberCount: users.filter((u) => u.squad_uuid === squad.uuid).length,
        totalSubtasksCreated: 0,
        totalSubtasksDone: 0,
        totalHoursDone: 0,
        completionRatio: 0,
      };
    }

    if (parentIssueKeys.length === 0) return Object.values(squadPerformance);

    // 2. Ambil SEMUA subtask yang relevan dari Jira
    const jql = `parent in (${parentIssueKeys.join(",")}) AND issuetype = Sub-task`;
    const searchResult = await $fetch<{ issues: any[] }>("/api/jira/search", {
      method: "POST",
      body: {
        jql,
        fields: ["parent", "status", "created", "timeestimate"], // resolutiondate tidak lagi jadi acuan filter utama
      },
    });

    if (!searchResult || !searchResult.issues)
      return Object.values(squadPerformance);

    // ====================================================================
    // == PERUBAHAN LOGIKA UTAMA ADA DI SINI ==
    // ====================================================================

    // 3. Pertama, filter SEMUA subtask yang DIBUAT dalam rentang waktu
    const filterStart = dayjs(startDate);
    const filterEnd = dayjs(endDate);

    const subtasksCreatedInPeriod = searchResult.issues.filter((issue) => {
      const createdDate = dayjs(issue.fields.created);
      return (
        !createdDate.isBefore(filterStart, "day") &&
        !createdDate.isAfter(filterEnd, "day")
      );
    });

    // 4. SEKARANG, proses HANYA subtask yang sudah terfilter tersebut
    for (const issue of subtasksCreatedInPeriod) {
      const parentKey = issue.fields.parent?.key;
      const squadUUID = userToSquadMap.get(parentKey);

      if (!squadUUID || !squadPerformance[squadUUID]) continue;

      // Semua isu di sini sudah pasti dibuat dalam rentang waktu, jadi kita langsung tambah
      squadPerformance[squadUUID].totalSubtasksCreated++;

      // Cek apakah isu yang dibuat di periode ini juga sudah selesai
      const isDone = issue.fields.status?.name === "Done";
      if (isDone) {
        squadPerformance[squadUUID].totalSubtasksDone++;
        const seconds = issue.fields.timeestimate || 0;
        squadPerformance[squadUUID].totalHoursDone += seconds / 3600;
      }
    }

    // ====================================================================

    // 5. Hitung rasio (sekarang dijamin benar)
    for (const squadUUID in squadPerformance) {
      const squad = squadPerformance[squadUUID];
      if (squad.totalSubtasksCreated > 0) {
        squad.completionRatio =
          (squad.totalSubtasksDone / squad.totalSubtasksCreated) * 100;
      }
      squad.totalHoursDone = parseFloat(squad.totalHoursDone.toFixed(1));
    }

    return Object.values(squadPerformance);
  } catch (error: any) {
    console.error("Error di Squad Performance Endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal memproses data performa squad: ${error.message}`,
    });
  }
});
