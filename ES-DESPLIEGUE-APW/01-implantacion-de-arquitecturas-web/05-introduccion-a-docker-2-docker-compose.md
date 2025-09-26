# Introducción a Docker (Parte 2) - Redes internas y Docker Compose

## 3. Introducción a Docker (Parte 2)

> **NOTA:** Una vez arrancado Docker Desktop, puedes usar los comandos de Docker desde cualquier terminal del ordenador, no solamente desde el terminal integrado en Docker (que, de hecho, originalmente no existía). Prueba a lanzar comandos desde cmd, powershell, etc.

### 3.1 Redes internas de docker

Para que un contenedor pueda conectarse a otro contenedor, necesitamos definir una red interna. Docker genera algunas de forma automática, aunque si no usamos `docker-compose` deberemos especificarlas de forma manual. Veremos `docker-compose` más adelante.

```bash
$ docker network ls
```

- Este comando lista todas las redes de docker.

```bash
$ docker network create mired
```

- Este comando crea una red interna de docker con el nombre `mired`.

```bash
$ docker network rm mired
```

- Este comando borra la red interna de docker llamada `mired`.

Para conectarse entre sí, los contenedores de una misma red se comunican a través de su nombre. Para ello, debemos añadir el argumento `--network` a la creación de cada contenedor. Supongamos que tenemos nuestra imagen personalizada `miapp` creada del paso anterior:

```bash
$ docker create -p27017:27017 --name mimongo --network mired
-e MONGO_INITDB_ROOT_USERNAME=nombre 
-e MONGO_INITDB_ROOT_PASSWORD=password 
mongo

$ docker create -p3000:3000 --name app --network mired miapp:1
```

En este caso, al crear los dos contenedores, estamos asignándoles a cada uno la red que hemos creado anteriormente.

A continuación, la línea de javascript para conectarse a mongo desde nuestro contenedor con imagen personalizada:

```javascript
mongoose.connect('mongodb://nombre:password@mimongo:27017/miapp?authSource=admin');
```

Como se puede observar, se sustituye `localhost` (nombre de nuestra máquina) por `mimongo` (nombre del contenedor de MongoDB).

El archivo completo en javascript, `index.js` es como sigue:

```javascript
const express = require('express');
const mongoose = require('mongoose');

var app = express();
mongoose.connect('mongodb://nombre:password@mimongo:27017/miapp?authSource=admin');

const kittySchema = new mongoose.Schema({
    name: String
});
const Kitten = mongoose.model('Kitten', kittySchema);
const silence = new Kitten({ name: 'Silence' });
silence.save();

app.get('/', (req, res) => { 
    Kitten.find().then(result => { 
        res.send(result); 
    }).catch(error=>{
        let data = errorMsg(error); 
        res.send(data); 
    }); 
});
app.listen(3000);
```

Se trata de una aplicación `javascript` que usa los módulos `express` y `mongoose`, este último para conectarse a `mimongo`.

> Usamos `JavaScript` porque **MongoDB** maneja sus datos en documentos BSON, muy similares a objetos JSON, lo que encaja naturalmente con este lenguaje. `Mongoose` es una librería de `JavaScript` que actúa como un ODM (Object Data Modeling), facilitando el acceso a MongoDB y permitiendo definir esquemas, validaciones y consultas de manera más estructurada.

Para usar `mongo`, primero se crea un esquema para la base de datos y después se crea el modelo. A través del modelo se hacen todas las peticiones, desde la creación y guardado con `save()` en la base de datos hasta la consulta con `find()`. En este caso, dicha consulta ocurrirá cuando accedamos a `http://localhost:3000/`. 

Para lanzarlo bien, debemos ejecutar, aparte del los comandos para lanzar el contenedor de mongo, los siguientes cada vez que hagamos un cambio en nuestro archivo `index.js`:

```bash
$ docker stop app
$ docker rm app

$ docker build -t miapp:1 . 
$ docker create -p3000:3000 --name app --network mired miapp:1
$ docker start app
```

### 3.2 Docker Compose

