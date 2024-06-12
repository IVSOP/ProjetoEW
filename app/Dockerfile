FROM node:22-bookworm
WORKDIR /usr/src/app
COPY . .
RUN apt-get update && apt-get install -y ffmpeg && npm i
EXPOSE 7777
CMD ["npm", "start"]