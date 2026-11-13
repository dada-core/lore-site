---
title: "HTTPS et proxy inverse"
description: "En production, placez Lore derrière un proxy inverse qui gère le HTTPS."
---

## Principe

Le proxy reçoit les connexions HTTPS et les transmet au port 8080 de Lore. Indiquez l’adresse HTTPS dans `LORE_PUBLIC_URL` : elle sert aux liens d’invitation et aux cookies sécurisés.

## Exemples

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

Caddy obtient et renouvelle le certificat automatiquement. Avec Nginx, indiquez vos fichiers de certificat ; avec Traefik, le résolveur de certificats déclaré dans sa configuration.

> [!WARNING]
> **Taille des imports.** Avec l’import de documents, prévu en v0.1, alignez la limite de taille du proxy sur celle de Lore : sinon, les gros fichiers seront refusés par le proxy avant d’arriver à l’application.
