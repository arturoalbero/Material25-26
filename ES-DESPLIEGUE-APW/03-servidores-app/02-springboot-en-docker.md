# Desplegar una App Spring Boot con Docker

*Información extraída de [este enlace](https://www.arteco-consulting.com/articulos/tutorial-springboot/).* Esto significa que el texto está extraído de esa web y escrito por Ramón Arnau (adaptado por mí). Debes tener una aplicación Spring Boot preparada para empaquetar.

## Despliegue de una aplicación Spring Boot en Docker

Desplegar un programa con forma de Html dinámico realizado con Spring Boot y Java no puede ser más fácil con Docker. A continuación explicamos los pasos a seguir. Obviamente para poder desplegar una aplicación de Java que incluye el framework Spring Boot necesitarás tener las herramientas de Java instaladas de forma local. Aunque puede hacerse también con Gradle, recomendamos que uses Maven para empaquetar la web. Y por último necesitarás tener instalado Docker.

### Preparar la aplicación de Spring Boot

El primer paso es asegurarnos de que la aplicación funciona correctamente al estar empaquetada en un único archivo jar. Esto es fácilmente lograble si hemos usado Maven como herramienta de construcción de proyectos Java asegurándonos de que hemos incluido el plugin siguiente en el fichero `pom.xml`.

```html
<project attr="...">
   <!-- .... -->
   <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
   </build>
</project>
```
Indicar la versión del plugin es opcional si nuestro proyecto tiene como `parent` el proyecto paraguas de Spring Boot denominado `spring-boot-starter-parent`. Si no lo tienes puede incluir el siguiente fragmento, normalmente al principio del fichero `pom.xml`, después de project:

```html
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.2.4.RELEASE</version>
    <relativePath/>
</parent>
```

Habiendo realizado la configuración citada, el siguiente paso es invocar a Maven para verificar que el bundle es correcto y contiene tanto nuestra aplicación compilada como las dependencias jars contenidas dentro.

```bash
mvn clean package
java -jar target/app.jar
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _\` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
=========|\_|==============|___/=_/\_/\_/
:: Spring Boot ::        (v2.2.4.RELEASE)
```

>**NOTA**: En windows, es posible que tengas que usar el archivo mvnw que instala Spring Boot en lugar de `mvn`, que puede que no lo tengas instalado. Para ello, sitúate en la carpeta del proyecto y ejecuta `./mvnw clean package`. El resto debería funcionar igual.

La aplicación debe arrancar correctamente, sin mostrar ningún aviso de error quedándose a la escucha en el puerto Http indicado en la configuración, normalmente el 8080. De tal manera que al abrir el navegador en la url http://localhost:8080 se debe mostrar contenido de nuestro proyecto.

Llegados a este punto podemos asegurar que la aplicación funcionará desde dentro de un contenedor gestionado por Docker.

### Construir la imagen de Spring Boot para Docker

Una vez comprobado que la aplicación en un **fat-jar** *(un jar `java archive` que contiene tanto el código compilado como las dependencias)* obtenido a través del proceso de empaquetado de Maven, el siguiente paso es crear una imagen de la aplicación para que pueda ser usada en un contenedor virtualizado. Para ello se debe crear el fichero **Dockerfile** con los pasos necesarios para realizar el aprovisionamiento de la imagen. Afortunadamente, como usamos un fat-jar que contiene todas las dependencias requeridas dentro de él el aprovisionamiento se reduce a simplemente instalar la máquina virtual de Java.

De nuevo, el proceso es muy simple ya que partiremos de una imagen base que ya contiene el JDK que necesitamos. Se mantienen actualizadas las imágenes base con todas las versiones activas del JDK.

Así, el fichero Dockerfile queda tan simple como:

```dockerfile
FROM openjdk:26-ea-trixie
ADD target/my-fat.jar /usr/share/app.jar
ENTRYPOINT ["java", "-jar", "/usr/share/app.jar"]
```

La primera línea indica la imagen de java que vamos a usar. La segunda línea añade nuestra aplicación al empaquetado resultante, y por último se indica el comando de arranque que debe utilizar el contenedor una vez inicializado. En este caso, como `java` está incluido en el PATH de la imagen base, no necesitamos localizarlo en el contenedor.

Habiendo escrito el fichero de aprovisionamiento es hora de realizar la construcción de la imagen:

```bash
docker build -t appspring:latest .
```

### Arrancar contenedor con Spring Boot

Ya tenemos todo lo necesario para arrancar nuestro contenedor que ejecute la imagen construida en el paso anterior. Es importante saber que con cada nueva versión de la aplicación deberemos construir de nuevo la imagen, ya que por norma general los contenedores deben ser autosuficientes. Todo lo que necesiten deberá constar o estar aprovisionado en la imagen para asegurar que el entorno es estable y reproducible aun usando los contenedores, entidades altamente volátiles.

Aunque las imágenes son estáticas, en el momento de arrancar un contenedor podemos hacerle llegar parámetros en forma de variables de entorno o propiedades del sistema Java, usando -Dargument=value. Muy útil para indicar el profile de Spring que queremos que se active en el contenedor, por ejemplo para que use una u otra conexión con base de datos.

Aunque hay muchas formas, en nuestro caso usaremos una variable de entorno para indicar el perfil activo en la aplicación. Esto debe hacerse indicando el nombre de perfil a usar en la variable de entorno `SPRING_PROFILES_ACTIVE` tal y como indica la documentación oficial de Spring Boot.

También se debe indicar qué puerto del contenedor debe estar abierto, para que las peticiones http lleguen al proyecto. Por tanto, se debe añadir un argumento que configure que el tráfico que llegue en un puerto local, se redirija al puerto 8080 (por defecto de Spring) del contenedor.

Dicho esto, ya sólo queda lanzar un contenedor usando la imagen anterior e indicando el perfil a activar:

```bash
docker run --name appspring -p 8080:8080 --env SPRING_PROFILES_ACTIVE=docker appspring:latest
```

¡Y listos! Esta sentencia deja ejecutando un contenedor con nuestro nuevo proyecto del millón de dólares ejecutándose en local. Esta misma configuración podrá servirte para desplegar la aplicaciónen un entorno abierto en Internet, utilizando la plataforma de orquestación de contenedores Kubernetes de Google, Amazon o Microsoft.

> **ACTIVIDAD 1:** *Containeriza* una de las aplicaciones de Springboot que hayas hecho en Desarrollo Web en Entorno servidor. Si no tienes ninguna, puedes descargar el ejemplo añadido.

> **ACTIVIDAD 2:** Despliega la aplicación de Springboot de entorno servidor (tuya o de un compañero) en internet usando Render o Koyeb.

-----

***Esta parte ya no pertence al tutorial***

## Colaboración de NGINX y SPRINGBOOT

Una vez tenemos nuestra aplicación Spring Boot contenedorizada y funcionando correctamente, un paso muy habitual en despliegues profesionales es colocar un **servidor Nginx delante de la aplicación**.

Nginx actuará como **proxy inverso**, recibiendo todas las peticiones HTTP externas y redirigiéndolas al contenedor donde se ejecuta Spring Boot. Esto nos permite servir contenido estático de manera más eficiente (imágenes, CSS, JS), proteger la aplicación interna, añadir caché o compresión y facilitar la migración futura a HTTPS.

Para que Nginx conozca a qué servidor debe reenviar las peticiones necesitamos preparar un fichero de configuración `nginx.conf`:

```
events {}

http {
    upstream spring_api {
        server appspring:8080;  # nombre del contenedor de Spring Boot
    }

    server {
        listen 80;

        location / {
            proxy_pass http://spring_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

Este archivo indica que todas las peticiones entrantes se redirijan al contenedor llamado `appspring`, en su puerto interno 8080. Usamos nginx como **proxy**, es decir, **intermediario entre el cliente y el servidor de aplicaciones**. Es un proxy inverso porque se haya en el lado de los servidores (y no en el del cliente, como los proxy convencionales).

* La directiva `upstream` declara un grupo de servidores backend al que nginx puede hacer proxy. Aquí el grupo se llama `spring_api`.
* La directiva `server appspring:8080` es un nombre resoluble por el DNS interno de la plataforma del despliegue. De esta forma, NGINX enviará peticiones a `http://appspring:8080`. Cambia el nombre o el puerto según necesites. Se pueden añadir más de uno, si es necesario, y nginx irá probándolos uno a uno siguiendo un algoritmo de round robin.
* La directiva `proxy_pass` sirve para que nginx reemplace la parte coincidente del location (en este caso `/`) por la URI definida en el proxy.
* La directiva `proxy_set_header` sirve para cambiar partes de la cabecera del host. Puedes consultar información detallada en la [documentación oficial](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header), pero en este caso concreto esto es lo que se utiliza:
    * La directiva `proxy_set_header Host` pasa al backend la cabecera Host con el valor solicitado por el cliente, almacenado en la variable $host.
    * La directiva `proxy_set_header X-REAL-IP` pone la IP del cliente real, la que llega a NGINX, para que el backend sepa quién llamó. En este caso, el backend verá la IP del contenedor NGINX.
    * La directiva `proxy_set_header X-Forwarded-For` añade la IP del cliente.

El siguiente paso es crear una imagen propia de Nginx que use nuestro archivo `nginx.conf`:

```dockerfile
FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
```

Y construir la imagen como ya sabemos:

```bash
docker build -t nginxspring:latest .
```

Para que Nginx pueda comunicarse con Spring Boot, ambos contenedores deben estar en la misma red. Para ello, creamos una red compartida.

```bash
docker network create springnet
```

Finalmente, ejecutamos ambos contenedores dentro de la red que acabamos de crear.

```bash
docker run --name appspring --network springnet -p 8080:8080 --env SPRING_PROFILES_ACTIVE=docker appspring:latest
```

```bash
docker run --name nginxproxy --network springnet -p 80:80 nginxspring:latest
```

De esta forma, Nginx escucha en el puerto **80** y le pasa las peticiones al contenedor `appspring` en el puerto 8080. Al acceder a **[http://localhost](http://localhost)** estarás viendo tu app Spring Boot, pero servida por medio de Nginx.

> **ACTIVIDAD 3:** Añade un contenedor NGINX para que trabaje en colaboración con tu aplicación *containerizada* en la actividad 1.


## Colaboración de NGINX y SPRINGBOOT a través de Docker Compose

Podemos concentrar todo el proceso anterior en un único archivo `docker-compose.yml`:

```yaml
services:
  appspring:
    image: appspring:latest
    container_name: appspring
    environment:
      SPRING_PROFILES_ACTIVE: "docker"
    expose:
      - "8080"

  nginxproxy:
    image: mynginx:latest
    container_name: nginxproxy
    ports:
      - "80:80"
    depends_on:
      - appspring
```

> **ACTIVIDAD 4:** Crea el docker-compose.yml que refleje lo conseguido en la actividad 3.

> **ACTIVIDAD 5:** En lugar de usar directamente el nombre de los contenedores, crea un docker compose que parta de los archivos que tengas en local. Distribúyelos de la siguiente manera:
>```
>-----proyecto/
>     |--springapp/
>        |---my-fat.jar
>        |---Dockerfile
>     |--nginxspring/
>        |---nginx.conf
>        |---Dockerfile
>     |--docker-compose.yml
>```



