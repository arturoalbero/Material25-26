# Introducción a Docker (VOLUMES) y uso de NGIX y Tomcat a través de Docker

## 1. Introducción a Docker (Parte 3)

En este apartado vamos a concluir el tutorial de inicio a Docker tratando el tema de los volúmenes y después configurando Docker para lanzar un servidor NGINX.

### 1.1 Volúmenes

Los volúmenes en Docker son un mecanismo para persistir datos fuera del sistema de archivos de un contenedor. Esto es especialmente útil para bases de datos, archivos de configuración o cualquier dato que deba sobrevivir a la eliminación o reinicio de un contenedor. Los volúmenes permiten compartir datos entre el host y los contenedores, o entre múltiples contenedores.

### 1.2 Tipos de volúmenes

1. **Volúmenes con nombre**:
Son gestionados por Docker y se almacenan en un directorio específico del host (generalmente en `/var/lib/docker/volumes` en Linux).

2. **Bind mounts**:
Permiten mapear un directorio o archivo específico del host a un directorio o archivo dentro del contenedor.

3. **Tmpfs mounts**:
Almacenan datos en la memoria RAM del host. Estos ignifica que son temporales y se eliminan cuando el contenedor se detiene.

### 1.3 Creación y uso de volúmenes

#### 1.3.1 Crear un volumen con nombre

Para crear un volumen con nombre, usa el siguiente comando:

```bash
docker volume create mi_volumen
```

Esto crea un volumen llamado `mi_volumen`, disponible para usar en los contenedores.

#### 1.3.2 Usar un volumen en un contenedor

Para usar un volumen en un contenedor se utiliza el argumento `-v` o `--mount` en el comando `docker run`. Por ejemplo:

```bash
docker run -d --name mi_contenedor -v mi_volumen:/ruta/en/contenedor nginx
```

En este caso:
- `mi_volumen` es el nombre del volumen.
- `/ruta/en/contenedor` es la ruta dentro del contenedor donde se montará el volumen.

#### 1.3.3 Usar bind mounts

El bind mount permite mapear un directorio de nuestro ordenador a un volumen de Docker. De esta manera, podemos hacer cambios sin necesidad de crear y borrar el contenedor. Para mapear un directorio del host a un contenedor, usa:

```bash
docker run -d --name mi_contenedor -v /ruta/en/host:/ruta/en/contenedor nginx
```
Aquí:
- `/ruta/en/host` es la ruta absoluta en el host.
- `/ruta/en/contenedor` es la ruta dentro del contenedor.

> **Actividad 1:** Crea un contenedor nginx y cópiale tu página web estática en su carpeta \html\ usando bind mount. Para ello deberás usar un comando similar al siguiente:
> ```bash
> Docker run -d -v ./tu/ruta/relativa/:/usr/share/nginx/html -p8080:80 nginx
> ```
> Lánzalo y entra en localhost:8080. Una vez lanzado, prueba a cambiar el contenido HTML que hayas *bindeado*. Debería reflejarse sin necesidad de detener el contenedor.

> **Actividad 2:** Haz lo mismo, pero a través de docker-compose. Para linkar un volumen en el docker compose haz lo siguiente dentro de la especificación del contenedor:
>```yml
>volumes:
>      - ./html:/usr/share/nginx/html
>```

#### 1.3.3 Gestión de volúmenes a través de Docker CLI

##### Listar volúmenes

Para ver todos los volúmenes creados en tu sistema, usa:
```bash
docker volume ls
```

##### Inspeccionar un volumen

Para obtener detalles sobre un volumen específico, usa:
```bash
docker volume inspect mi_volumen
```
Esto mostrará información como la ubicación del volumen en el host y su configuración.

##### Eliminar un volumen

Para eliminar un volumen que ya no necesitas, usa:
```bash
docker volume rm mi_volumen
```
Si el volumen está en uso por un contenedor, primero debes detener y eliminar el contenedor.

### 1.4 Cierre

Algunas imágenes oficiales ya llevan incluida la creación de volúmenes anónimos (sin nombre) cuando ejecutamos su archivo Dockerfile, y esto es una práctica cada vez más frecuente. Si no estamos seguros, cuando ejecutemos por primera vez el Docker Run podemos comprobar si se ha creado un volumen nuevo (y qué nombre tiene) o bien a través de la línea de comandos o a través de la aplicación Docker Desktop.

Muchas de las acciones que hemos visto en este tutorial se pueden realizar desde la interfaz gráfica *Docker Desktop*, pero conviene saber cómo funcionan. La interfaz gráfica es especialmente útil para lanzar y detener contenedores ya creados, así como para borrarlos. 

Por su parte, un volumen no se puede borrar si está asociado a un contenedor. Por lo tanto, para borrar un volumen hay que desvincularlo de su contenedor asociado (o borrar primero el contenedor) y después borrar el volumen.

### 1.5 Información extra de Docker

Hasta ahora, hemos visto cómo manejar Docker de forma sencilla, pero completa. Sin embargo, solamente hemos cubierto la punta del iceberg. No te olvides de consultar en la [documentación oficial](https://docs.docker.com/) cuando necesites saber alguna cosa concreta.

> **Actividad 3:**
> Busca **en la documentación oficial** cómo hacer las siguientes cosas (parámetros que admiten, etc.) y para qué sirven:
> * docker system prune
> * docker container commit
> * docker info

## 2. Introducción a la imagen NGINX de Docker Hub

Ahora que ya sabemos usar Docker, vamos a explorar cómo aplicarlo al despliegue de un servidor web como es NGINX. Para ello, vamos a revisar la [**documentación oficial de la imagen de NGINX en DockerHub**](https://hub.docker.com/_/nginx). 

> **TRADUCCIÓN**
>
>**Cómo usar esta imagen**
>
>**Alojando contenido estático simple**
>
>```bash
>$ docker run --name some-nginx -v /some/content:/usr/share/nginx/html:ro -d nginx
>```
>
>Como alternativa, se puede usar un Dockerfile sencillo para generar una nueva imagen que incluya el contenido necesario (lo cual es una solución mucho más limpia que el montaje por enlace anterior):
>
>```dockerfile
>FROM nginx
>COPY static-html-directory /usr/share/nginx/html
>```
>
>Coloca este archivo en el mismo directorio que tu carpeta de contenido (`static-html-directory`), luego ejecuta estos comandos para construir e iniciar tu contenedor:
>
>```bash
>$ docker build -t some-content-nginx .
>$ docker run --name some-nginx -d some-content-nginx
>```
>
> **NOTA:** *El resultado no es exactamente el mismo...*
>
>**Exponer un puerto externo**
>
>```bash
>$ docker run --name some-nginx -d -p 8080:80 some-content-nginx
>```
>
>Después de eso, puedes acceder a tu sitio en el navegador en:
>[http://localhost:8080](http://localhost:8080) o [http://host-ip:8080](http://host-ip:8080).

>**ACTIVIDAD 4:** Antes de continuar con el siguiente apartado, vamos a experimentar las siguientes cosas:
> * Si no mapeamos los puertos, ¿podemos acceder al contenido estático de alguna forma?
> * ¿Qué pasa si mapeamos al puerto 80?
> * ¿Qué diferencia hay entre *bindear* un volumen y copiar datos a través del Dockerfile?
> * En la documentación  

---

Resumen de lo que debes entregar:

* Una memoria donde documentes el uso de los volúmenes, especialmente para *bindear* un volumen a la carpeta html de nginx. En la memoria, explica las ventajas de trabajar así.
* Debe incluir las respuestas a todas las preguntas de las actividades.




