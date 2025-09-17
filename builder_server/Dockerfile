FROM node:22-alpine

# Install curl, git, and dos2unix
RUN apk add --no-cache git curl dos2unix

WORKDIR /home/app

COPY package*.json ./
RUN npm install

COPY main.sh script.js ./

# 👇 Fix Windows CRLF -> Linux LF
RUN dos2unix main.sh script.js

RUN chmod +x main.sh script.js

ENTRYPOINT ["/home/app/main.sh"]
