FROM node:22-bookworm
WORKDIR /usr/src/app
COPY . .
RUN apt-get update && apt-get install -y jq pv && npm i
EXPOSE 3000
CMD ["npm", "start"]
