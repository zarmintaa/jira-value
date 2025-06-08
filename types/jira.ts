export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        "48x48": string;
      };
    } | null; // assignee bisa jadi null
    subtasks: JiraSubtask[] | [];
    created: string;
    issuetype?: {
      name: string;
    };
    timeestimate: number;
  };
}

export interface JiraUser {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
      avatarUrls?: {
        "48x48": string | null;
      };
    } | null; // assignee bisa jadi null
    description: any; // Deskripsi Jira bisa sangat kompleks, `any` adalah jalan pintas yang aman
    created: string;
  };
}

export interface JiraSubtask {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    priority: {
      name: string;
    };
    created: string;
  };
}
