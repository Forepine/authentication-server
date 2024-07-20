FROM node:20.11.0-alpine

# Set the timezone to Asia/Kolkata
ENV TZ=Asia/Kolkata

RUN apk add --no-cache bash curl tzdata
# Update the system timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN npm i -g @nestjs/cli typescript ts-node

# RUN curl -O https://raw.githubusercontent.com/openobserve/agents/main/linux/install.sh && chmod +x install.sh && ./install.sh http://openobserve:5080/api/default/ dHNwQHBsdXRvcy5vbmU6a2o1VWVab0pxZ3hkM1VQcg==

COPY package*.json /tmp/app/
RUN cd /tmp/app && npm install --legacy-peer-deps

COPY . /usr/src/app
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh
COPY ./startup.relational.dev.sh /opt/startup.relational.dev.sh
RUN chmod +x /opt/startup.relational.dev.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.relational.dev.sh

WORKDIR /usr/src/app

CMD ["/opt/startup.relational.dev.sh"]