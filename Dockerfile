FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3434

# Step 8: Define the command to run your application
CMD ["node", "dist/server.js"]

