# Base Stage
FROM node:20-alpine AS base
WORKDIR /app
# Enable corepack for pnpm if needed, or install pnpm globally
RUN npm install -g pnpm@10.33.0

# Builder Stage
FROM base AS builder
# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

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

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built assets from the builder stage
# dist/public contains the built Vite frontend
# dist/index.js contains the esbuild compiled backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/workflows ./workflows

# Expose port 8080 (the default for Google Cloud Run)
EXPOSE 8080

# Define the start command
CMD ["node", "dist/index.js"]
