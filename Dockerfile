FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
EXPOSE 5173
CMD ["sh", "-c", "bun install && bun run dev"]
