
# Certificados digitales e introducción al despliegue en red

## 1. Certificados digitales y HTTPS en NGINX

El protocolo HTTPS permite establecer una conexión cifrada entre el servidor y el cliente, garantizando:
- Confidencializad: Los datos bajan cifrados.
- Autenticidad: El cliente puede verificar la identidad del servidor.
- Integridad: Evita que los datos se alteren durante la transmisión.
Para poder emplear HTTPS, el servidor web necesita disponer de un certificado digital.

Un certificado digital X.509 es un archivo que contiene:

- El nombre del dominio o entidad.
- Una clave pública asociada.
- La firma de una autoridad certificadora (CA).

Los navegadores confían solo en certificados firmados por una autoridad certificadora reconocida, como *Let's Encrypt*, *DigiCert*, *Sectigo*, etc.

En entornos de pruebas, también podemos generar certificados autofirmados (**self-signed**).

### 1.1. Creación de un certificado autofirmado

Podemos usar un contenedor temporal de OpenSSL (ya incluido en muchas imágenes Linux) para generar el certificado. 

Podemos disponer de los archivos de nuestro entorno de trabajo en una estructura de carpetas similar a esta:

```bash
/nginx-https/
│
├── docker-compose.yml
├── nginx.conf
├── certs/
│   ├── server.crt
│   └── server.key
└── html/
    └── index.html
```

Trabajaremos realizando la construcción del contenedor a través de `docker-compose` y *bindeando* desde ahí los archivos necesarios.

En un terminal, ejecutamos el siguiente comando para obtener una clave privada `server.key` y un certificado autofirmado válido durante un año `server.crt`.

```bash
docker run --rm -v %cd%/certs:/certs alpine/openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt \
  -subj "/C=ES/ST=Sevilla/L=Sevilla/O=IES/OU=Clase/CN=localhost"
```

Lo siguiente es configurar nginx para usar HTTPS, modificando el `nginx.conf` para que tenga una apariencia similar a esta:

```
events {}

http {
    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate     /etc/nginx/certs/server.crt;
        ssl_certificate_key /etc/nginx/certs/server.key;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }
    }

    # Redirección HTTP -> HTTPS
    server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
    }
}
```

Una vez hecho esto, debemos configurar el archivo `docker-compose.yml` para que tenga una apariencia similar a esta:

```yml
version: '3.8'
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./html:/usr/share/nginx/html
      - ./certs:/etc/nginx/certs

```

Por último, lanzamos el contenedor con `docker compose up -d` (el -d para el modo *detached*, lo que nos permitirá destruirlo más adelante con `docker compose down` en el mismo terminal).

Ahora, vista `localhost` y verás un aviso de seguridad, porque el certificado es autofirmado y no pertenece a una CA reconocida. Esto es lo normal cuando estamos haciendo pruebas. En un despliegue final, deberías tener certificados que hayan pasado por una CA como las mencionadas anteriormente.

> **ACTIVIDAD**
> Crea un certificado autofirmado con tus datos; configura NGINX para servir contenido seguro mediante HTTPS; verifica el certificado desde el navegador, dándole a `ver Detalles del certificado`; crea una redirección automática de http:// a https:// y comprueba la diferencia de comportamiento al acceder por http y https.


## 2. Introducción al despliegue en red

En este punto, vamos a trasladar todo lo que hemos hecho hasta ahora usando Docker a un servidor web real. Hay muchas opciones disponibles, pero vamos a emplear el servicio `koyeb`, que dispone de una opción gratuita. Lo primero que haremos será registrarnos en `koyeb` (podemos hacerlo con nuestra cuenta de github). Nada más comenzar, nos da acceso a un plan Pro, pero el que vamos a usar más adelante es el plan Free.

i) Se han utilizado tecnologías de virtualización en el despliegue de servidores web en la nube y en contenedores.



h) Se han realizado los ajustes necesarios para la implantación de aplicaciones en el servidor web.

## 3. Certificados en un entornos real con Let's Encrypt

En servidores públicos, puedes usar **Certbot** para obtener certificados gratuitos y automáticos de *Let's Encrypt*. Para ello, necesitamos lanzar en el servidor, suponiendo que es un servidor Linux, los siguientes comandos:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d midominio.com -d www.midominio.com
```

Este proceso valida que el dominio apunta a nuestro servidor, genera los certificados, configura NGINX automáticamente para HTTPS y programa la renovación automática cada 90 días.

## 4. Herramientas para la gestión de logs

j) Se han instalado, configurado y utilizado conjuntos de herramientas de gestión de logs, permitiendo su monitorización, consolidación y análisis en tiempo real.