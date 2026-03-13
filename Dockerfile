FROM node:20-alpine AS frontend-build
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm install --production
COPY Backend/ ./
COPY --from=frontend-build /app/Frontend/dist /app/Frontend/dist
EXPOSE 5000
CMD ["node", "src/server.js"]
