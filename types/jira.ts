import type { RankedUser } from "~/types/rank-user";

// File: types/jira.ts (atau di mana pun lokasinya)

export interface JiraIssue {
  key: string;
  fields: {
    parent?: {
      key: string;
    };
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
    } | null;
    created: string;
    issuetype?: {
      name: string;
    };
    timeestimate: number; // Mungkin lebih aman: number | null
    customfield_10679?: string;
    subtasks: JiraIssue[];
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
    timeestimate?: number;
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
  rankedUser?: RankedUser;
}
