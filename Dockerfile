# Use the official Node.js image as the base image
FROM node:22.14.0 as builder

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application code into the container
## Copy package.json and package-lock.json (or yarn.lock) into the container
COPY . .

# Install application dependencies
# If you're using Yarn, you can use: RUN yarn install
RUN npm install && npm run build

# ========== Stage 2: Serve with Nginx ==========
FROM nginx:alpine

# 移除默认配置
RUN rm -rf /etc/nginx/conf.d/*
# 复制我们自定义的配置
COPY default.conf /etc/nginx/conf.d/

# 拷贝构建后的前端文件
COPY --from=builder /app/build /usr/share/nginx/html

# EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

