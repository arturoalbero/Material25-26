# Configuración de NGINX

Información extraída de [**este vídeo.**](https://youtu.be/9t9Mp0BGnyI?si=3pLqVFGjZ3nzOY7D)

## Terminología básica

[**Archivo nginx.conf**](https://nginx.org/en/docs/beginners_guide.html#conf_structure)

NGINX está compuesto de módulos controlados por directivas especificadas en el archivo de configuración, `nginx.conf`. Las directivas pueden ser simples o de bloque. 
- **Una directiva simple** consiste en una línea que contiene el nombre de un parámetro y su valor, separados por espacio y finalizando con un `;`. Por ejemplo, `worker_connections 1024;`.
- **Una directiva de bloque** consiste en un nombre de bloque y dos llaves tipo *curly braces-* `{}`. Esas llaves definen el bloque y pueden contener tanto directivas simples como otras directivas de bloque. Las directivas de bloque no necesitan tener contenido dentro y sirven para definir **contextos**, como por ejemplo los contextos *http*, *events*, *server*, *location*, *main*, etc. 

```
events {
    worker_connections 1024;
}
```

> **NOTA:** El bloque events {} suele incluirse siempre, aunque esté vacío, ya que define la configuración del modelo de eventos que usa NGINX. En muchas distribuciones es opcional, pero recomendable mantenerlo.

En un archivo .conf, todo lo que se escribe después del caracter `#` se considera comentario y no se ejecuta.

### Docker y nginx.conf


Para poder usar Docker y nginx de forma adecuada, debemos pasarle nuestro archivo de configuración. Podemos extraer un archivo de configuración de una imagen de docker de la siguiente forma:

```bash
docker run --rm --entrypoint=cat nginx /etc/nginx/nginx.conf > ./nginx.conf
```
Esto extrae el archivo de configuración a la ruta donde ejecutamos el comando `./`.

Si lo observamos, vemos que incluye la directiva `include /etc/nginx/conf.d/*.conf;`. Esto lo que hace es incluir la configuración por defecto. Vamos a probar a comentar esa línea e incluir la siguiente directiva:

```
# include /etc/nginx/conf.d/*.conf; # Omitimos la configuración por defecto
    server{
        listen 8080; # Le decimos que escuche en el puerto 8080
        server_name localhost; # Le damos un nombre al servidor
        location / { # Definimos lo que ocurre en `/`
            root /usr/share/nginx/html; # Especificamos en qué carpeta está el html (usamos la misma que en el apartado anterior)
            index index.html; # Le indicamos qué archivo es el index
        }
    }
```
En esta directiva de bloque estamos creando un servidor para las peticiones http (ya que está dentro de ese contexto). Por simplicidad, lo hemos creado justo debajo de la línea `include(...)` que hemos comentado. 
- listen 8080; le dice que escuche en el puerto 8080 (que luego deberemos mapear en el docker run)
- server_name localhost; le indica que el nombre del servidor es localhost.
- location /{} Es una directiva de bloque para indicar dónde esta el contenido que debe servirse en la URI '/'.
    - root /usr/share/nginx/html; le indica la ruta donde tenemos nuestros archivos estáticos
    - index index.html; le indica qué archivo debe servirse por defecto.

Para construir una imagen personalizada con esta nueva configuración, usamos Dockerfile:

```dockerfile
FROM nginx
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
```

> **NOTA:** EXPOSE no publica el puerto, solo documenta que el contenedor lo usa. El mapeo real se hace con -p al ejecutar docker run o docker create.

Y usamos `docker build -t mi-nginx:1 .` para construir la imagen. Después, hacemos el docker run y en la consola podremos ver si todo va bien cuando intentemos acceder al contenido.  

> **Actividad 1**: Prueba a exponer el puerto 6060 y a añadirle un index.html personalizado usando volumes.

> **Actividad 2**: Crea una carpeta donde tengas un archivo dockerfile con la configuración de la imagen y crea un docker-compose.yml para especificar tanto el cambio del archivo de configuración como el bindeo del contenido estático.

> **NOTA** Cada vez que cambias la configuración en NGINX, para que se haga efectiva, hay que recargar el servidor. Si lo usas en tu ordenador, debes usar el comando `nginx -s reload`. En Docker tienes dos opciones:
> - Apagar y encender el contenedor de forma manual
> - Usar el comando `Docker exec [nombre-contenedor][comando]`, en este caso concreto `Docker exec mi-nginx nginx -s reload`.

## Construyendo un nginx.conf desde 0

Para construir un archivo de configuración desde 0, debemos tener en cuenta que el contexto `events{}` es obligatorio. De momento, no lo vamos a necesitar. Borremos el archivo de configuración que teníamos y definamos una directiva de bloque `events{}` y otra `http{}`. Dentro del http, definamos una directiva de bloque `server{}` y dentro de esta definamos qué puerto queremos escuchar, por ejemplo `listen 8080;` y dónde está nuestro html (por defecto, `root /usr/share/nginx/html;`). 

Si montas la imagen y lo ejecutas, verás que funciona exactamente igual que antes (aunque el archivo es mucho más simple).

Vamos a crear una carpeta `html` propia para mandarle el contenido a la imagen bindeando el volumen. Recuerda, si has llamado a la imagen como `nginx-beta`, el comando docker run debería ser algo así:

```bash
docker run -v ./html/:/usr/share/nginx/html -p8080:8080 nginx-beta:1
```

Ahora vamos a añadir un `index.html` sencillo y un `styles.css`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css"> 
</head>
<body>
    <h1>Hola desde NGINX AMIGO</h1>
    <p>color</p>
</body>
</html>
```

```css
p {
    color: red;
}
```

Como podemos observar, el html funciona a la perfección, pero no ocurre lo mismo con el css...

## Mime.types

Por defecto, nginx interpreta todos los archivos como archivos de texto plano (concretamente, Content-Type: text/plain). Esto significa que, aunque pueda cargar html planos, no puede cargar archivos con tipo. Para ello, podemos añadir un nuevo contexto dentro de http:
```
types{
    text/css css;
    text/html html;
}
```
Ahora, al ejecutarlo todo, debería verse el color adecuado.


Esta forma no está mal, pero requiere mapear todos los tipos de datos que se vayan a usar. Para evitar esto, nginx viene con un módulo llamado mime.types, que básicamente es un archivo donde están todos los tipos mapeados. Para añadir un módulo, simplemente tenemos que usar la directiva `include`, en este caso, sustituimos la directiva de bloque `types` por una directiva simple `include mime.types`. Prueba a editarlo y el efecto debería ser el mismo.

## Uso de volúmenes para trabajar con Docker eficientemente

Hasta ahora, habrás observado que tienes que borrar los contenedores y las imágenes constantemente o se llena de ellos el Docker.

Una estrategia que podemos seguir es extraer los archivos de nginx de la imagen en nuestro disco duro y después bindear la carpeta resultante cuando creemos el contenedor. De esta forma, apagando y volviendo a encender el contenedor podremos apreciar los cambios que hagamos en la configuración. Para ello, ejecutamos los siguientes comandos

```bash
docker create --name nginx-temporal nginx
docker cp "nginx-temporal:/etc/nginx" ./volumes-nginx/conf
docker cp "nginx-temporal:/usr/share/nginx/" ./volumes-nginx/data
docker rm nginx-temporal
```

De esta forma, creamos un contenedor temporal `nginx-temporal` y, sin lanzarlo, copiamos de ese contenedor las carpetas que queramos convertir en volúmenes bindeados en una carpeta `volumes-nginx` que previamente hayamos creado. En este ejemplo, hemos copiado los archivos de configuración de `/etc/nginx` en la carpeta `/volumes-nginx/conf` y los archivos de datos en la carpeta `volumes-nginx/data`. Por último, de forma opcional, borramos el contenedor.

Ahora podemos crear un nuevo contenedor y bindear las dos carpetas como volúmenes dentro de nuestro contenedor con un solo comando:

```bash
docker run --name nginx-bindeado -p8080:8080 -v ./volumes-nginx/conf/nginx:/etc/nginx -v ./volumes-nginx/data/nginx:/usr/share/nginx nginx
```
Nos conectamos a localhost:8080 y, como era de esperar, no ve nada (por defecto, nginx manda la señal al puerto 80).

Por lo tanto, empecemos a hacer cambios. Lo primero es ir al archivo nginx.conf y eliminarlo por completo, cambiándolo por el sencillo que habíamos creado antes.

```nginx
events {}

http{
    include mime.types;
    server{
        listen 8080;
        root /usr/share/nginx/html;
    }
}
```

Volvemos a intentar conectarnos a 8080 y deberíamos ver la web de bienvenida de nginx. Ahora, nos vamos a nuestro volúmen y, en la sección de datos, sustituimos el contenido de la carpeta html por el que habíamos creado antes. No hará falta reiniciar el contenedor para ver los resultados.

> **CONSEJO:** Es muy probable fallar con las rutas cuando bindeamos un volumen si no tenemos experiencia. Observar el log para analizar en qué hemos fallado es clave para poder corregir nuestros errores. Por ello, recomiendo usar la consola de Visual Studio Code para lanzar los comandos `docker run` y `docker start` para ver el log en la consola. No necesitamos el modo *detached*.
>
> Para parar el contenedor podemos pulsar `ctrl+c`, detenerlo desde `docker desktop` o usar `docker stop` en otro terminal. También puedes acceder al log desde `docker desktop`, así como pararlo y volverlo a lanzar. La decisión es tuya.
>
> Si el contenedor falla al lanzarse por un error de bindeo, usa docker rm [nombre] para borrar el contenedor. Es por eso que el comando --name viene muy bien, para usar nombres fáciles de recordar y poder crear, lanzar, detener y borrar contenedores con facilidad.

## Observando la carpeta de configuración de nginx

Al hacer `docker cp` hemos copiado la carpeta de configuración de nginx. Aparte de nuestro archivo nginx.conf, vemos que hay un montón de archivos más, entre ellos mime.types. En él podemos observar como se trata simplemente de un archivo con una directiva de bloque `types` y un montón de directivas simples con los tipos de datos más frecuentes. Estos archivos se usan a través de directivas include dentro del archivo `nginx.conf`, y tienen diversas funciones.

```
include /etc/nginx/mime.types;
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/fastcgi_params;
```


El archivo `fastcgi_params` define **una serie de variables FastCGI** que se pasan al backend (por ejemplo, PHP-FPM).
Contiene líneas como:

```nginx
fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
fastcgi_param  QUERY_STRING       $query_string;
fastcgi_param  REQUEST_METHOD     $request_method;
```

Son simplemente **directivas `fastcgi_param`** que Nginx usa dentro de bloques `location` o `server` que gestionan peticiones `fastcgi_pass`. Nginx trae varios de estos ficheros “fragmentos” listos para usar:

* `uwsgi_params` — para aplicaciones Python vía uWSGI
* `scgi_params` — para backends SCGI
* `proxy_params` — para peticiones proxificadas a otro servidor HTTP

Todos siguen el mismo patrón: contienen directivas individuales (`uwsgi_param`, `proxy_set_header`, etc.) y se incluyen dentro de un `location` que use ese protocolo.

Además, vemos la carpeta `conf.d`, donde se guarda la configuración por defecto en el archivo `default.conf`. El archivo `default.conf` define un bloque server por defecto y se incluye desde nginx.conf mediante la directiva include /etc/nginx/conf.d/*.conf;

## El comando $(pwd) en Docker

En este documento hemos usado rutas relativas, empleando `.` para definir dónde nos encontrábamos y hacer así todos los bindeos. Hay una alternativa más elegante, que es usar $(pwd), un comando del shell que devuelve la ruta absoluta del directorio actual. 

* En Linux / macOS / WSL, se usa $(pwd) para insertar la ruta actual dentro de un comando.
* En Windows PowerShell, se usa ${PWD} (con llaves y mayúsculas)

En Docker, pwd es muy útil cuando haces bind mounts o volúmenes, porque Docker necesita rutas absolutas para saber qué carpeta del host montar dentro del contenedor. Aunque de momento nos ha servido el `.`, es más idiomático y fiable usar el `$(pwd)`. Con este comando, sin embargo, Docker puede tener problemas interpretando las mayúsculas y las minúsculas. Es por ello que debes envolver las direcciones entre comillas, como por ejemplo `"$(pwd)/volumes-nginx/conf/nginx:/etc/nginx"`. 

A partir de ahora, usa las rutas relativas para pruebas rápidas, pero emplea `$(pwd)` en entornos reales y automatizados, como Docker Compose.

> **ACTIVIDAD 3:** Crea un entorno de trabajo para gestionar un servidor web nginx a través de Docker de la forma vista hasta ahora, con los volúmenes bindeados para trabajar cómodamente y registra los pasos en capturas de pantalla. Usa $(pwd).