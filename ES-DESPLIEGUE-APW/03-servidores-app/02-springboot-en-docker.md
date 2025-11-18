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
FROM openjdk:8-alpine
ADD target/my-fat.jar /usr/share/app.jar
ENTRYPOINT ["/usr/bin/java", "-jar", "/usr/share/app.jar"]
```

La primera línea indica que queremos usar la versión JDK-8 sobre un sistema mínimo como Alpine Linux para **asegurarnos de que el tamaño del archivo generado es lo más pequeño posible**. La segunda línea añade nuestra aplicación al empaquetado resultante, y por último se indica el comando de arranque que debe utilizar el contenedor una vez inicializado.

Habiendo escrito el fichero de aprovisionamiento es hora de realizar la construcción de la imagen:

```bash
docker build -t my_docker_hub_username/my_image_name:my_image_version .
```

>**NOTA:** También puede ser `docker build -t miapp-embebida:1 .` o cualquier nombre que quieras.

Importante el punto (.) al final, este indica el directorio actual, en donde está el fichero Dockerfile. El argumento -t user/image:tag permite nombrar la imagen. Esta puede ser distribuida públicamente mediante Docker Hub, o de forma privada a través de algún Registry como Harbor privado como los disponibles en Amazon Web Services o Google Compute Engine.

El comando de construcción generará una salida similar a la siguiente:

```bash
Sending build context to Docker daemon  86.11MB
Step 1/4 : FROM openjdk:8-alpine
8-alpine: Pulling from library/openjdk
e7c96db7181b: Pull complete
f910a506b6cb: Pull complete
c2274a1a0e27: Pull complete
Digest: sha256:94792824df2df33402f201713f932b58cb9de94a0cd524164a0f2283343547b3
Status: Downloaded newer image for openjdk:8-alpine
---> a3562aa0b991
fetch https://dl-cdn.alpinelinux.org/alpine/v3.9/main/x86_64/APKINDEX.tar.gz
fetch https://dl-cdn.alpinelinux.org/alpine/v3.9/community/x86_64/APKINDEX.tar.gz
Executing busybox-1.29.3-r10.trigger
OK: 123 MiB in 62 packages
Removing intermediate container 8c14d7443332
---> 0c3f73a47bff
Step 3/4 : ENTRYPOINT \["/usr/bin/java", "-jar", "/usr/share/app.jar"\]
---> Running in 0392060d1087
Removing intermediate container 0392060d1087
---> 23655b67c59f
Step 4/4 : ADD target/my-fat.jar /usr/share/app.jar
---> df132592b5f8
Successfully built df132592b5f8
```
La nueva imagen está disponible localmente y puede confirmarse con docker images

### Arrancar contenedor con Spring Boot

Ya tenemos todo lo necesario para arrancar nuestro contenedor que ejecute la imagen construida en el paso anterior. Es importante saber que con cada nueva versión de la aplicación deberemos construir de nuevo la imagen, ya que por norma general los contenedores deben ser autosuficientes. Todo lo que necesiten deberá constar o estar aprovisionado en la imagen para asegurar que el entorno es estable y reproducible aun usando los contenedores, entidades altamente volátiles.

Aunque las imágenes son estáticas, en el momento de arrancar un contenedor podemos hacerle llegar parámetros en forma de variables de entorno o propiedades del sistema Java, usando -Dargument=value. Muy útil para indicar el profile de Spring que queremos que se active en el contenedor, por ejemplo para que use una u otra conexión con base de datos.

Aunque hay muchas formas, en nuestro caso usaremos una variable de entorno para indicar el perfil activo en la aplicación. Esto debe hacerse indicando el nombre de perfil a usar en la variable de entorno `SPRING_PROFILES_ACTIVE` tal y como indica la documentación oficial de Spring Boot.

También se debe indicar qué puerto del contenedor debe estar abierto, para que las peticiones http lleguen al proyecto. Por tanto, se debe añadir un argumento que configure que el tráfico que llegue en un puerto local, se redirija al puerto 8080 (por defecto de Spring) del contenedor.

Dicho esto, ya sólo queda lanzar un contenedor usando la imagen anterior e indicando el perfil a activar:

```bash
docker run -p 8080:8080 --env SPRING_PROFILES_ACTIVE=docker \
my_docker_hub_username/my_image_name:my_image_version
```

¡Y listos! Esta sentencia deja ejecutando un contenedor con nuestro nuevo proyecto del millón de dólares ejecutándose en local. Esta misma configuración podrá servirte para desplegar la aplicaciónen un entorno abierto en Internet, utilizando la plataforma de orquestación de contenedores Kubernetes de Google, Amazon o Microsoft.

> **ACTIVIDAD:** *Containeriza* una de las aplicaciones de Springboot que hayas hecho en Desarrollo Web en Entorno servidor. Si no tienes ninguna, puedes descargar el ejemplo añadido.

> **ACTIVIDAD:** Despliega la aplicación de Springboot de entorno servidor (tuya o de un compañero) en internet usando Render o Koyeb.