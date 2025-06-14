// /server/api/dashboard/burnup-chart.get.ts

import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const startDate =
    (query.startDate as string) ||
    dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const endDate = (query.endDate as string) || dayjs().format("YYYY-MM-DD");

  try {
    // 1. Ambil SEMUA subtask yang relevan hingga tanggal akhir.
    // Ini penting untuk menghitung total scope yang mungkin sudah ada sebelum startDate.
    const jql = `project = "ITBOA" AND issuetype = Sub-task AND created <= "${endDate}" ORDER BY created ASC`;

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

    // 2. Siapkan array untuk menampung data harian
    const burnupData = [];
    let currentDate = dayjs(startDate);
    const finalDate = dayjs(endDate);

    // 3. Lakukan perulangan untuk setiap hari dalam rentang tanggal
    while (
      currentDate.isBefore(finalDate) ||
      currentDate.isSame(finalDate, "day")
    ) {
      const dayFormatted = currentDate.format("YYYY-MM-DD");

      // Hitung total scope hingga hari ini
      const totalScope = allSubtasks.filter((issue) =>
        dayjs(issue.fields.created).isBefore(currentDate.add(1, "day")),
      ).length;

      // Hitung total yang selesai hingga hari ini
      const totalCompleted = allSubtasks.filter(
        (issue) =>
          issue.fields.resolutiondate &&
          dayjs(issue.fields.resolutiondate).isBefore(
            currentDate.add(1, "day"),
          ),
      ).length;

      burnupData.push({
        date: dayFormatted,
        scope: totalScope,
        completed: totalCompleted,
      });

      // Lanjut ke hari berikutnya
      currentDate = currentDate.add(1, "day");
    }

    return burnupData;
  } catch (error: any) {
    console.error("Error di Burnup Chart Endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses data untuk grafik.",
    });
  }
});
