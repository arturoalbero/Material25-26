# Introducción a Docker (parte 1) - Introducción a la virtualización

> **Criterios de evaluación:** 1e, 1f, 1i

## 1. Virtualización

La virtualización es una tecnología que permite crear representaciones digitales de servidores, almacenamiento, redes y otros recursos físicos.

El software especializado (hipervisor) imita las funciones del hardware físico para que varias **máquinas virtuales** (VMs) puedan ejecutarse en paralelo dentro de un mismo servidor físico.

```mermaid
graph TD
  A[Servidor físico] -->|Hipervisor| B[VM 1 - Windows]
  A -->|Hipervisor| C[VM 2 - Linux]
  A -->|Hipervisor| D[VM 3 - iOS]
```

Los servidores físicos consumen electricidad, ocupan espacio, requieren refrigeración y mantenimiento. Además, suelen infrautilizarse: gran parte de su capacidad queda ociosa.

La virtualización soluciona esto permitiendo que un mismo servidor físico ejecute múltiples entornos independientes, lo que mejora la eficiencia y reduce costes.

### 1.1 Máquinas virtuales y el papel del hipervisor

Una **máquina virtual** es un sistema definido por software, independiente del resto, pero alojado dentro de un servidor físico. El equipo físico se llama **host**, y las máquinas virtuales se conocen como **invitados**.

El **hipervisor** es la capa que hace posible este aislamiento y reparto de recursos.
Existen dos grandes tipos:

