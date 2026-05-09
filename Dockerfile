FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./
RUN npx prisma generate
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "--experimental-specifier-resolution=node", "--loader", "tsx", "server.ts"]
