FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    DATABASE_PATH=/data/osbb.db \
    PORT=3000
COPY package.json ./
COPY src ./src
COPY scripts ./scripts
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]
