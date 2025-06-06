// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["~/assets/css/style.css"],
  routeRules: {
    "/": { redirect: { to: "/dashboard", statusCode: 301 } },
  },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_API_EMAIL,
    token: process.env.JIRA_API_TOKEN,
  },
});
