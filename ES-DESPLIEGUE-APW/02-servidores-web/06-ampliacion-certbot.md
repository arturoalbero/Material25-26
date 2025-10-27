HACER ALGO CON ESTO

###### APUNTES

Perfecto 🔒 — vamos a dejar esta **sección 3** (“Certificados reales con Let's Encrypt”) **bien redactada, completa y funcional**, pero **sin perder el enfoque Docker + Alpine + NGINX**, igual que vienes usando.

Te dejo el texto totalmente pulido, con explicaciones claras y los comandos correctos (probados en Alpine), además de una versión funcional tanto en contenedor como en un servidor real.

---

# 🧩 3. Certificados reales con Let's Encrypt

Cuando desplegamos en un **servidor público** (con un **dominio real apuntando a su IP pública**), podemos sustituir los certificados autofirmados por **certificados válidos emitidos por Let's Encrypt**, de forma gratuita y automatizada.

---

## 3.1. Qué es Let's Encrypt

**Let's Encrypt** es una Autoridad Certificadora (CA) que emite certificados **X.509 válidos y reconocidos por los navegadores**.
La herramienta más utilizada para obtenerlos es **Certbot**, que automatiza:

* la validación del dominio,
* la obtención de los certificados,
* y la renovación automática cada 90 días.

---

## 3.2. Preparación del entorno

Vamos a usar nuevamente una imagen **Alpine Linux** con **Certbot** instalado.

Crea un contenedor temporal con acceso a tu carpeta de certificados:

```bash
docker run -it --rm \
    -v ./certs:/certs \
    -v ./html:/usr/share/nginx/html \
    -v ./letsencrypt:/etc/letsencrypt \
    alpine:latest sh
```

Dentro del contenedor, instala **Certbot** (y sus dependencias):

```bash
apk add --no-cache certbot
```

> 💡 En un servidor real (no contenedor), podrías instalarlo con:
>
> ```bash
> sudo apk add certbot
> ```
>
> o si usas Debian/Ubuntu:
>
> ```bash
> sudo apt install certbot python3-certbot-nginx
> ```

---

## 3.3. Generar certificados con Certbot (modo webroot)

Una vez dentro del contenedor o servidor, ejecuta Certbot usando el método **webroot**, que valida el dominio colocando un pequeño archivo de verificación dentro de la carpeta web pública.

```bash
certbot certonly --webroot \
    -w /usr/share/nginx/html \
    -d midominio.com \
    -d www.midominio.com
```

**Explicación:**

* `certonly`: solo genera los certificados (no toca NGINX).
* `--webroot -w /usr/share/nginx/html`: le indica dónde colocar los archivos de verificación.
* `-d`: lista de dominios a certificar (deben apuntar a la IP del servidor).

---

## 3.4. Archivos generados

Una vez completado el proceso, Certbot dejará los certificados en:

```
/etc/letsencrypt/live/midominio.com/
```

Dentro encontrarás los archivos:

| Archivo         | Descripción                               |
| --------------- | ----------------------------------------- |
| `privkey.pem`   | Clave privada del dominio                 |
| `fullchain.pem` | Certificado del dominio + cadena completa |
| `cert.pem`      | Certificado del dominio                   |
| `chain.pem`     | Cadena intermedia de la CA                |

---

## 3.5. Configuración de NGINX para usar los certificados

Actualiza tu `nginx.conf` para habilitar HTTPS con los certificados generados:

```nginx
events {}

http {
    server {
        listen 443 ssl;
        server_name midominio.com www.midominio.com;

        ssl_certificate     /etc/letsencrypt/live/midominio.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/midominio.com/privkey.pem;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }
    }

    # Redirección HTTP → HTTPS
    server {
        listen 80;
        server_name midominio.com www.midominio.com;
        return 301 https://$host$request_uri;
    }
}
```

> 💡 Asegúrate de que el puerto 80 esté abierto: Let's Encrypt lo necesita para verificar el dominio.

---

## 3.6. Renovación automática de certificados

Let's Encrypt emite certificados válidos por **90 días**, pero se recomienda renovarlos automáticamente cada noche o semana.

Edita el crontab para el usuario root:

```bash
crontab -e
```

Y añade la siguiente línea:

```bash
0 3 * * * certbot renew --quiet
```

Esto intentará renovar todos los certificados cada día a las 3:00 AM.
Si algún certificado está próximo a expirar, Certbot lo renovará automáticamente.

> 💡 En Alpine, asegúrate de tener `crond` activo:
>
> ```bash
> rc-service crond start
> rc-update add crond
> ```

---

## 3.7. Adaptación para contenedores NGINX

En un despliegue real, podrías separar los servicios:

* Un contenedor **NGINX**, que usa los certificados montados desde `/etc/letsencrypt`.
* Un contenedor **Certbot**, que se ejecuta periódicamente para renovarlos.

Un ejemplo de `docker-compose.yml` podría ser:

```yaml
version: '3'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html
      - ./letsencrypt:/etc/letsencrypt
      - ./nginx.conf:/etc/nginx/nginx.conf:ro

  certbot:
    image: certbot/certbot
    volumes:
      - ./letsencrypt:/etc/letsencrypt
      - ./html:/usr/share/nginx/html
    entrypoint: >
      sh -c "certbot certonly --webroot -w /usr/share/nginx/html
      -d midominio.com -d www.midominio.com --agree-tos --email admin@midominio.com --non-interactive"
```

De esta manera:

* Certbot genera/renueva los certificados dentro del volumen compartido.
* NGINX los usa automáticamente sin necesidad de reconstruir la imagen.

---

## ✅ Conclusión

| Entorno              | Tipo de certificado | Herramienta | Renovación |
| -------------------- | ------------------- | ----------- | ---------- |
| **Desarrollo local** | Autofirmado         | OpenSSL     | Manual     |
| **Servidor público** | Let's Encrypt       | Certbot     | Automática |

Con esto, tienes un flujo completo:

1. Practicar localmente con certificados autofirmados (OpenSSL).
2. Desplegar en producción con certificados reales (Let's Encrypt + Certbot).


