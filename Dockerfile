FROM ubuntu:18.04

RUN apt clean
RUN apt update && true 1
RUN apt install -y curl gnupg software-properties-common
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt update && true 1
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt install -y nodejs git build-essential

RUN npm install pm2 -g

WORKDIR /app
ADD . /app
RUN cd /app && rm -rf ./node_modules && npm ci --production
RUN chmod +x /app/start.sh

CMD ["/bin/bash", "-c", "chmod +x /app/start.sh && /app/start.sh"]
