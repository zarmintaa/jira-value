// /server/api/sync/jira-subtasks.post.ts (DENGAN LOGIKA TANGGAL YANG BENAR)

import { serverSupabaseClient } from "#supabase/server";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
dayjs.extend(isSameOrBefore);

export default defineEventHandler(async (event) => {
  console.log("Memulai proses SINKRONISASI BULANAN (versi perbaikan)...");
  const supabase = await serverSupabaseClient(event);
  let totalProcessed = 0;

  try {
    let currentDate = dayjs("2025-01-01"); // Pastikan tanggal mulai ini sudah mencakup semua data historis Anda
    const today = dayjs();

    while (currentDate.isSameOrBefore(today, "month")) {
      const startDate = currentDate.startOf("month").format("YYYY-MM-DD");
      // PERBAIKAN KUNCI: Hitung awal dari bulan BERIKUTNYA
      const nextMonthStartDate = currentDate
        .add(1, "month")
        .startOf("month")
        .format("YYYY-MM-DD");

      console.log(
        `Menyinkronkan data untuk periode: >= ${startDate} DAN < ${nextMonthStartDate}`
      );

      // JQL yang paling andal, menggunakan >= startDate dan < nextMonthStartDate
      const jql = `project = "ITBOA" AND issuetype = Sub-task AND created >= "${startDate}" AND created < "${nextMonthStartDate}"`;

      const searchResult = await $fetch<{ issues: any[] }>("/api/jira/search", {
        method: "POST",
        body: {
          jql,
          fields: [
            "parent",
            "status",
            "created",
            "resolutiondate",
            "timeestimate",
            "summary",
            "updated",
          ],
        },
      });

      if (
        searchResult &&
        searchResult.issues &&
        searchResult.issues.length > 0
      ) {
        const subtasksToUpsert = searchResult.issues.map((issue) => ({
          id: issue.id,
          key: issue.key,
          parent_key: issue.fields.parent?.key,
          status_name: issue.fields.status?.name,
          created_at: issue.fields.created,
          resolved_at: issue.fields.resolutiondate,
          time_estimate_seconds: issue.fields.timeestimate || 0,
          jira_updated_at: issue.fields.updated,
        }));

        const { error: upsertError } = await supabase
          .from("jira_subtasks_cache")
          .upsert(subtasksToUpsert, { onConflict: "id" });

        if (upsertError) throw upsertError;

        totalProcessed += subtasksToUpsert.length;
        console.log(
          `Berhasil memproses ${subtasksToUpsert.length} subtask untuk periode ${startDate}.`
        );
      } else {
        console.log(`Tidak ada subtask ditemukan untuk periode ${startDate}.`);
      }

      currentDate = currentDate.add(1, "month");
    }

    const message = `Sinkronisasi bulanan selesai: Total ${totalProcessed} subtask diproses.`;
    console.log(message);
    return { success: true, message, count: totalProcessed };
  } catch (error: any) {
    console.error("Gagal melakukan sinkronisasi Jira:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Proses sinkronisasi gagal.",
    });
  }
});
