import { api, type JiraIssue } from "@/utils/api.ts";

export const jiraService = {
  // Get issue by key
  getIssue: async (issueKey: string): Promise<JiraIssue | null> => {
    try {
      return await api.get<JiraIssue>(`/issue/${issueKey}`);
    } catch (error) {
      // Error sudah ditangkap di interceptor
      return null;
    }
  },

  // Search issues
  searchIssues: async (
    jql: string,
  ): Promise<{ issues: JiraIssue[] } | null> => {
    try {
      return await api.post("/search", { jql });
    } catch (error) {
      return null;
    }
  },

  // Update issue
  updateIssue: async (issueKey: string, fields: any): Promise<boolean> => {
    try {
      await api.put(`/issue/${issueKey}`, { fields });
      return true;
    } catch (error) {
      return false;
    }
  },
};
