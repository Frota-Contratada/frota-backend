FROM node:22.22.3-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@10
WORKDIR /app


FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm run build


FROM base AS dev

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["sh", "-c", "pnpm prisma generate && pnpm run start:dev"]

FROM base AS runner

ARG BACKEND_PORT=3000

ENV NODE_ENV=production
ENV BACKEND_PORT=${BACKEND_PORT}

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE ${BACKEND_PORT}

CMD ["node", "dist/src/main.js"]