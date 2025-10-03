# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared package first
COPY shared/ ./shared/
RUN cd shared && npm install && npm run build

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source and build
COPY backend/src/ ./backend/src/
COPY backend/tsconfig.json ./backend/
RUN cd backend && npm run build

WORKDIR /app/backend

EXPOSE 5001

CMD ["npm", "start"]