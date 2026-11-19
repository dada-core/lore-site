---
title: "HTTPS et proxy inverse"
description: "En production, placez Lore derrière un proxy inverse qui gère le HTTPS."
---

## Principe

Le proxy reçoit les connexions HTTPS et les transmet au port 8080 de Lore. Indiquez l’adresse HTTPS dans `LORE_PUBLIC_URL` : elle sert aux liens d’invitation et aux cookies sécurisés.

Si le proxy tourne sur une autre machine que Lore, ou si Lore tourne avec Docker, déclarez-le aussi dans `LORE_TRUSTED_PROXIES` : voir [Déclarer le proxy](#déclarer-le-proxy).

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

Caddy obtient et renouvelle le certificat automatiquement. Avec Nginx, indiquez vos fichiers de certificat ; avec Traefik, le résolveur de certificats déclaré dans sa configuration.

> [!WARNING]
> **Taille des imports.** Réglez la limite de taille du proxy un peu au-dessus de la taille maximale d’un fichier, 50 Mo par défaut : la requête d’un import contient aussi quelques champs, et Lore accepte la taille réglée plus 1 Mo. Sinon, les gros fichiers sont refusés par le proxy avant d’arriver à l’application. Si vous relevez la taille maximale dans *Administration › Stockage et import*, relevez aussi celle du proxy. Voir [Stockage et extraction](storage.md#taille-des-fichiers).

## Déclarer le proxy

Lore ne croit les en-têtes `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host` et `X-Forwarded-Port` que des proxys inverses déclarés dans `LORE_TRUSTED_PROXIES`. Sinon, un poste du réseau local qui joint directement Lore pourrait choisir l’adresse IP inscrite au journal d’audit, et contourner le blocage des connexions par adresse IP.

- **Format.** Des plages en notation CIDR, chacune avec son « / », séparées par des virgules, par exemple `10.0.0.5/32, 10.0.0.6/32`. Dans `lore.env`, séparez les plages par des virgules, sans espace : `10.0.0.5/32,10.0.0.6/32`. Le `lore.env` des paquets et le `conf/lore.env.example` de l’archive contiennent la ligne en commentaire : `# LORE_TRUSTED_PROXIES=127.0.0.0/8,::1/128`.
- **Toujours le « / ».** Une liste d’adresses sans aucun « / » serait lue comme une expression régulière, qui ne désigne aucun proxy : Lore refuse de démarrer avec elle, et le dit dans ses journaux. Écrivez `10.0.0.5/32, 10.0.0.6/32`. Une plage mal écrite l’empêche aussi de démarrer, comme un nom d’hôte ou de conteneur (`nginx`) : écrivez son adresse IP, ou la plage du réseau Docker.
- **Par défaut**, `127.0.0.0/8, ::1/128` : un proxy sur la même machine, avec les paquets et l’archive ; avec Docker, aucun proxy hors du conteneur : voir [Avec Docker Compose](#avec-docker-compose). Une valeur vide ne fait confiance à aucun proxy (avec Docker Compose, une valeur vide dans `.env` redonne la valeur par défaut).
- **Au plus juste.** Toute machine d’une plage déclarée qui joint Lore directement peut choisir l’adresse inscrite : déclarez l’adresse du proxy seule (`10.0.0.5/32`), pas le réseau de vos postes.
- **Adresse non valable.** Une adresse transmise qui n’est pas une adresse IP est inscrite `invalid`. Une adresse suivie de son port, comme `203.0.113.7:5678` ou `[2001:db8::1]:5678`, est inscrite sans son port.

Si le proxy n’est pas déclaré, toutes les requêtes portent son adresse : au journal d’audit, dans les sessions et pour le blocage des connexions, où cinq échecs (par défaut) d’un tiers bloquent alors l’adresse e-mail visée pour tout le monde. Lore ignore alors aussi les en-têtes `X-Forwarded-Proto`, `X-Forwarded-Host` et `X-Forwarded-Port` ; avec `LORE_PUBLIC_URL` fixée en HTTPS, les cookies restent sécurisés. Quand une requête arrive avec un en-tête `X-Forwarded-For` d’une adresse privée qui n’est pas déclarée, Lore l’écrit dans ses journaux, une fois par adresse : « Requests from 172.18.0.1 carry an X-Forwarded-For header, but 172.18.0.1 is not declared in LORE_TRUSTED_PROXIES… ».

### Avec Docker Compose

Avec Docker, Lore ne voit jamais 127.0.0.1. Par un port publié, il voit la passerelle Docker, par exemple 172.18.0.1, pour un proxy sur la machine hôte ; un proxy dans un conteneur branché sur le réseau de Lore lui donne sa propre adresse, par exemple 172.18.0.3. Mais la passerelle relaie aussi d’autres connexions, comme celles des clients en IPv6 quand le réseau de Docker n’a que l’IPv4 : la croire laisserait ces clients choisir leur adresse. Le `docker-compose.yml` publié ne croit donc aucun proxy hors du conteneur.

Derrière un proxy sur la machine ou dans un conteneur, faites ces deux réglages ensemble.

**Publier le port de Lore sur 127.0.0.1 seulement**, pour que seul le proxy le joigne. Créez, à côté de `docker-compose.yml`, un fichier `docker-compose.override.yml` : Docker Compose le lit sans qu’on le nomme, et il reste en place quand vous téléchargez un nouveau `docker-compose.yml`.

```yaml title="docker-compose.override.yml"
services:
  lore:
    ports: !override
      - "127.0.0.1:8080:8080"
```

`!override` remplace le port publié au lieu de lui en ajouter un : il demande Docker Compose 2.24.4 ou plus récent (`docker compose version`). Si le proxy tourne dans un conteneur branché sur le réseau de Lore, aucun port n’a besoin d’être publié : écrivez `ports: !reset []`.

**Déclarer les réseaux de Docker** dans le fichier `.env`, à côté de `docker-compose.yml` : le fichier publié transmet la variable à Lore. Puis relancez les conteneurs :

```sh
echo "LORE_TRUSTED_PROXIES=172.16.0.0/12" >> .env
docker compose up -d
```

Docker prend d’ordinaire ses réseaux dans `172.16.0.0/12`, puis dans `192.168.0.0/16` une fois ceux-là épuisés : `docker network ls` liste les réseaux, par exemple `lore_default`, et `docker network inspect` donne la plage de chacun.
