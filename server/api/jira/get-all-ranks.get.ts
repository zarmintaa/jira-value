// File: /server/api/get-all-ranks.get.ts

import { Buffer } from "node:buffer";
import type { JiraIssue } from "~/types/jira.js";
import { dummyJiraUser } from "~/data/dummy-jira.js";

interface JiraSearchResult {
  issues: JiraIssue[];
  startAt: number;
  maxResults: number;
  total: number; // Total hasil yang ada di server Jira
}

// =========================================================================
// FUNGSI HELPER BARU UNTUK MENGAMBIL SEMUA HALAMAN DARI JIRA
// =========================================================================
async function fetchAllJiraPages(
  jql: string,
  fields: string[],
  config: any,
): Promise<JiraIssue[]> {
  let allIssues: JiraIssue[] = [];
  let startAt = 0;
  let total = 0;
  const maxResults = 100; // Jumlah maksimal per halaman yang diizinkan Jira

  do {
    const searchResult = await $fetch<JiraSearchResult>("/rest/api/3/search", {
      baseURL: config.baseURL,
      headers: config.headers,
      method: "POST",
      body: {
        jql: jql,
        fields: fields,
        startAt: startAt,
        maxResults: maxResults,
      },
    });

    if (searchResult.issues) {
      allIssues = allIssues.concat(searchResult.issues);
    }

    total = searchResult.total;
    startAt += searchResult.issues.length;
  } while (startAt < total);

  return allIssues;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 1. Persiapan Kredensial dan Data User
  const jiraEmail = config.email;
  const jiraToken = config.token;
  const jiraBaseUrl = config.baseUrl;
  const headers = {
    Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64")}`,
    Accept: "application/json",
  };
  const fetchConfig = { baseURL: jiraBaseUrl, headers };

  const userMap = new Map(dummyJiraUser.map((user) => [user.key, user]));
  const parentIssueKeys = dummyJiraUser.map((user) => user.key);
  if (parentIssueKeys.length === 0) return [];

  try {
    // 2. Fetch Parent Issues (menggunakan helper paginasi untuk keamanan)
    const parentJql = `key in (${parentIssueKeys.join(",")})`;
    const jiraIssues = await fetchAllJiraPages(
      parentJql,
      ["summary", "status", "assignee", "created", "issuetype", "subtasks"],
      fetchConfig,
    );

    // 3. Fetch SEMUA Subtasks menggunakan helper paginasi
    let allFetchedSubtasks: JiraIssue[] = [];
    if (parentIssueKeys.length > 0) {
      const subtaskJql = `parent in (${parentIssueKeys.join(",")})`;
      // Panggil fungsi helper kita yang sakti
      allFetchedSubtasks = await fetchAllJiraPages(
        subtaskJql,
        ["summary", "status", "parent", "created", "timeestimate"],
        fetchConfig,
      );
    }

    // Dari sini ke bawah, semua logika sama persis dan sekarang bekerja dengan DATA YANG LENGKAP.

    // 4. Grouping dan Enrichment
    const subtasksByParentKey = new Map<string, JiraIssue[]>();
    for (const subtask of allFetchedSubtasks) {
      const parentKey = subtask.fields.parent?.key;
      if (parentKey) {
        if (!subtasksByParentKey.has(parentKey))
          subtasksByParentKey.set(parentKey, []);
        subtasksByParentKey.get(parentKey)!.push(subtask);
      }
    }
    const enrichedJiraIssues: JiraIssue[] = jiraIssues.map((parentIssue) => ({
      ...parentIssue,
      fields: {
        ...parentIssue.fields,
        subtasks: subtasksByParentKey.get(parentIssue.key) || [],
      },
    }));

    // 5. Proses & Kalkulasi Stats
    const processedData = enrichedJiraIssues.map((enrichedIssue) => {
      const originalUser = userMap.get(enrichedIssue.key);
      const subtasks = enrichedIssue.fields.subtasks;
      const uniqueActiveDays = new Set(
        subtasks.map((st) => st.fields.created.slice(0, 10)),
      ).size;
      const totalTimeInSeconds = subtasks.reduce(
        (total, subtask) => total + (subtask.fields.timeestimate || 0),
        0,
      );
      const subtasksDone = subtasks.filter(
        (st) => st.fields.status.name === "Done",
      ).length;
      const totalSubtasks = subtasks.length;
      const doneRatio = totalSubtasks > 0 ? subtasksDone / totalSubtasks : 0;
      const totalHoursFormatted = `${(totalTimeInSeconds / 3600).toFixed(1)}h`;
      return {
        user: {
          name: originalUser?.displayName || "Unknown",
          email: originalUser?.emailAddress || "",
          avatar: enrichedIssue.fields.assignee?.avatarUrls["48x48"] || "",
        },
        stats: [
          { label: "Total Point", value: uniqueActiveDays },
          { label: "Subtask Est. Time", value: totalHoursFormatted },
          {
            label: "Subtasks Done",
            value: `${subtasksDone} / ${totalSubtasks}`,
          },
        ],
        sortable: {
          points: uniqueActiveDays,
          time: totalTimeInSeconds,
          ratio: doneRatio,
        },
      };
    });

    // 6. Urutkan
    processedData.sort((a, b) => {
      const pointDiff = b.sortable.points - a.sortable.points;
      if (pointDiff !== 0) return pointDiff;
      const timeDiff = b.sortable.time - a.sortable.time;
      if (timeDiff !== 0) return timeDiff;
      return b.sortable.ratio - a.sortable.ratio;
    });

    // 7. Finalisasi
    const finalData = processedData.map((item, index) => {
      const { sortable, ...rest } = item;
      return { ...rest, rank: index + 1 };
    });

    return finalData;
  } catch (error: any) {
    console.error("Jira API Error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `Gagal mengambil data dari Jira: ${error.data?.errorMessages?.join(", ") || error.message}`,
    });
  }
});
