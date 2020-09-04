FROM node:14-slim as builder

COPY ./package*.json ./

RUN npm ci --verbose && npm cache clean --force

COPY src ./src
COPY public ./public
RUN npm run build

FROM nginx:1.18-alpine

WORKDIR /app

# Do not start daemon for nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Overwrite default config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /build /app

CMD ["nginx"]

