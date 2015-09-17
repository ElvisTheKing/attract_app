FROM node:onbuild
EXPOSE 8888
ENV HOST 0.0.0.0
ENV PORT 8888
ENV VIRTUAL_HOST "attractor.in,www.attractor.in"
