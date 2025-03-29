FROM nginx:alpine

# Copy custom nginx config
COPY ./docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY ./site /usr/share/nginx/html

# Security: Run as non-root user
RUN addgroup -g 1000 -S nginx-user && \
    adduser -u 1000 -S nginx-user -G nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user

EXPOSE 80

# Use health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
