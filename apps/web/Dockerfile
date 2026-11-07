FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY apps/web apps/web
RUN pnpm install --frozen-lockfile --filter @agent-app/web...
RUN pnpm --filter @agent-app/contracts build && pnpm --filter @agent-app/web exec vite build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY apps/web/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/apps/web/dist /usr/share/nginx/html
ENV API_UPSTREAM=api:3000
EXPOSE 8080
