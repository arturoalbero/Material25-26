# Despliegue de un servidor web y un servidor de aplicaciones usando Docker

> **Criterios de evaluación:** 1c, 1d, 1g, 1h, 1i

**Objetivo:** El objetivo de esta actividad es comprender y demostrar la diferencia entre un **servidor web** (Nginx) y un **servidor de aplicaciones** (Tomcat). Para ello, se despliega una arquitectura en la que el servidor web sirve una página estática y, al mismo tiempo, actúa como *proxy inverso* para una aplicación dinámica que se ejecuta en el servidor de aplicaciones.


## 1\. Preparación del Entorno

1.  Cree una carpeta principal para el proyecto, por ejemplo: `docker-servidores`.

2.  Dentro de esta carpeta, cree la siguiente estructura de directorios:

    ```
    .
    ├── docker-compose.yml
    ├── nginx
    │   ├── nginx.conf
    │   └── index.html
    └── tomcat
        └── webapp
            └── index.jsp
    ```

## 2\. Configuración del Servidor Web (Nginx)

1.  En la carpeta `nginx`, cree el archivo `index.html` con el siguiente contenido. Este es el contenido estático que Nginx servirá directamente.

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Servidor Web Nginx</title>
    </head>
    <body>
        <h1>Bienvenido al Servidor Web Nginx</h1>
        <p>Esta es una página estática servida directamente por Nginx.</p>
        <p>Haga clic para ver la página dinámica de Tomcat: <a href="/app">Ir a la aplicación</a></p>
    </body>
    </html>
    ```

2.  En la misma carpeta `nginx`, cree el archivo `nginx.conf`. Este archivo de configuración instruye a Nginx para que escuche en el puerto 80, sirva el archivo `index.html` y redirija las peticiones de la ruta `/app` al contenedor de Tomcat.

    ```nginx
    events {
        worker_connections 1024;
    }

    http {
        server {
            listen 80;

            location / {
                root /usr/share/nginx/html;
                index index.html;
            }

            location /app {
                proxy_pass http://tomcat:8080/webapp/index.jsp;
            }
        }
    }
    ```

## 3\. Configuración del Servidor de Aplicaciones (Tomcat)

1.  En la carpeta `tomcat/webapp`, cree el archivo `index.jsp` con el siguiente contenido. Este es el contenido dinámico que será procesado por el servidor de aplicaciones.

    ```jsp
    <!DOCTYPE html>
    <html>
    <head>
        <title>Servidor de Aplicaciones Tomcat</title>
    </head>
    <body>
        <h1>Página dinámica de Tomcat</h1>
        <p>Esta página fue generada por el servidor de aplicaciones.</p>
        <p>Fecha y hora actual: <%= new java.util.Date() %></p>
    </body>
    </html>
    ```

## 4\. Orquestación de Contenedores con Docker Compose

1.  En la carpeta principal del proyecto, cree el archivo `docker-compose.yml`. Este archivo define los servicios y cómo se relacionan entre sí.

    ```yaml
    version: '3.8'

    services:
      nginx:
        image: nginx:1.21
        container_name: nginx_web_server
        ports:
          - "80:80"
        volumes:
          - ./nginx/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/index.html:/usr/share/nginx/html/index.html
        depends_on:
          - tomcat

      tomcat:
        image: tomcat:9-jdk11-openjdk
        container_name: tomcat_app_server
        volumes:
          - ./tomcat/webapp:/usr/local/tomcat/webapps/webapp
    ```

## 5\. Despliegue y Verificación

1.  Abra una terminal en la carpeta principal del proyecto.
2.  Ejecute el comando `docker-compose up -d` para desplegar ambos contenedores en segundo plano.
3.  Abra un navegador web y acceda a la dirección **`http://localhost`**.
4.  Observe que Nginx sirve la página estática `index.html`.
5.  Haga clic en el enlace "Ir a la aplicación" o acceda directamente a **`http://localhost/app`**.
6.  Verifique que el contenido de la página cambia con cada recarga, demostrando que fue procesado dinámicamente por el servidor de aplicaciones.

## Cuestionario y Reflexión

Una vez finalizada la actividad, elabore las respuestas a las siguientes preguntas para consolidar el conocimiento:

  * ¿Qué función cumple Nginx al acceder a la dirección `http://localhost/app`?
  * ¿Por qué es beneficioso utilizar dos servidores separados en lugar de que Tomcat sirva tanto el contenido estático como el dinámico?
  * ¿Qué sucede si se detiene el contenedor de Tomcat mientras Nginx sigue en ejecución? Describa el resultado al intentar acceder a ambas direcciones.