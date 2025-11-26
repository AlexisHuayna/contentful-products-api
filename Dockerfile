# Build --------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build
    
    
# Runtime -----------------------------
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./entrypoint.sh"]
