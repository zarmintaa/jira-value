// /server/api/get-all-ranks.get.ts (VERSI FINAL DENGAN LOGIKA ANDA)

import { serverSupabaseClient } from "#supabase/server";
import type { JiraIssue } from "~/types/jira.js";

// Fungsi helper untuk mengambil semua halaman dari Jira
async function fetchAllJiraPages(
  jql: string,
  fields: string[],
  event: any
): Promise<JiraIssue[]> {
  const allIssuesResponse = await $fetch<{ issues: JiraIssue[] }>(
    "/api/jira/search",
    {
      method: "POST",
      body: { jql, fields },
    }
  );
  return allIssuesResponse.issues || [];
}

export default defineEventHandler(async (event) => {
  const { startDate, endDate } = getQuery(event);
  if (!startDate || !endDate) return [];

  console.log("Call get ranks!");

  const supabase = await serverSupabaseClient(event);

  try {
    // LANGKAH A: Ambil semua user dari Supabase (Menggantikan dummyUser)
    const { data: usersFromSupabase, error: supabaseError } = await supabase
      .from("jira_users")
      .select("key, display_name, email_address");

    if (supabaseError) throw supabaseError;
    if (!usersFromSupabase || usersFromSupabase.length === 0) return [];

    // LANGKAH B: Semua logika dari fungsi getRank Anda sekarang ada di sini
    const userMap = new Map(
      usersFromSupabase.map((u) => [
        u.key,
        { displayName: u.display_name, emailAddress: u.email_address },
      ])
    );
    const parentIssueKeys = usersFromSupabase.map((user) => user.key);

    const parentJql = `key in (${parentIssueKeys.join(",")})`;
    const jiraIssues = await fetchAllJiraPages(
      parentJql,
      ["summary", "status", "assignee", "issuetype", "subtasks"],
      event
    );

    const allSubtaskKeys = jiraIssues.flatMap((issue) =>
      (issue.fields.subtasks || []).map((subtask) => subtask.key)
    );
    let allFetchedSubtasks: JiraIssue[] = [];

    if (allSubtaskKeys.length > 0) {
      const uniqueKeys = [...new Set(allSubtaskKeys)];
      const subtaskJql = `key in (${uniqueKeys.join(",")})`;
      allFetchedSubtasks = await fetchAllJiraPages(
        subtaskJql,
        ["summary", "status", "parent", "created", "timeestimate"],
        event
      );
    }

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

    const filterStart = new Date(startDate as string);
    const filterEnd = new Date(endDate as string);
    filterEnd.setDate(filterEnd.getDate() + 1);

    const processedData = enrichedJiraIssues.map((enrichedIssue) => {
      const filteredSubtasks = enrichedIssue.fields.subtasks.filter((st) => {
        const createdDate = new Date(st.fields.created);
        return createdDate >= filterStart && createdDate < filterEnd;
      });

      const uniqueActiveDays = new Set(
        filteredSubtasks.map((st) => st.fields.created.slice(0, 10))
      ).size;
      const totalTimeInSeconds = filteredSubtasks.reduce(
        (total, st) => total + (st.fields.timeestimate || 0),
        0
      );
      const subtasksDone = filteredSubtasks.filter(
        (st) => st.fields.status.name === "Done"
      ).length;
      const totalSubtasks = filteredSubtasks.length;
      const doneRatio = totalSubtasks > 0 ? subtasksDone / totalSubtasks : 0;
      const totalHoursFormatted = `${(totalTimeInSeconds / 3600).toFixed(1)}h`;
      const originalUser = userMap.get(enrichedIssue.key);

      return {
        user: {
          name: originalUser?.displayName || "Unknown User",
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

    processedData.sort((a, b) => {
      const pointDiff = b.sortable.points - a.sortable.points;
      if (pointDiff !== 0) return pointDiff;
      const timeDiff = b.sortable.time - a.sortable.time;
      if (timeDiff !== 0) return timeDiff;
      return b.sortable.ratio - a.sortable.ratio;
    });

    const finalData = processedData.map((item, index) => {
      const { sortable, ...rest } = item;
      return { ...rest, rank: index + 1 };
    });

    return finalData;
  } catch (error: any) {
    console.error("Error di get-all-ranks:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal memproses data ranking: ${error.message}`,
    });
  }
});
