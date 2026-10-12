FROM node:22.14.0-alpine

WORKDIR /usr/src/app

COPY package*.json .npmrc ./

# Install all dependencies including devDependencies, from the lockfile. The lockfile copy
# marks what's installed, so compose.yaml's start command can tell when to reinstall.
RUN npm ci && cp package-lock.json node_modules/.installed-lock

COPY . .

EXPOSE 8000

# Environment variable needed for CRA inside Docker
ENV CHOKIDAR_USEPOLLING=true

# Run dev server
CMD ["npm", "run", "dev"]
