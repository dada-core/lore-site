---
title: "HTTPS and reverse proxy"
description: "In production, put Lore behind a reverse proxy that handles HTTPS."
---

## How it works

The proxy receives HTTPS connections and forwards them to Lore’s port 8080. Set the HTTPS address in `LORE_PUBLIC_URL`: it is used for invitation links and secure cookies.

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
    client_max_body_size 50m;

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
> **Upload size.** Once document import arrives, in v0.1, match the proxy’s size limit with Lore’s: otherwise large files will be rejected by the proxy before they reach the application.
