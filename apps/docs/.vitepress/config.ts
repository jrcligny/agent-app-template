import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Agent App Template",
  description: "Internal application template with a tested notes slice and OpenSpec workflow.",
  base: "/agent-app-template/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/bootstrap" },
      { text: "Specs", link: "/generated/" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Bootstrap", link: "/guide/bootstrap" },
          { text: "Architecture", link: "/guide/architecture" },
          { text: "Spec workflow", link: "/guide/spec-workflow" },
          { text: "Review", link: "/guide/review" },
          { text: "Testing", link: "/guide/testing" },
          { text: "Deployment", link: "/guide/deployment" },
          { text: "Security", link: "/guide/security" },
          { text: "Troubleshooting", link: "/guide/troubleshooting" },
        ],
      },
      {
        text: "Generated specs",
        items: [
          { text: "Statuses", link: "/generated/" },
          { text: "Implemented baseline", link: "/generated/specs" },
          { text: "Changes", link: "/generated/changes" },
        ],
      },
    ],
  },
});
