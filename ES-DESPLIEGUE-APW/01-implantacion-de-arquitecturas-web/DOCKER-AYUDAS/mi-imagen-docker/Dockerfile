FROM node:lts-alpine3.22

RUN mldir -p /home/app

COPY  ./mi-codigo /home/app

EXPOSE 3000

CMD ["node", "home/app/index.js"]