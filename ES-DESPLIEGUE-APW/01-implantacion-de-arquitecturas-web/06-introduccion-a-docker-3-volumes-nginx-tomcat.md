# Introducción a Docker (VOLUMES) y uso de NGIX y Tomcat a través de Docker

## 4. Introducción a Docker (Parte 3)

### 4.1 Volúmenes

Los volúmenes en Docker son un mecanismo para persistir datos fuera del sistema de archivos de un contenedor. Esto es especialmente útil para bases de datos, archivos de configuración o cualquier dato que deba sobrevivir a la eliminación o reinicio de un contenedor. Los volúmenes permiten compartir datos entre el host y los contenedores, o entre múltiples contenedores.

### 4.2 Tipos de volúmenes

1. **Volúmenes con nombre**:
Son gestionados por Docker y se almacenan en un directorio específico del host (generalmente en `/var/lib/docker/volumes` en Linux).

2. **Bind mounts**:
Permiten mapear un directorio o archivo específico del host a un directorio o archivo dentro del contenedor.

3. **Tmpfs mounts**:
Almacenan datos en la memoria RAM del host. Estos ignifica que son temporales y se eliminan cuando el contenedor se detiene.

### 4.3 Creación y uso de volúmenes

#### 4.3.1 Crear un volumen con nombre

Para crear un volumen con nombre, usa el siguiente comando:

```bash
docker volume create mi_volumen
```

Esto crea un volumen llamado `mi_volumen`, disponible para usar en los contenedores.

#### 4.3.2 Usar un volumen en un contenedor

Para usar un volumen en un contenedor se utiliza el argumento `-v` o `--mount` en el comando `docker run`. Por ejemplo:

```bash
docker run -d --name mi_contenedor -v mi_volumen:/ruta/en/contenedor nginx
```

En este caso:
- `mi_volumen` es el nombre del volumen.
- `/ruta/en/contenedor` es la ruta dentro del contenedor donde se montará el volumen.

#### 4.3.3 Usar bind mounts

El bind mount permite mapear un directorio de nuestro ordenador a un volumen de Docker. De esta manera, podemos hacer cambios sin necesidad de crear y borrar el contenedor. Para mapear un directorio del host a un contenedor, usa:

```bash
docker run -d --name mi_contenedor -v /ruta/en/host:/ruta/en/contenedor nginx
```
Aquí:
- `/ruta/en/host` es la ruta absoluta en el host.
- `/ruta/en/contenedor` es la ruta dentro del contenedor.

> **Actividad:** Crea un contenedor nginx y cópiale tu página web estática en su carpeta \html\ usando bind mount.

#### 3.3.3 Gestión de volúmenes a través de Docker CLI

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

### 3.5 Cierre

Algunas imágenes oficiales ya llevan incluida la creación de volúmenes anónimos (sin nombre) cuando ejecutamos su archivo Dockerfile, y esto es una práctica cada vez más frecuente. Si no estamos seguros, cuando ejecutemos por primera vez el Docker Run podemos comprobar si se ha creado un volumen nuevo (y qué nombre tiene) o bien a través de la línea de comandos o a través de la aplicación Docker Desktop.

Muchas de las acciones que hemos visto en este tutorial se pueden realizar desde la interfaz gráfica *Docker Desktop*, pero conviene saber cómo funcionan. La interfaz gráfica es especialmente útil para lanzar y detener contenedores ya creados, así como para borrarlos. 

Por su parte, un volumen no se puede borrar si está asociado a un contenedor. Por lo tanto, para borrar un volumen hay que desvincularlo de su contenedor asociado (o borrar primero el contenedor) y después borrar el volumen.

> **Actividad**
> Crea y documente el proceso de creación de un contenedor Docker con una base de datos MySQL. Usa docker-compose.
>
> Lanza el contenedor y crea una conexión a tu servidor corriendo en Docker desde DBeaver u otro editor SQL (como la extensión de VS CODE). [Puedes descargar DBeaver aquí](https://dbeaver.io/).
## Recursos

* [Información de cómo desplegar un servidor nginx usando Docker. *Dockerhub*](https://hub.docker.com/_/nginx)

* [Información de cómo desplegar un servidor tomcar usando Docker. Algo más escueto, deberás completar con la información de NGINX *Dockerhub*](https://hub.docker.com/_/tomcat)
* * [Tutorial para desplegar una webapp en Tomcat usando Docker](https://www.cprime.com/resources/blog/deploying-your-first-web-app-to-tomcat-on-docker/)

## Actividad 

Realiza la actividad ***Instalación básica de NGINX y TOMCAT portables en Windows***, pero esta vez empleando Docker para *hostear* los servidores.