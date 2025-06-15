// /server/api/dashboard/burnup-chart.get.ts (VERSI BARU - SUPER CEPAT)

import { serverSupabaseClient } from "#supabase/server";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
dayjs.extend(isSameOrBefore);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  // Validasi input tanggal
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: "startDate dan endDate wajib diisi.",
    });
  }

  const supabase = await serverSupabaseClient(event);

  try {
    // ====================================================================
    // PERUBAHAN UTAMA: TIDAK ADA LAGI $fetch ke JIRA
    // Kita sekarang melakukan satu query cepat ke tabel cache di Supabase
    // ====================================================================
    const { data: allSubtasks, error } = await supabase
      .from("jira_subtasks_cache")
      .select("created_at, resolved_at, status_name")
      // Hanya ambil data yang relevan untuk perhitungan: yang dibuat sebelum akhir periode
      .lte("created_at", dayjs(endDate).add(1, "day").format("YYYY-MM-DD"));

    if (error) throw error;
    if (!allSubtasks) return [];

    // ====================================================================
    // LOGIKA PEMROSESAN: Tetap sama, tapi sekarang berjalan pada data lokal
    // yang didapat dalam sekejap mata.
    // ====================================================================

    // Proses data dalam satu kali pass untuk mendapatkan perubahan harian.
    const dailyChanges = new Map<
      string,
      { scope: number; completed: number }
    >();

    for (const issue of allSubtasks) {
      const createdDate = dayjs(issue.created_at).format("YYYY-MM-DD");

      if (!dailyChanges.has(createdDate))
        dailyChanges.set(createdDate, { scope: 0, completed: 0 });
      dailyChanges.get(createdDate)!.scope++;

      const isDone = issue.status_name === "Done";
      if (isDone && issue.resolved_at) {
        const resolutionDate = dayjs(issue.resolved_at).format("YYYY-MM-DD");
        if (!dailyChanges.has(resolutionDate))
          dailyChanges.set(resolutionDate, { scope: 0, completed: 0 });
        dailyChanges.get(resolutionDate)!.completed++;
      }
    }

    // Hitung nilai kumulatif dengan efisien
    const chartData = [];
    let cumulativeScope = 0;
    let cumulativeCompleted = 0;

    // Hitung state awal sebelum startDate
    for (const issue of allSubtasks) {
      if (dayjs(issue.created_at).isBefore(dayjs(startDate))) {
        cumulativeScope++;
        const isDone = issue.status_name === "Done";
        if (
          isDone &&
          issue.resolved_at &&
          dayjs(issue.resolved_at).isBefore(dayjs(startDate))
        ) {
          cumulativeCompleted++;
        }
      }
    }

    // Loop melalui rentang tanggal yang dipilih dan tambahkan perubahan harian
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    while (current.isSameOrBefore(end, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const changes = dailyChanges.get(dateStr);

      if (changes) {
        cumulativeScope += changes.scope;
        cumulativeCompleted += changes.completed;
      }

      chartData.push({
        date: dateStr,
        scope: cumulativeScope,
        completed: cumulativeCompleted,
      });

      current = current.add(1, "day");
    }

    return chartData;
  } catch (error: any) {
    console.error("Error di Burnup Chart Endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses data grafik dari cache.",
    });
  }
});
