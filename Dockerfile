FROM node:14-stretch as build

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM httpd:alpine

COPY --from=build /usr/app/build/ $HTTPD_PREFIX/htdocs/
COPY ./conf/apache-forpdi.conf $HTTPD_PREFIX/conf/extra/forpdi.conf
COPY ./conf/apache-httpd.conf $HTTPD_PREFIX/conf/httpd.conf

EXPOSE 80
