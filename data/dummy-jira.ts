import type { JiraUser } from "~/types/jira";

export const dummyJiraUser: JiraUser[] = [
  {
    key: "ITBOA-13693",
    fields: {
      summary: "Zarkasih Akhmad - 51206880",
      status: {
        name: "To-Do",
      },
      assignee: {
        displayName: "BOA - Zarkasih Akhmad",
        emailAddress: "v.zarkasih.akhmad@adira.co.id",
        avatarUrls: {
          "48x48":
            "https://secure.gravatar.com/avatar/b75dfc0abf1f03009625e9dd3843ffb1?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FBA-0.png",
        },
      },
      description:
        "Develop and integrate the user authentication system, including registration, login, and password reset functionalities. Ensure secure handling of user credentials.",
      created: "2025-01-01",
    },
  },
  {
    key: "ITBOA-15618",
    fields: {
      summary: "Muhammad Iqbal Firdaus Mahendra - 51222408",
      status: {
        name: "To-Do",
      },
      assignee: {
        displayName: "BOA - Muhammad Iqbal Firdaus Mahendra",
        emailAddress: "v.iqbal.firdaus@adira.co.id",
        avatarUrls: {
          "48x48":
            "https://secure.gravatar.com/avatar/0b736bb1b94ee32977009876d070403a?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FBM-3.png",
        },
      },
      description:
        "Develop and integrate the user authentication system, including registration, login, and password reset functionalities. Ensure secure handling of user credentials.",
      created: "2025-01-01",
    },
  },
];
