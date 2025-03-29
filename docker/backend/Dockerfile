FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY index.js ./
COPY server ./server/
COPY .env.* ./

# Multi-stage build for smaller image
FROM node:16-alpine

WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

# Create a non-root user
RUN addgroup -g 1000 -S appuser && \
    adduser -u 1000 -S appuser -G appuser

# Copy from builder stage
COPY --from=builder --chown=appuser:appuser /app .
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules

# Switch to non-root user
USER appuser

# Expose the API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthcheck || exit 1

# Start application
CMD ["node", "index.js"]
