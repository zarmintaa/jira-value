export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
    } | null; // assignee bisa jadi null
    description: any; // Deskripsi Jira bisa sangat kompleks, `any` adalah jalan pintas yang aman
  };
}
