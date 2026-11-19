---
title: "HTTPS and reverse proxy"
description: "In production, put Lore behind a reverse proxy that handles HTTPS."
---

## How it works

The proxy receives HTTPS connections and forwards them to Lore’s port 8080. Set the HTTPS address in `LORE_PUBLIC_URL`: it is used for invitation links and secure cookies.

If the proxy runs on another machine than Lore, or if Lore runs with Docker, also declare it in `LORE_TRUSTED_PROXIES`: see [Declare the proxy](#declare-the-proxy).

## Examples

```text tab="Caddy" title="Caddyfile"
lore.example.com {
    reverse_proxy localhost:8080
}
```

```nginx tab="Nginx" title="nginx.conf"
server {
    listen 443 ssl;
    server_name lore.example.com;
    ssl_certificate     /etc/ssl/lore.example.com.crt;
    ssl_certificate_key /etc/ssl/lore.example.com.key;
    client_max_body_size 51m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```yaml tab="Traefik" title="docker-compose.yml"
services:
  lore:
    labels:
      - traefik.enable=true
      - traefik.http.routers.lore.rule=Host(`lore.example.com`)
      - traefik.http.routers.lore.tls.certresolver=letsencrypt
      - traefik.http.services.lore.loadbalancer.server.port=8080
```

Caddy gets and renews the certificate automatically. With Nginx, point to your certificate files; with Traefik, to the certificate resolver declared in its configuration.

> [!WARNING]
> **Upload size.** Set the proxy’s size limit a little above the maximum size of a file, 50 MB by default: the request of an import also holds a few fields, and Lore accepts the size set plus 1 MB. Otherwise, large files are rejected by the proxy before they reach the application. If you raise the maximum size in *Administration › Storage and import*, raise the proxy’s limit too. See [Storage and extraction](storage.md#file-size).

## Declare the proxy

Lore trusts the `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host` and `X-Forwarded-Port` headers only from the reverse proxies declared in `LORE_TRUSTED_PROXIES`. Otherwise, a computer on the local network that reaches Lore directly could choose the IP address written in the audit log, and get around the sign-in lockout by IP address.

- **Format.** Ranges in CIDR notation, each with its “/”, separated by commas, for example `10.0.0.5/32, 10.0.0.6/32`. In `lore.env`, separate the ranges with commas, without spaces: `10.0.0.5/32,10.0.0.6/32`. The `lore.env` of the packages and the `conf/lore.env.example` of the archive hold the line as a comment: `# LORE_TRUSTED_PROXIES=127.0.0.0/8,::1/128`.
- **Always the “/”.** A list of addresses without any “/” would be read as a regular expression, which designates no proxy: Lore refuses to start with it, and says so in its logs. Write `10.0.0.5/32, 10.0.0.6/32`. A malformed range also keeps it from starting, as does a host or container name (`nginx`): write its IP address, or the range of the Docker network.
- **By default**, `127.0.0.0/8, ::1/128`: a proxy on the same machine, with the packages and the archive; with Docker, no proxy outside the container: see [With Docker Compose](#with-docker-compose). An empty value trusts no proxy (with Docker Compose, an empty value in `.env` gives back the default value).
- **As narrow as possible.** Any machine of a declared range that reaches Lore directly can choose the address recorded: declare the address of the proxy alone (`10.0.0.5/32`), not the network of your computers.
- **Address not valid.** A forwarded address that is not an IP address is recorded as `invalid`. An address followed by its port, such as `203.0.113.7:5678` or `[2001:db8::1]:5678`, is recorded without its port.

If the proxy is not declared, every request carries its address: in the audit log, in the sessions and for the sign-in lockout, where five failures (by default) by a third party then lock the targeted email address for everyone. Lore then also ignores the `X-Forwarded-Proto`, `X-Forwarded-Host` and `X-Forwarded-Port` headers; with `LORE_PUBLIC_URL` set to HTTPS, cookies stay secure. When a request arrives with an `X-Forwarded-For` header from a private address that is not declared, Lore writes it to its logs, once per address: “Requests from 172.18.0.1 carry an X-Forwarded-For header, but 172.18.0.1 is not declared in LORE_TRUSTED_PROXIES…”.

### With Docker Compose

With Docker, Lore never sees 127.0.0.1. Through a published port, it sees the Docker gateway, for example 172.18.0.1, for a proxy on the host machine; a proxy in a container attached to Lore’s network gives it its own address, for example 172.18.0.3. But the gateway also relays other connections, such as those of IPv6 clients when the Docker network only has IPv4: trusting it would let these clients choose their address. The published `docker-compose.yml` therefore trusts no proxy outside the container.

Behind a proxy on the machine or in a container, make these two settings together.

**Publish Lore’s port on 127.0.0.1 only**, so that only the proxy reaches it. Next to `docker-compose.yml`, create a `docker-compose.override.yml` file: Docker Compose reads it without being told, and it stays in place when you download a new `docker-compose.yml`.

```yaml title="docker-compose.override.yml"
services:
  lore:
    ports: !override
      - "127.0.0.1:8080:8080"
```

`!override` replaces the published port instead of adding one to it: it needs Docker Compose 2.24.4 or later (`docker compose version`). If the proxy runs in a container attached to Lore’s network, no port needs to be published: write `ports: !reset []`.

**Declare the networks of Docker** in the `.env` file next to `docker-compose.yml`: the published file passes the variable on to Lore. Then restart the containers:

```sh
echo "LORE_TRUSTED_PROXIES=172.16.0.0/12" >> .env
docker compose up -d
```

Docker usually takes its networks from `172.16.0.0/12`, then from `192.168.0.0/16` once those are used up: `docker network ls` lists the networks, for example `lore_default`, and `docker network inspect` gives the range of each.
