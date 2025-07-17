# Chon image goc de build container 
FROM node:18-alpine

# Tao va chyen vao thu muc lam viec
WORKDIR /app

# Copy file package.json va package-lock.json (chua ten du an, cac thu vien can thiet)
COPY package*.json ./

# Cai cac thu vien can thiet trong package.json(bo qua devDependencies)
RUN npm install --only=production

# Copy source code vao thu muc /app/src
COPY src/ ./src/

# Mo cong 3001 de lang nghe
EXPOSE 3002

# Chay ung dung Node.js (index.js la file chinh giong exe)
CMD ["node", "src/index.js"]
