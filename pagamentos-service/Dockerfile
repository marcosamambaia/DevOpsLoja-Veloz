FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY src ./src

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app .
USER node
EXPOSE 3002
CMD ["node", "src/index.js"]