Como se ha podido observar en las líneas de terminal empleadas en el ejemplo anterior, hasta ahora, para poder emplear un contenedor de docker de forma efectiva hemos tenido que realizar una gran cantidad de pasos. Sin embargo, todo ese proceso se puede simplicar empleando el comando docker-compose y un archivo de configuración de tipo `.yml` que llamaremos `docker-compose.yml`.

El lenguaje **yml**(pronunciado yámel) se emplea para crear archivos de configuración. En este lenguaje, como ocurre en otros como **python**, una indentación adecuada es necesaria para que se ejecute correctamente. Vigila, por lo tanto, los espacios.

```yml
version: "3.9"
services:
    app:
        build: .
        ports:
            - "3000:3000"
        links:
            - mimongo
    mimongo:
        image: mongo
        ports:
            - "27017:27017"
        environment:
            - MONGO_INITDB_ROOT_USERNAME=nombre
            - MONGO_INITDB_ROOT_PASSWORD=password
```

A continuación, pasamos a explicar las líneas de código.

```yml
version: "3.9"
```

Esta línea especifica la versión de Docker Compose que se utilizará. En este caso, se está utilizando la versión 3.9. 

Esta línea es opcional. Si se omite la declaración de la versión en el archivo docker-compose.yml, Docker Compose intentará inferir automáticamente la versión correcta basándose en las características y sintaxis utilizadas en el archivo.

```yml
services:
```

Esta línea comienza un bloque que define los servicios que se ejecutarán como contenedores.

```yml
    app:
        build: .
```

Con estas líneas, se define el servicio `app`, que **se construirá a partir del Dockerfile presente en el directorio actual (`.`)**. Este servicio se ejecutará en un contenedor y representará la aplicación.
```yml
        ports:
            - "3000:3000"
```

Esta sección especifica el mapeo de puertos para el servicio `app`. El puerto 3000 del contenedor se mapeará al puerto 3000 de la máquina host, lo que significa que la aplicación en el contenedor estará disponible en `localhost:3000` en la máquina host.

```yml
        links:
            - mimongo
```

Esta sección especifica a qué otros servicios se enlaza el servicio `app`. De esta manera, docker gestiona de forma automática las redes internas.

```yml
    mimongo:
        image: mongo
```

Se define el servicio `mimongo`, que se creará a partir de la imagen `mongo` disponible en Docker Hub. Este servicio se ejecutará en un contenedor y representará una instancia de MongoDB.

```yml
        ports:
            - "27017:27017"
```

Esta sección especifica el mapeo de puertos para el servicio `mimongo`.

```yml
        environment:
            - MONGO_INITDB_ROOT_USERNAME=nombre
            - MONGO_INITDB_ROOT_PASSWORD=password
```

Aquí se definen las variables de entorno para el servicio `mimongo`. Estas variables se utilizan para establecer el nombre de usuario y la contraseña de la base de datos MongoDB. En este caso, el nombre de usuario se establece como `nombre` y la contraseña como `password`.

Para que docker ejecute todos los comandos especificados en el archivo docker-compose.yml debemos usar el siguiente comando:

```bash 
$ docker compose up
```

Se le puede añadir el argumento `-d` para que se ejecute en modo *detached*. Si no lo hacemos, cuando pulsemos `ctrl + C `, se terminará la ejecución de los contenedores, aunque seguirán creados.

Para detener y/o eliminar lo creado con `docker compose up`, se emplea el siguiente comando:

```bash
$ docker compose down
```

Es importante borrar todo lo creado cuando se realizen cambios, antes de volver a subirlo.

De esta manera se integran todos los comandos anteriores en solamente dos, lo que facilita el trabajo con contenedores de docker. Sin embargo, la información interna de estos contenedores no es persistente, lo que significa que lo que guardemos en la base de datos `mimongo` se borrará al detener la ejecución del contenedor. Además, para poder hacer pruebas en el archivo `index.js` tenemos que estar alternando entre `down` y `up` constantemente. Para solucionar estos dos inconvenientes, tenemos a nuestra disposición la herramienta `volumes`.

