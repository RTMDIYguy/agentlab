# Base Stage
FROM node:22-alpine AS base
WORKDIR /app
# Enable corepack and install latest pnpm
RUN npm install -g pnpm@latest

# Builder Stage
FROM base AS builder
# Copy package manifests, workspace, and npm configuration
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
COPY patches ./patches
# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile=false

# Copy the rest of the source code
COPY . .

ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID

# Run the build script
RUN pnpm run build

# Production Stage
FROM base AS runner
ENV NODE_ENV=production

# Copy package manifests, workspace, and npm configuration
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
COPY patches ./patches
# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile=false

# Copy the built assets from the builder stage
# dist/public contains the built Vite frontend
# dist/index.js contains the esbuild compiled backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/workflows ./workflows

# Expose port 8080 (the default for Google Cloud Run)
EXPOSE 8080

# Define the start command
CMD ["node", "dist/index.js"]
