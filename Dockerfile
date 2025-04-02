FROM node:10-stretch as build

RUN npm i --force -g node-gyp npm@latest

RUN mkdir /usr/app
WORKDIR /usr/app

COPY . .

RUN NODE_ENV=development yarn --frozen-lockfile
RUN NODE_ENV=production yarn build:docker


FROM httpd:alpine

COPY --from=build /usr/app/dist/ /usr/local/apache2/htdocs/
COPY ./conf/apache-forpdi.conf $HTTPD_PREFIX/conf/extra/forpdi.conf
COPY ./conf/apache-httpd.conf $HTTPD_PREFIX/conf/httpd.conf

EXPOSE 80
