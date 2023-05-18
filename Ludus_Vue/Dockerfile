# Stage 1: Build the Vue.js project
FROM nginx:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the built Vue.js project with NGINX
FROM nginx:1.21-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]