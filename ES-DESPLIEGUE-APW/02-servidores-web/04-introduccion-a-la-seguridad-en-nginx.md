# Introducción a la seguridad en NGINX

## 1. Requisitos para la práctica

### 1.1. Conectarse a otros ordenadores

Para la realización de esta práctica, debes emplear al menos dos equipos con ip diferentes. 
- El segundo puede ser un equipo virtual, pero asegúrate de tener la red del hipervisor (virtual box) en modo bridge para que tanto el host como el virtualizado estén en la misma red lógica, pero con ips distintas.
- También puedes conectarte desde cualquier ordenador en la misma red lógica, asegúrate de saber la ip del ordenador servidor (donde lances nginx) con ifconfig, y también de los ordenadores anfitriones.

Para conectarte a otro ordenador, debes introducir su IP en el lugar donde antes solías introducir localhost. Por ejemplo, `http://192.168.1.32:8080/index` accede a la URI `/index`  a través del puerto `8080` del equipo con la IP `192.168.1.32` (que es una IP privada, para nuestra red local). Sin embargo, **nada de esto funcionará si no tenemos los puertos abiertos en el servidor.**

### 1.2. Apertura de puertos en Windows

Por defecto, Windows tiene todos los puertos cerrados. Para abrir puertos en Windows en una red local, sigue estos pasos a través del Firewall de Windows:

1) Accede al Panel de control desde el menú Inicio y selecciona "Sistema y seguridad". 
2) Haz clic en "Firewall de Windows" y luego en "Configuración avanzada". Debes tener **permisos de administrador**.
3) En la ventana de "Configuración avanzada del Firewall", selecciona "Reglas de entrada" en el menú izquierdo.
4) En el panel de acciones de la derecha, haz clic en "Nueva regla".
5) En el asistente, selecciona el tipo de regla "Puerto" y haz clic en "Siguiente".
6) En la pantalla "Protocolos y puertos", selecciona el protocolo (TCP o UDP) y especifica el número de puerto local que deseas abrir (por ejemplo, 80 para HTTP o 443 para HTTPS).
7) En la siguiente pantalla, selecciona "Permitir la conexión" y haz clic en "Siguiente".
8) En la pantalla "Perfil", deja marcadas las opciones que correspondan a tu entorno de red (Dominio, Privado y/o Público).
9) En la pantalla "Nombre", proporciona un nombre descriptivo para la regla (por ejemplo, "Servidor Web Local") y una descripción opcional, luego haz clic en "Finalizar".

Este proceso permite que los dispositivos en tu red local accedan al servicio que escucha en el puerto especificado. Para la práctica, abre los puertos `80` (HTTP) y `443` (HTTPS).

## 2. Mecanismos de autenticación y control de acceso del servidor.

### 2.1. Control de acceso al servidor

Para restringir o permitir el acceso al servidor, nginx dispone de las directivas `allow` y `deny`. Las directivas allow y deny funcionan a nivel de red. Se evalúan en orden, y el primer bloque que coincida determina el acceso.

En el siguiente ejemplo:
```nginx
location /private/ {
    allow 192.168.1.0/24
    deny all;
}
```
La localización `/private/` se configura para que permita acceder a cualquier ordenador perteneciente a la red privada `192.168.1.0/24`, pero impida el acceso a todos los demás, que recibirán un error `403 Forbidden`.

Tanto `allow` como `deny` admiten como valor la palabra `all`, una red (como en el ejemplo) o una IP de un equipo concreto.

> **ACTIVIDAD:** Abre tres equipos de clase, averigua las IP de los tres equipos y, en uno de ellos, lanza un servidor NGINX con contenido estático, como el de las actividades anteriores. Modifica el archivo de configuración para conseguir los siguientes efectos:
> - Impide el acceso de una localización concreta a uno de los equipos y permíteselo al resto.
> - Permite el acceso de una localización concreta a uno de los equipos y permíteselo al resto.
> - Impide el acceso a la red local. De esta manera, solo podrás acceder al contenido con el ordenador servidor que tenga el `localhost`.

