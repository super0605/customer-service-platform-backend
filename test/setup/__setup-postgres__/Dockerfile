FROM postgres:11.6

# can't copy with chmod until https://github.com/moby/moby/issues/34819
COPY 10-init-db.sh /tmp/10-init-db.sh
RUN mv /tmp/10-init-db.sh /docker-entrypoint-initdb.d/10-init.db.sh && chmod +x /docker-entrypoint-initdb.d/10-init.db.sh
