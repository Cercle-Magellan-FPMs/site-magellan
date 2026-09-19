FROM node:24.21.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.30.5-alpine
COPY nginx/config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/.nginx/csp.conf /etc/nginx/csp.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
RUN nginx -t
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
