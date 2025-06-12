// server/api/search.post.ts

import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  // --- BAGIAN KONFIGURASI DAN OTENTIKASI (TETAP SAMA) ---
  const config = useRuntimeConfig(event);
  const jiraEmail = config.email;
  const jiraToken = config.token;
  const jiraBaseUrl = config.baseUrl;

  const body = await readBody(event);
  const { jql, fields } = body;

  if (!jql || !jiraEmail || !jiraToken || !jiraBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid Configuration or Missing JQL in request.",
    });
  }

  const credentials = `${jiraEmail}:${jiraToken}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");
  const headers = {
    Authorization: `Basic ${encodedCredentials}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // =========================================================================
  // LOGIKA BARU UNTUK MENANGANI PAGINATION
  // =========================================================================

  let allIssues: any[] = []; // Array untuk menampung SEMUA isu dari semua halaman
  let startAt = 0;
  const maxResults = 100; // Ukuran halaman, Jira biasanya maks 100

  try {
    while (true) {
      // 1. Lakukan fetch untuk halaman saat ini
      const jiraResponse = await $fetch<{ issues: any[]; total: number }>(
        `/rest/api/3/search`,
        {
          baseURL: jiraBaseUrl,
          method: "POST",
          headers,
          body: {
            jql,
            fields,
            maxResults,
            startAt, // Kirim parameter startAt
          },
        },
      );

      // 2. Tambahkan isu dari halaman ini ke array utama
      if (jiraResponse.issues && jiraResponse.issues.length > 0) {
        allIssues = allIssues.concat(jiraResponse.issues);
      }

      // 3. Cek apakah semua data sudah terambil
      if (
        allIssues.length >= jiraResponse.total ||
        jiraResponse.issues.length === 0
      ) {
        // Jika jumlah isu yang sudah diambil sama atau lebih dari total, atau jika halaman ini kosong, hentikan loop.
        break;
      }

      // 4. Siapkan untuk mengambil halaman berikutnya
      startAt += maxResults;
    }

    // 5. Kembalikan HASIL GABUNGAN ke frontend
    return { issues: allIssues };
  } catch (error: any) {
    console.error("Error fetching paginated data from Jira:", error);
    throw createError({
      statusCode: error.statusCode || 502,
      statusMessage: `Gagal berkomunikasi dengan server Jira: ${error.statusMessage || error.message}`,
      data: error.data,
    });
  }
});
