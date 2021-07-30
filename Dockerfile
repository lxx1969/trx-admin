FROM node:12

WORKDIR /usr/src/app
COPY . ./
RUN pwd
RUN ls
RUN npm install

EXPOSE 4000


CMD [ "npm", "start" ]