# Bot Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared package first
COPY shared/ ./shared/
RUN cd shared && npm install && npm run build

# Copy bot package files and install dependencies
COPY bot/package*.json ./bot/
RUN cd bot && npm install

# Copy bot source and build
COPY bot/src/ ./bot/src/
COPY bot/tsconfig.json ./bot/
RUN cd bot && npm run build

# Create logs directory
RUN mkdir -p logs

WORKDIR /app/bot

EXPOSE 3000

CMD ["npm", "start"]