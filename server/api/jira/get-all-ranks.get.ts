// /server/api/get-all-ranks.get.ts (VERSI FINAL - MENGADOPSI LOGIKA ANDA)

import { serverSupabaseClient } from "#supabase/server";
import type { JiraIssue } from "~/types/jira.js";

// Fungsi fetchAllJiraPages dari /api/jira/search.post.ts Anda.
// Kita bisa letakkan di sini atau di file utilitas terpisah.
async function fetchAllJiraPages(
  jql: string,
  fields: string[],
  event: any,
): Promise<JiraIssue[]> {
  const allIssues = await $fetch<{ issues: JiraIssue[] }>("/api/jira/search", {
    method: "POST",
    body: { jql, fields },
  });
  return allIssues.issues || [];
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  // 1. Ambil filter tanggal dari query, jika tidak ada, jangan proses.
  const query = getQuery(event);
  const { startDate, endDate } = query;
  if (!startDate || !endDate) {
    return []; // Wajib ada filter tanggal
  }

  try {
    // 2. Ambil semua user dari Supabase
    const { data: usersFromSupabase, error: supabaseError } = await supabase
      .from("jira_users")
      .select("key, display_name, email_address");

    if (supabaseError) throw supabaseError;
    if (!usersFromSupabase || usersFromSupabase.length === 0) return [];

    // 3. Siapkan userMap dan parentIssueKeys (logika Anda)
    const userMap = new Map(
      usersFromSupabase.map((u) => [
        u.key,
        { displayName: u.display_name, emailAddress: u.email_address },
      ]),
    );
    const parentIssueKeys = usersFromSupabase.map((user) => user.key);

    if (parentIssueKeys.length === 0) return [];

    // 4. Fetch Parent Issues (logika Anda)
    const parentJql = `key in (${parentIssueKeys.join(",")})`;
    const jiraIssues = await fetchAllJiraPages(
      parentJql,
      ["summary", "status", "assignee", "issuetype", "subtasks"],
      event,
    );

    // 5. Fetch SEMUA Subtasks (logika Anda, menggunakan proxy paginasi)
    const subtaskJql = `parent in (${parentIssueKeys.join(",")})`;
    const allFetchedSubtasks = await fetchAllJiraPages(
      subtaskJql,
      ["summary", "status", "parent", "created", "timeestimate"],
      event,
    );

    // 6. Grouping dan Enrichment (logika Anda)
    const subtasksByParentKey = new Map<string, JiraIssue[]>();
    for (const subtask of allFetchedSubtasks) {
      const parentKey = subtask.fields.parent?.key;
      if (parentKey) {
        if (!subtasksByParentKey.has(parentKey))
          subtasksByParentKey.set(parentKey, []);
        subtasksByParentKey.get(parentKey)!.push(subtask);
      }
    }
    const enrichedJiraIssues = jiraIssues.map((parent) => ({
      ...parent,
      fields: {
        ...parent.fields,
        subtasks: subtasksByParentKey.get(parent.key) || [],
      },
    }));

    // 7. Proses, Filter, dan Kalkulasi Stats (logika Anda)
    const filterStart = new Date(startDate as string);
    const filterEnd = new Date(endDate as string);
    filterEnd.setDate(filterEnd.getDate() + 1); // Agar inklusif

    const processedData = enrichedJiraIssues.map((enrichedIssue) => {
      const filteredSubtasks = enrichedIssue.fields.subtasks.filter((st) => {
        const createdDate = new Date(st.fields.created);
        return createdDate >= filterStart && createdDate < filterEnd;
      });

      const uniqueActiveDays = new Set(
        filteredSubtasks.map((st) => st.fields.created.slice(0, 10)),
      ).size;
      const totalTimeInSeconds = filteredSubtasks.reduce(
        (total, st) => total + (st.fields.timeestimate || 0),
        0,
      );
      const subtasksDone = filteredSubtasks.filter(
        (st) => st.fields.status.name === "Done",
      ).length;
      const totalSubtasks = filteredSubtasks.length;
      const doneRatio = totalSubtasks > 0 ? subtasksDone / totalSubtasks : 0;
      const totalHoursFormatted = `${(totalTimeInSeconds / 3600).toFixed(1)}h`;
      const originalUser = userMap.get(enrichedIssue.key);

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

    // 8. Urutkan (logika Anda)
    processedData.sort((a, b) => {
      const pointDiff = b.sortable.points - a.sortable.points;
      if (pointDiff !== 0) return pointDiff;
      const timeDiff = b.sortable.time - a.sortable.time;
      if (timeDiff !== 0) return timeDiff;
      return b.sortable.ratio - a.sortable.ratio;
    });

    // 9. Finalisasi (logika Anda)
    const finalData = processedData.map((item, index) => {
      const { sortable, ...rest } = item;
      return { ...rest, rank: index + 1 };
    });

    return finalData;
  } catch (error: any) {
    console.error("Error di get-all-ranks:", error.data || error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal memproses data ranking: ${error.message}`,
    });
  }
});
