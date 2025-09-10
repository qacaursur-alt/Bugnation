# syntax=docker/dockerfile:1
FROM node:20-slim AS base
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates git openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Install tsx globally
RUN npm install -g tsx

# Cache deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Expose app port
EXPOSE 5000

# Default dev command (overridden by compose)
CMD ["tsx","server/index.ts"]



