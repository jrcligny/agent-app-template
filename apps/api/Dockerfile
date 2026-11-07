FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY apps/api apps/api
RUN pnpm install --frozen-lockfile --filter @agent-app/api...
RUN pnpm --filter @agent-app/contracts build && pnpm --filter @agent-app/api build
RUN pnpm --filter @agent-app/api deploy --prod --legacy /out

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /out /app
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
