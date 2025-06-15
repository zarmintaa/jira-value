// /server/api/dashboard/burnup-chart.get.ts (VERSI OPTIMAL)

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate =
    (query.startDate as string) ||
    dayjs().subtract(30, "day").format("YYYY-MM-DD");
  const endDate = (query.endDate as string) || dayjs().format("YYYY-MM-DD");

  try {
    // OPTIMASI #1: Filter JQL agar tidak mengambil semua data dari awal zaman.
    // Kita hanya butuh isu yang dibuat sebelum atau pada tanggal akhir filter.
    const inclusiveEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");
    const jql = `project = "ITBOA" AND issuetype = Sub-task AND created < "${inclusiveEndDate}" ORDER BY created ASC`;

    const searchResult = await $fetch<{ issues: any[] }>("/api/jira/search", {
      method: "POST",
      body: {
        jql,
        fields: ["created", "resolutiondate", "status"],
      },
    });

    if (!searchResult || !searchResult.issues) {
      return [];
    }
    const allSubtasks = searchResult.issues;

    // OPTIMASI #2: Proses data dalam satu kali pass untuk mendapatkan perubahan harian.
    const dailyChanges = new Map<
      string,
      { scope: number; completed: number }
    >();

    for (const issue of allSubtasks) {
      const createdDate = dayjs(issue.fields.created).format("YYYY-MM-DD");

      // Tambahkan 1 ke scope pada hari isu dibuat
      if (!dailyChanges.has(createdDate))
        dailyChanges.set(createdDate, { scope: 0, completed: 0 });
      dailyChanges.get(createdDate)!.scope++;

      // Tambahkan 1 ke completed pada hari isu diselesaikan
      const isDone = issue.fields.status?.name === "Done";
      if (isDone && issue.fields.resolutiondate) {
        const resolutionDate = dayjs(issue.fields.resolutiondate).format(
          "YYYY-MM-DD",
        );
        if (!dailyChanges.has(resolutionDate))
          dailyChanges.set(resolutionDate, { scope: 0, completed: 0 });
        dailyChanges.get(resolutionDate)!.completed++;
      }
    }

    // OPTIMASI #3: Hitung nilai kumulatif dengan efisien
    const chartData = [];
    let cumulativeScope = 0;
    let cumulativeCompleted = 0;

    // Hitung state awal sebelum startDate
    for (const issue of allSubtasks) {
      if (dayjs(issue.fields.created).isBefore(dayjs(startDate))) {
        cumulativeScope++;
        const isDone = issue.fields.status?.name === "Done";
        if (
          isDone &&
          issue.fields.resolutiondate &&
          dayjs(issue.fields.resolutiondate).isBefore(dayjs(startDate))
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
    console.error("Error di Burnup Chart Endpoint:", error.data || error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses data grafik.",
    });
  }
});
