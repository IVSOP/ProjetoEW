FROM node:22-bookworm
WORKDIR /usr/src/app
COPY . .
RUN apt-get install -y gnupg curl
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
RUN apt-get update && apt-get install -y jq pv mongodb-database-tools && npm i
EXPOSE 3000
CMD ["npm", "start"]