### 2.2. Mecanismos de autenticación

Para la autenticación en nginx, necesitamos un archivo `.htpasswd` que se crea mediante el conjunto de utilidades de Apache. En principio, deberíamos instalar Apache y ya tendríamos acceso a la aplicación, a la cual le tendríamos que pasar algo como esto:

```bash
htpasswd -c /etc/nginx/.htpasswd usuario
```
Crearíamos en `/etc/nginx/` un archivo oculto `.htpasswd` con el usuario `usuario`. Después el sistema nos pediría introducir la contraseña. Para seguir añadiendo usuarios, deberíamos repetir el mismo comando, pero sin el parámetro `-c`.

Finalmente, en el bloque `location` de la localización que queremos restringir con contraseña, deberíamos colocar las siguientes líneas:

```nginx
auth_basic "Mensaje de seguridad - Autenticación requerida";
auth_basic_user_file /etc/nginx/.htpasswd;
```
Gracias a Docker, no es necesario instalar nada. Podemos usar un contenedor temporal con Apache HTTPD, que ya trae el programa que necesitamos (htpasswd). Con este comando, añadimos un suario y extraemos el archivo `.htpasswd` del contenedor, que se borra al completar la operación.

```bash
docker run -rm httpd:alpine htpasswd -nb alumno123 clave123 > .htpasswd
```

El parámetro `-nb` lo que hace es:
- `-n` no modifica el archivo, solo imprime la línea en pantalla
- `-b` Permite pasar la contraseña por línea de comando

No hace falta crear un archivo `.htpasswd` porque httpd lo trae creado de serie, vacío y listo para rellenarse.

De esta forma, extraemos dicho archivo `.htpasswd` en la carpeta donde lancemos el comando, y ya se habrá añadido el usuario `alumno123` con la contraseña `clave123`.

Para agregar un nuevo usuario al mismo archivo `.htpasswd`, ejecutamos el mismo comando sin `-c`, por ejemplo:

```bash
docker run -rm httpd:alpine htpasswd -nb usuario2 clave2 > temp && temp .htpasswd
```
<details>
<summary>

***Despliega para saber por qué utilizamos imágenes `alpine`***
</summary>

> Habrás observado que en muchas imágenes de estos ejemplos, la versión que cogemos es `alpine`. Las imágenes Alpine en Docker son versiones ligeras de la distribución Linux Alpine, diseñadas específicamente para contenedores con un tamaño reducido y una superficie de ataque mínima.
> 
> Estas imágenes son ideales para entornos de producción debido a su pequeño tamaño, lo que permite despliegues más rápidos y una menor utilización de recursos.
> 
> Por ejemplo, una imagen Alpine puede ocupar alrededor de 5.59 MB, mientras que una imagen Ubuntu puede ocupar hasta 64.21 MB, lo que representa una diferencia de aproximadamente 12 veces más.
</details>

En este caso, lo que hacemos es volcar el contenido a un archivo temporal `temp` para no sobreescribir nuestro archivo y, después, lo movemos a `.htpasswd` para añadirlo al final. Repetimos este proceso para añadir tantos usuarios como queramos.


Si volvemos a ejecutar este comando sobre un usuario ya existente, se reescribirá la clave.

> **ACTIVIDAD:** Restringe una de las location de tu servidor web para que solo se pueda acceder con un usuario registrado.
> - Registra a 3 usuarios diferentes
> - Intenta acceder con cada uno de ellos
> - Intenta acceder con un usuario no registrado
> - Repite los pasos desde un ordenador externo, conectándote a distancia.

> **CONSEJO PARA HACERLO EN CASA:** Para probar esta práctica en tu casa solamente necesitas un ordenador con los puertos abiertos que requieras (80 y 443) que hará de servidor. Este ordenador es el que ejecutará el contenedor nginx de Docker. Necesitarás saber su IP en la red local (puedes consultarla con ipconfig en Windows) y, en un terminal distinto (tu móvil, una consola con navegador, una tablet, etc...) accede al navegador y escribe la dirección IP de tu ordenador como dominio, más la URI a la que quieras acceder.

