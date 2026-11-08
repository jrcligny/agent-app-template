# Third-party notices

Original code in this repository is under the MIT license in `LICENSE`.

Dependencies installed from npm keep their own licenses. They are not relicensed by this template. OpenSpec is `@fission-ai/openspec` 1.16.1, MIT, copyright OpenSpec contributors. The only generated skill bodies committed here are `.agents/skills/openspec-*/SKILL.md`. Each file keeps the upstream `license: MIT`, `author: openspec`, and `generatedBy` frontmatter. Regenerate them with `pnpm openspec:skills` (`openspec init --tools agents`). Do not edit those bodies by hand and do not commit a second copy for another tool.

UI components in `apps/web/src/components` are original code in this repository. They follow the practice of keeping components in the repo rather than depending on a component package at runtime. They are not a copy of the shadcn registry. shadcn/ui itself is MIT.

Container base images `node` and `nginxinc/nginx-unprivileged` are third-party and remain under their own licenses. PostgreSQL and Helm are third-party tools used to run and render the template.
