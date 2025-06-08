import { Buffer } from "node:buffer";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // Ambil issueId dari URL, contoh: /api/jira/ITBOA-13693 -> 'ITBOA-13693'
  const issueId = event.context.params?.issueId;
  // Baca kredensial dan URL dari environment variables (aman)
  const jiraEmail = config.email;
  const jiraToken = config.token;
  const jiraBaseUrl = config.baseUrl;

  if (!issueId || !jiraEmail || !jiraToken || !jiraBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid Configuration Or Invalid Credentials.",
    });
  }

  // Membuat string untuk Basic Auth: 'email:token'
  const credentials = `${jiraEmail}:${jiraToken}`;
  // Encode string ke Base64
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  try {
    // Panggil API Jira dari sisi server (tidak akan kena CORS)
    const issueData = await $fetch(`/rest/api/3/issue/${issueId}`, {
      baseURL: jiraBaseUrl,
      headers: {
        // Set header Authorization
        Authorization: `Basic ${encodedCredentials}`,
        Accept: "application/json",
      },
    });

    // Kembalikan data yang didapat ke frontend
    return issueData;
  } catch (error: any) {
    // Tangani jika issue tidak ditemukan atau error lain
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `Gagal mengambil data dari Jira: ${error.statusMessage || error.message}`,
    });
  }
});
