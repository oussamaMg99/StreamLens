FROM node:22.14.0-alpine

WORKDIR /usr/src/app

COPY package*.json .npmrc ./

# Install all dependencies including devDependencies, from the lockfile
RUN npm ci

COPY . .

EXPOSE 8000

# Environment variable needed for CRA inside Docker
ENV CHOKIDAR_USEPOLLING=true

# Run dev server
CMD ["npm", "run", "dev"]