* **Hipervisor tipo 1 (bare metal)**: corre directamente sobre el hardware. Alta eficiencia y usado en entornos empresariales.
>[**KVM en Linux**](https://es.wikipedia.org/wiki/Kernel-based_Virtual_Machine).
* **Hipervisor tipo 2 (hosted)**: se instala sobre un sistema operativo existente. Es más sencillo y práctico para usuarios individuales o pruebas.
> [**VMware Workstation**](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion).


### 1.2 Tipos de virtualización

La virtualización puede responder a diversos tipos según las necesidades del sistema:

* **Virtualización de servidores**: divide un servidor físico en varios virtuales.
> [Microsoft Hyper-V](https://learn.microsoft.com/es-es/windows-server/virtualization/hyper-v/overview)
* **Virtualización de almacenamiento**: combina recursos de diferentes dispositivos y los gestiona como una unidad virtual.
> [IBM Spectrum Virtualize](https://www.ibm.com/es-es/products/spectrum-virtualize-for-public-cloud)
* **Virtualización de redes**: centraliza switches, routers y firewalls en un plano virtual (ej. SDN, NFV).
> [Cisco ACI](https://www.cisco.com/site/uk/en/products/networking/cloud-networking/application-centric-infrastructure/index.html)
* **Virtualización de datos**: crea una capa que abstrae el origen y formato de los datos para integrarlos de manera flexible.
> [Denodo Platform](https://www.denodo.com/es/denodo-platform)
* **Virtualización de aplicaciones**: permite que software diseñado para un sistema operativo se ejecute en otro.
> [Citrix Virtual Apps](https://docs.citrix.com/es-es/citrix-virtual-apps-desktops/technical-overview.html)
* **Virtualización de escritorios**: ofrece escritorios virtuales accesibles desde dispositivos remotos, útiles para empresas con gran diversidad de usuarios.
> [Azure Virtual Desktop](https://learn.microsoft.com/en-us/azure/virtual-desktop/overview)


### 1.3 Virtualización y computación en la nube

La computación en la nube consiste en suministrar recursos bajo demanda a través de Internet, con pago por uso.

La nube se apoya en la virtualización, pero da un paso más: el usuario no administra directamente el hardware subyacente, sino que accede a recursos gestionados por el proveedor.


### 1.4 Virtualización y contenedores

Los contenedores son otra forma de aislar y ejecutar aplicaciones, pero con un enfoque más ligero.

Mientras que las máquinas virtuales requieren un sistema operativo completo por cada instancia, los contenedores comparten el **kernel** del host y solo incluyen lo estrictamente necesario para la aplicación (código, librerías, dependencias).

* Una **máquina virtual** es como un **apartamento en un bloque**. Cada piso tiene paredes, instalaciones propias y aislamiento total.
* Un **contenedor** es como una **habitación dentro de una casa compartida**. Cada habitación tiene lo necesario para vivir, pero comparte instalaciones básicas como agua, electricidad y cimientos.

Esto explica por qué los contenedores consumen menos recursos y se inician más rápido que las VMs.

### 1.5 Docker

[Docker](https://www.docker.com/) es la plataforma más extendida para crear y gestionar contenedores.

Permite empaquetar aplicaciones con todas sus dependencias, garantizando portabilidad y consistencia entre entornos de desarrollo, pruebas y producción.


### 1.6 Kubernetes

[Kubernetes](https://kubernetes.io/) es un sistema de **orquestación de contenedores**.
Gestiona automáticamente el despliegue, la escalabilidad y la disponibilidad de aplicaciones distribuidas en múltiples nodos.

Características destacadas:

* Automatiza el escalado según la demanda.
* Tolera fallos redistribuyendo cargas cuando un nodo falla.
* Facilita actualizaciones continuas sin interrumpir el servicio.

```mermaid
graph TD
  A[Cluster Kubernetes] --> B[Nodo 1]
  A --> C[Nodo 2]
  B --> D[Pod con 2 contenedores]
  C --> E[Pod con 3 contenedores]
```

Un **Pod** es la unidad mínima de ejecución en Kubernetes, y puede contener uno o varios contenedores que comparten red y almacenamiento.

#### 1.6.1 Orquestación de contenedores

La **orquestación de contenedores** es el proceso de **automatizar la gestión del ciclo de vida de los contenedores** cuando se ejecutan en producción o en entornos distribuidos.

Incluye tareas como:

* **Despliegue**: lanzar contenedores en los servidores o nodos adecuados.
* **Escalado**: aumentar o reducir automáticamente el número de contenedores según la carga de trabajo.
* **Balanceo de carga**: distribuir el tráfico de red entre contenedores para evitar sobrecargas.
* **Monitorización y salud**: reiniciar contenedores fallidos y mantener la aplicación disponible.
* **Actualizaciones continuas (rolling updates)**: aplicar nuevas versiones sin interrumpir el servicio.


> Imagina que una aplicación web está compuesta por varios microservicios en contenedores (autenticación, base de datos, frontend, API). Si el tráfico aumenta, la orquestación añade automáticamente más contenedores de frontend para atender a los usuarios y, si uno falla, lo reemplaza en segundos sin intervención manual.

**Herramientas más usadas para orquestación:**

* **Kubernetes** (el estándar de facto).
* **Docker Swarm** (integrado en Docker, más sencillo).
* **Apache Mesos** (más flexible, usado en entornos grandes).

---

## 2. Introducción a Docker (Parte I)

Este apartado es un **tutorial** para aprender a dominar Docker en su totalidad. Este documento trabaja tomando como referencia el siguiente vídeo de youtube:

[Este es el vídeo que vamos a tomar como referencia](https://www.youtube.com/watch?v=4Dko5W96WHg)

> **Actividad**
> Realiza una memoria de todo el proceso, hasta configurar tu servidor MySQL en Docker.
>
> Para ello, es recomendable que crees una carpeta donde adjuntes los archivos que utilizarás.
>
> De la memoria se evalúa tanto el contenido como la capacidad para comunicar el contenido de forma organizada, por lo tanto:
> - **No descuides la presentación**. Una portada y un índice adecuados ayudan a organizar el contenido.
> - **Incluye capturas con explicaciones del proceso**. No seas ni excesivamente parco en palabras ni tampoco demasiado extenso.
> - **Cuida el texto** de las explicaciones, ya que es donde demuestras que sabes lo que estás haciendo. En estos casos, es más importante saber qué estás haciendo que el hecho de haberlo hecho.
> - **Documenta no solo los éxitos, sino también las dificultades** y las posibles fuentes externas que hayas consultado para realizar alguna actividad. No consultes fuentes externas a no ser que sea estrictamente necesario.
> - **Incluye la carpeta con los archivos trabajados**. Esta carpeta es el proyecto en sí, donde se demuestra que has hecho lo que has expuesto en la memoria. Puedes duplicar la carpeta por cada fase, si necesitaras hacer varias versiones (por ejemplo, cuando conectes dos contenedores de Docker).

### 2.1 Contenedor

Los contenedores son una forma de empaquetar una aplicación y todas sus dependencias.

De esta forma, se consigue una mayor portabilidad y se mejora la posibilidad de compartir la aplicación en diferentes equipos, facilitando el desarrollo y despliegue de aplicaciones.

Los contenedores de Docker se almacenan en repositorios, ya sean privados o públicos, como dockerhub, que es el repositorio oficial.

Para unificar las herramientas de desarrollo de un equipo, un contenedor almacena todas las dependecias necesarias. Se construyen sobre una imagen de Linux. De esta forma, se evitan errores relacionados con compatibilidad y dependencias, al tenerlas almacenadas en imágenes. Por lo tanto, **los contenedores son un tipo de virtualización**. 

Para entender la diferencia entre una máquina virtual y un contenedor, debemos saber que **un ordenador se divide en diferentes capas**: la capa de hardware, el kernel y la capa de aplicaciones. Con una máquina virtual, se virtualizan tanto el kernel como la capa de aplicaciones. El contenedor, por su parte, solo virtualiza la capa de aplicaciones, empleando el kernel del sistema operativo anfitrión (Linux o Mac OSX) o, en el caso de windows, WSL2 (Windows Subsystem for Linux).

```mermaid
flowchart TD
subgraph Ordenador
    HARDWARE
    KERNEL
    APP[CAPA DE APLICACIONES]
end
HARDWARE ==> KERNEL
KERNEL ==> APP
CONTENEDOR -.VIRTUALIZA.->APP
MV[MÁQUINA VIRTUAL]-.VIRTUALIZA.->KERNEL
MV-.VIRTUALIZA.->APP

```

Al virtualizar solamente la capa de aplicaciones, los contenedores son más rápidos y ocupan menos que las máquinas virtuales, por lo que son más apropiados para el desarrollo.

> **IMPORTANTE**: Docker está separado en dos aplicaciones distintas, por un lado el proceso `Docker Engine` que es el que hace toda la *magia* y, por otro, la interfaz gráfica `Docker Desktop`, que se comunica con `Docker Engine` para permitirnos hacer casi todas las acciones con una interfaz gráfica. 
>
>Aun así, para crear un contenedor es más cómodo usar solo `Docker Engine` a través de la interfaz CLI. En Linux, `Docker Engine` funciona a través de KVM -hypervisor de tipo I-.

#### 2.2 Instalar Docker
Para instalar Docker debes ir a su [página web](https://www.docker.com/products/docker-desktop/) y descargar Docker Desktop. Docker Desktop incluye Docker y herramientas como Docker-compose y CLI (la interfaz línea de comandos). También incluye el WSL2.

### 2.3 Manejo de imágenes

Para manejar Docker, emplearemos la línea de comandos. Para que funcione, debemos tener ejecutándose Docker Desktop, programa que habilita el uso de CLI. Docker dispone en sus versiones más nuevas de un terminal integrado:

![alt text](./imgs/docker-01.png)

**Una imagen de Docker es una plantilla de solo lectura que contiene todo lo necesario para ejecutar una aplicación**, incluyendo el código, las bibliotecas, las dependencias y el entorno de ejecución.

Se compone de múltiples capas que permiten un almacenamiento eficiente y la reutilización de componentes.

Estas imágenes se crean a partir de un Dockerfile, un archivo de texto que contiene las instrucciones para construir la imagen. Para las imágenes oficiales no necesitamos el archivo, pero sí si queremos construir imágenes personalizadas.

> **IMPORTANTE**: El archivo Dockerfile se llama así, `Dockerfile`. No es una raíz o un tipo de archivos, sino un archivo concreto.

Una imagen actúa como una instantánea o esquema que se utiliza para crear instancias de contenedores, que son las versiones ejecutables de dichas imágenes.

```bash
$ docker images
```

Este comando muestra todas las imágenes descargadas. Nos muestra los siguientes campos:

- **Repository**: Nombre de la imagen.
- **Tag**: Etiqueta de la imagen.
- **Image Id**: Identificador de la imagen.
- **Created**: Información sobre cuándo fue creada la imagen. 
- **Size**: Tamaño de ocupa la imagen.

```bash
$ docker pull node
$ docker pull node:lts-alpine3.19
```

En el primer caso, descarga la imagen de `node` etiquetada como `latest`. En el segundo caso, descarga la imagen de `node` etiquetada como `lts-alpine3.19`. En ambos casos, descargará el contenido del repositorio en caso de que no haya sido descargado previamente. 

El contenido de las imágenes está dividido en módulos para hacer más eficiente la descarga de imágenes, ya que diferentes imágenes pueden compartir algunos módulos, o la misma imagen podría estar etiquetada de diferentes formas (cosa que suele ocurrir con aquella etiquetada con `latest`).

En ocasiones, es necesario especificar la plataforma (especialmente si no se corresponde con la nuestra). Por ejemplo, si estamos usando un Macbook Air con el procesador M1 y queremos descargar una imagen de `mysql` debemos emplear el siguiente comando:

```bash
$ docker pull --platform linux/x86_64 mysql
```

Para borrar una imagen que hayamos descargado, empleamos el siguiente comando:

```bash
$ docker image rm node:lts-alpine3.19
```

También podemos borrarlas desde el editor gráfico `Docker Desktop`.

En este caso, borraremos la imagen de `node` etiquetada con `18` que habíamos descargado antes.

> **Actividad**: Descarga las dos imágenes de node, comprueba que se han descargado bien y borra los archivos con rm.

### 2.4 Manejo de contenedores

Los contenedores son el elemento principal de Docker y se crean empleando una imagen como base.

```bash
$ docker pull mongo
$ docker create mongo
```

En este caso, primero descargamos la imagen de mongo con el comando `pull` y, después, creamos un contenedor con el comando `create`. Este comando nos devuelve un id, que debemos copiar y añadir al siguiente comando:

```bash
$ docker start [id]
```

En este caso, sustituimos `[id]` por la id que habíamos copiado y ejecuta el contenedor, devolviéndonos la propia id de nuevo. Si ejecutamos el siguiente comando:

```bash
$ docker ps
```

Veremos todos los contenedores en ejecución. Si añadimos el argumento `-a` veremos todos los contenedores en la máquina, tanto en ejecución como no.

Este comando nos devuelve una tabla similar a la que obteníamos con `$ docker images`, que nos revela la siguiente información:

- **Container ID**: La id, en formato reducido, del contenedor.
- **Image Command**: La imagen base del contenedor.
- **Created**: La fecha de creación del contenedor.
- **Status**: El estado (activo o inactivo) del contenedor.
- **Ports**: Los puertos que usa el contenedor.
- **Name**: El nombre del contenedor. Docker asigna nombres aleatorios al contenedor, pero podemos asignarlo nosotros de forma manual con el siguiente comando:

```bash
$ docker create --name mimongo mongo
```

En este caso, creará una imagen basada en mongo y llamada `mimongo`. Para ejecutarla, podemos usar `$ docker start` y añadir al final el nombre o la id del contenedor.

```bash
$ docker stop mimongo
$ docker rm mimongo
```

El primer comando sirve para detener la ejecución del contenedor llamado `mimongo`. En lugar del nombre, también se puede usar la id. El segundo comando sirve para borrar el contenedor `mimongo` y, de la misma forma que antes, el nombre se puede sustituir por la id.

Es recomendable usar nombres personalizados, ya que facilita el uso de los contenedores.

> **Actividad**: Realiza todos los pasos hasta aquí. Crea un contenedor, lánzalo con su id, comprueba que funciona, páralo y bórralo. Luego haz lo mismo pero con un contenedor con un nombre personalizado.

### 2.5 Port Mapping

En telemática y redes informáticas, los puertos son como ventanas virtuales que permiten que una computadora se conecte con varias otras al mismo tiempo. Cada ventana está numerada del **0 al 65535** y sirve para dirigir la información entrante al programa correcto que está esperándola.

El puerto que aparecía cuando ejecutábamos el comando `$ docker ps` y teníamos un contenedor corriendo era un puerto interno del contenedor, pero cerrado y no accesible desde nuestro equipo. Para poder acceder a un puerto de un contenedor, debemos mapearlo a uno de nuestro equipo.

```bash
$ docker create -p27017:27017 mongo
```

Con este comando, mapeamos el puerto 27017 del contenedor a nuestro puerto 27017. Es una práctica común mapear los puertos internos del contenedor al mismo número en nuestro equipo y, en caso de no poderse, a un número similar.

En la instrucción `-p27017:27017`, **el primer puerto es el de nuestra máquina y el segundo el del contenedor.** El nombre extendido del puerto de nuestra máquina es, en realidad, `0.0.0.0:27017` o `localhost:27017`.

Además del comando anterior, también podemos no especificar un puerto de nuestro equipo y que Docker lo asigne arbitrariamente usando `-p27017`. Sin embargo, es preferible asignar los puertos de manera manual.

De esta forma, podremos acceder al contenedor a través de su puerto. Para ello, abrimos un navegador y nos dirigimos a la dirección de nuestro equipo asociada al contenedor, como por ejemplo http://localhost:27017. Mientras tanto, en el terminal, podemos acceder a los logs internos del contenedor de la siguiente forma:

```bash
$ docker logs mimongo
$ docker logs --follow mimongo
```

En el primer caso, vemos los logs del contenedor `mimongo` en el momento dado en el que ejecutamos el comando. En el segundo caso, el terminal se queda escuchando los logs internos del contenedor `mimongo`.

> **Actividad:** Crea un contenedor `mongo` y conéctate a él con VSCODE. Para ello, descarga la extensión `mongodb for Visual Studio Code` y crea una conexión (en este caso sin usuario ni contraseña).
![alt text](imgs/04-img-01.png)
![alt text](imgs/04-img-02.png)
>
> Usa la opción openform.
>
> También puedes acceder a http://localhost:27017 para comprobar que está corriendo.

### 2.6 Docker Run

**Docker Run es un comando que sirve para crear y ejecutar un contenedor en un solo paso.** Es decir, es una combinación de los comandos `pull`, `create` y `start`. Todos los parámetros anteriores son compatibles.

```bash
$ docker run mongo
```

Descarga la imagen de mongo si no está presente en el sistema, crea el contenedor y lo ejecuta. Muestra los logs del contenedor, por lo que si cerramos el terminal cerraremos el contenedor.

```bash
$ docker run -d mongo
```

El argumento `-d` indica que se va a ejecutar en modo "detached", que significa despegado. Esto quiere decir que vamos a poder seguir introduciendo comandos, ya que no se verán los logs.

```bash
$ docker run --name mimongo -p27017 -d mongo
```

Por último, con este comando estamos creando y ejecutando un contenedor de nombre `mimongo` basado en la imagen `mongo` y, además, estamos mapeando el puerto interno 27017 del contenedor a nuestro puerto 27017.

> El comando `$ docker run` siempre crea un contenedor nuevo cuando se ejecuta. Si queremos ejecutar un contenedor ya creado, debemos usar `$ docker start` y el nombre o la id del contenedor. En estos casos, puedes usar la interfaz gráfica.

### 2.7 Variables de entorno y cómo conectarse a un contenedor

#### 2.7.1 Crear un proyecto en NODE usando npm

Para esta demostración vamos a usar `javascript` sencillo. Sin embargo, debes tener instalado node.js, que incluye el gestor de paquetes npm (node package manager). `npm` es similar a Maven.

Para iniciar un proyecto node, tienes que ir a la carpeta donde quieras crearlo y ejecutar el comando:

```bash
$ npm init
```
Esto creará un proyecto de node. Si no quieres editar ningún parámetro, puedes añadir el argumento -y (para que le diga a todo que sí) y editarlo más adelante en el archivo package.json que habrá creado.

Por defecto, las aplicaciones node creadas de este modo se lanzan a través del archivo index.js creado en el raíz.

Para ejecutarlo, escribe `node index.js`. `npm` permite trabajar con dependencias. Las dependencias las podemos añadir directamente en el package.json o instalarlas por separado. **Se instalan en una carpeta llamada node_modules, que se aconseja incluir siempre en el archivo .gitignore**.

Si las tienes añadidas en el package.json (por ejemplo, si bajas un proyecto de internet), antes de ejecutar nada debes ejecutar el comando `npm install`. Si no, para instalar `mongoose` y `express`, que son las que vamos a usar en este ejemplo, debes realizar los siguientes comandos:
```bash
$ npm install mongoose
$ npm install express
```
Si dejas el archivo package.json abierto en VS CODE mientras ejecutas estas instrucciones, puedes ver cómo se añaden solas las dependencias.

>**Actividad:** Prepara el proyecto javascript, con las dependencias mongoose y express, y añade la carpeta node_modules al archivo .gitignore (si no existe, créalo) si estás usando git (solo tienes que añadir una línea con la ruta relativa -desde el raíz del repositorio-).


#### 2.7.2 Variables de entorno y cómo conectarse a un contenedor desde código

En node.js existe una librería llamada mongoose que nos permite conectarnos a bases de datos mongo. Imagina la siguiente instrucción de javascript:

```javascript
mongoose.connect('mongodb://nombre:password@localhost:27017/miapp?authSource=admin');
```

En esta instrucción, le estamos diciendo al objeto mongoose que se conecte a `mongoddb` usando como nombre `nombre` y como password `password`. La @ sirve para separar esos datos de dónde vamos a conectarnos, en este caso a `localhost:27017` que es nuestro equipo en su puerto 27017. Finalmente, el URI nos indica a qué parte del programa nos conectamos, en esta caso `miapp` es la aplicación y después de `?` se colocan los parámetros de configuración, `authSource=admin`.

Para poder realizar correctamente esta conexión, debemos haber configurado las **variables de entorno** del contenedor. **Cada imagen tiene sus propias variables de entorno, que debemos consultar en el mismo repositorio**. En el caso de la imagen de mongo, solamente necesitamos configurar las siguientes variables de entorno para que funcione todo:

```
MONGO_INITDB_ROOT_USERNAME
MONGO_INITDB_ROOT_PASSWORD
```

Para ello, empleamos el siguiente comando (sin saltos de línea):

```bash
$ docker create -p27017:27017 --name mimongo 
-e MONGO_INITDB_ROOT_USERNAME=nombre 
-e MONGO_INITDB_ROOT_PASSWORD=password 
mongo
```

El argumento `-e`indica que lo que viene a continuación es una variable de entorno. Para inicializarlas, colocamos su nombre, el signo = y el valor que queremos asignarle. Recuerda que las variables de entorno se colocan antes de la imagen. Aunque en el ejemplo estén en diferentes líneas, se trata de un solo comando.

> **Actividad:** Para comprobar que podemos establecer la conexión, lanza el contenedor y crea una nueva conexión en la extensión de VS CODE, esta vez con la contraseña y el password adecuados. En la sección avanzada del formulario puedes añadir los datos de conexión.

### 2.8 Dockerfile, o cómo crear imágenes personalizadas

**Los archivos dockerfile sirven para construir imágenes personalizadas.** Dentro de él se escriben instrucciones para crear imágenes que ejecutarán nuestro código, basadas generalmente en otras imágenes.

```dockerfile
FROM node:lts-alpine3.19
RUN mkdir -p /home/app
COPY . /home/app
EXPOSE 3000
CMD ["node", "/home/app/index.js"]
```
>**IMPORTANTE:** Recuerda que el archivo Dockerfile es un archivo llamado así. No tiene raíz ni se le puede cambiar el nombre.

Suponiendo que `index.js` es un archivo que hemos creado nosotros, el anterior archivo dockerfile hace lo siguiente:
- `FROM node:lts-alpine3.19`: Le indica a Docker cuál es la imagen sobre la que creamos nuestra imagen propia.
- `RUN mkdir -p /home/app`: Crea directorio llamado "app" dentro del directorio "/home". La opción -p le indica al comando mkdir que cree el directorio y cualquier directorio padre que aún no exista.
- `COPY . /home/app`: Copia el contenido de la dirección `.` de nuestro ordenador en la dirección `/home/app` de la imagen. `.` representa el directorio en el que se encuentra el archivo dockerfile.
- `EXPOSE 3000`: Expone el puerto 3000, de forma similar a como si hiciéramos `-p3000:3000` en los comandos vistos en los apartados anteriores. 
- `["node", "/home/app/index.js"]`: Ejecuta dentro de la imagen el comando `node /home/app/index.js`. Esto permite que nuestro código se ejecute en la imagen.

Con estas instrucciones, puedes probar a ejecutar tu propio código javascript en un contenedor de node, en lugar de tener que descargarte una versión de node en tu ordenador. 

Para montar la imagen, empleamos el siguiente comando:

```bash
$ docker build -t miapp:1 .
```

En caso exitoso, debería aparecer algo similar a esto:
![alt text](imgs/04-img-03.png)

El comando `$ docker build` construye la imagen usando el archivo dockerfile como referencia. El argumento `-t` sirve para etiquetar la imagen. En este caso, `miapp` es el nombre que le damos a la imagen y `1` la etiqueta que le asignamos. Finalmente, el '.' sirve para indicarle dónde está el archivo dockerfile, en este caso, indica el directorio actual.

Para probar que esto funciona bien, vamos a usar el siguiente código (archivo index.js):

```javascript
const express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send('hello world');
});
app.listen(3000);
```

En este caso, necesitamos el módulo `express` que instalaremos con la orden `$ npm install express` en el directorio raíz.

> **Actividad**: Prueba a ejecutar este código con node y conectarte a http://localhost:3000 para comprobar que el programa funciona.

Para ejecutar el código a través de la imagen de docker, debemos introducir la siguiente instrucción:

```bash
$ docker run -p3000:3000 miapp:1
```

De esta forma, comunicaremos el puerto expuesto dentro de docker usando `EXPOSE 3000` con el puerto 3000 de nuestra máquina. Al ir al navegador y conectarnos a `http://localhost:3000/` obtendremos como respuesta `hello world`.

> **Actividad**: Prueba a lanzar el contenedor y conectarte a http://localhost:3000 para comprobar que el programa funciona. El resultado debería ser el mismo que antes.


