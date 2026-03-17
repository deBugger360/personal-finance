# Backend Dockerfile
FROM node:18-slim

# Install SQLite dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY server/ .

# The database file exists in the parent directory in dev, 
# but in production we'll put it in a persistent /data volume.
# Let's adjust server/db/index.js slightly for production if needed, 
# or just ensure the env variable DB_PATH points to /data/finance.db.

ENV PORT=3001
EXPOSE 3001

# Command to run the application
CMD ["node", "index.js"]
