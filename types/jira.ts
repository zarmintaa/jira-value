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
    customfield_10679?: string;
  };
}

export interface JiraUser {
  key: string;
  summary: string;
  status: string;
  displayName: string;
  emailAddress: string;
  description: any;
  created: string;
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
