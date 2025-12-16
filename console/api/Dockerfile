# Use official Node.js runtime
FROM node:22-slim

WORKDIR /srv

# Install deps
COPY package.json ./
RUN npm ci --only=production

# Copy source
COPY server.js ./

# Expose port
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
