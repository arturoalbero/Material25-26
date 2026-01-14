# Configuración de un servidor DNS Autoritativo

## 1. El servidor BIND9

BIND9 (Berkeley Internet Name Domain) es uno de los servidores DNS más comunes de internet. Se configura a través del archivo `named.conf`. Nos va a permitir crear un servidor autoritativo, una opción muy común cuando somos los dueños de los dominios que queremos direccionar. Un servidor autoritativo se vale de sí mismo para dar la respuesta a una consulta DNS, no necesita consultar a otros.

El archivo `named.conf` se compone de bloques, principalmente `options` y cada una de las zonas. Cada bloque se compone del nombre y su contexto, encerrado entre `{}`. Todas las líneas deben acabar en `;`, incluida la del cierre del contexto.

```named.conf
options {
    directory "/var/cache/bind";

    listen-on port 53 { any; };

    allow-query { any; };
    recursion yes;
};

zone "ejemplo.local" {
    type master;
    file "/etc/bind/zones/db.ejemplo.local";
};

zone "otro.local" {
    type master;
    file "/etc/bind/zones/db.otro.local";
};
```
En este caso, definimos unas opciones y unas zonas. Dentro de las opciones, las líneas significan lo siguiente:
* `directory "/var/cache/bind";` Indica el directorio de trabajo por defecto del servidor DNS.
* `listen-on port 53 { any; };` Indica que se escucha en el puerto 53 (el de DNS) y que acepta peticiones desde cualquier IP (`any`).
* `allow-query { any; };` Indica que cualquiera (`any`) puede hacer peticiones (`query`).
* `recursion yes;` Indica que el servidor admite recursión, es decir, que si no sabe la respuesta la puede buscar. Está bien para pruebas, pero no tanto para producción.
* `zone "ejemplo.local"` Indica el nombre de la zona (en este caso `ejemplo.local`) y abre el contexto.
* `type master` Indica que el servidor es el original.
* `file "/etc/bind/zones/db.otro.local";` Indica donde se encuentra el archivo con las zonas.

> **ACTIVIDAD 1**: Monta un contenedor de Docker con la imagen de Alpine. Instala las herramientas de Bind9 y conviértelo en una imagen llamada AlpineBind. Después, usando esa imagen, crea un contenedor Docker que exponga el puerto 53 (del DNS) tanto en tcp como en udp (necesitas exponerlo dos veces `-p 53:53/udp -p 53:53/tcp`, ya que por defecto solo se expone en tcp) y bindea el directorio `/etc/bind/`. Crea un archivo para zonas llamado `zones`. La estructura de nuestro contenedor debería ser algo así:
> ```
> bind-docker/
>├── named.conf
>├── zones/
>│   ├── db.ejemplo.local
>│   └── db.otro.local
>```
> 1. Ejecuta `shell` en modo interactivo. Si el contenedor está en ejecución, puedes usar `Docker exec MiContenedor -it sh`.
> 2. Modifica el archivo named.conf.


## 2. Zonas

Una zona es un dominio administrado por el servidor DNS. Por ejemplo, dadas dos zonas:

| Zona          | Qué controla                              |
| ------------- | ----------------------------------------- |
| ejemplo.local | Todos los nombres dentro de ejemplo.local |
| otro.local    | Todos los nombres dentro de otro.local    |

Cada zona se describe con un bloque dentro del archivo `named.conf` y, además, con un archivo de zona, que contienen la palabra db, un punto y el nombre de la zona. En este caso, deberíamos tener `db.ejemplo.local` y `db.otro.local`.

Los archivos de zonas son los más importantes del servidor DNS, ya que son los que definen el direccionamiento de los diferentes dominios. Veamos a continuación un ejemplo para el archivo `db.ejemplo.local`:

```
$TTL 604800
@   IN  SOA ns.ejemplo.local. admin.ejemplo.local. (
        2026010101
        604800
        86400
        2419200
        604800 )
```
En este caso, estamos definiendo un Time To Live de 604800 milisegundos, que son 7 días. Este es el tiempo que se guarda la información en caché.

En la siguiente línea, el `@` se refiere al nombre de la zona. Es decir, en este caso se intercambia por `ejemplo.local`, que es el nombre de la zona.

En la línea `@   IN  SOA ns.ejemplo.local. admin.ejemplo.local.` definimos el SOA, es decir, el Start of Autority. Por un lado, el DNS principal es `ns.ejemplo.local` y, por otro, el admin que es `admin.ejemplo.local`. Los puntos al final son **obligatorios**. Si no escribimos el punto, bind completa el nombre con el nombre de la zona.

Dentro del paréntesis tenemos cinco números. El primero es un número de serie que se corresponde, en este caso, con una fecha en formato AAAAMMDDNN, siendo A el año, M el mes, D el día y N el número de cambio en el día. Esto es así porque cada vez que se cambia el archivo de zona, este número debe cambiar (y no se espera que haya más de 100 cambios en un día). El resto de números se corresponde con:
```
604800  ; refresh
86400   ; retry
2419200 ; expire
604800  ; negative cache
```
Son valores estándar y en principio no es necesario cambiarlos.

Una vez que tenemos el SOA y el TTL debemos añadir los demás datos.

```dns
@       IN  NS      ns.ejemplo.local.
ns      IN  A       172.20.0.2
app     IN  A       172.20.0.2
```
* La línea `@       IN  NS      ns.ejemplo.local.` indica que el servidor de nombres de la zona es `ns.ejemplo.local`.
* La línea `ns      IN  A       172.20.0.2` indica que `ns` se encuentra en la ip 172.20.0.2. Es decir, cuando escribamos ns.ejemplo.local traducirá ese nombre por la dirección 172.20.0.2.
* La línea `app     IN  A       172.20.0.2` indica que `app` se encuentra en la ip 172.20.0.2. Es decir, cuando escribamos app.ejemplo.local traducirá ese nombre por la dirección 172.20.0.2.

> **RECUERDA:** El punto al final de un nombre determina si BIND debe dejarlo tal cual (si hay punto) o completarlo con el nombre de la zona (si no hay punto).

Aunque los servicios apunten a la misma IP, los puertos son diferentes.

Para encontrar la IP local de nuestro contenedor debemos ejecutar `docker inspect micontenedor` y buscar la información correspondiente.

Si queremos que nuestro contenedor tenga una IP fija, algo bastante deseable en un servidor DNS, debemos hacer lo siguiente:
1. Creamos una red personalizada:
```sh
docker network create --subnet 172.20.0.0/24 dns_net
```
2. Al crear el contenedor, lo añadimos a la red y le asignamos una ip estática:
```sh
docker run -d --name bind-dns --net dns_net --ip 172.20.0.2 -p 53:53/udp -p 53:53/tcp bind-alpine
```

> **ACTIVIDAD 2**: Vuelve a crear el contenedor, esta vez con la ip fija. Después, crea el archivo named.conf con el archivo de zonas.

## 3. Prueba del servidor DNS

### Pruebas internas

Para probar nuestro servidor de forma interna, tenemos que meternos en el shell del contenedor y ejecutar:

```sh
dig app.ejemplo.local @127.0.0.1
```
Si da una respuesta con `ANSWER SECTION`, significa que está funcionando.

### Pruebas externas

Para probar desde el host, debemos usar dig:
```sh
dig @localhost app.ejemplo.local
```
o nslookup:

```sh
nslookup app.ejemplo.local 127.0.0.1
```
Tanto @localhost como 127.0.0.1 hacen referencia al propio equipo.

> **ACTIVIDAD 3**: Comprueba que el servidor de DNS funcione correctamente. Puedes usar dig en otro contenedor con bind instalado conectado a la misma red (no necesita exponer puertos ni tener una ip fija, solo que entres en el shell en modo interactivo).

> **ACTIVIDAD 4**: Ejecuta una aplicación web en otro contenedor (puede ser tu aplicación Spring Boot o tu aplicación NGINX). La idea es que esté en la misma red que el servidor DNS y que, además, tenga una IP fija.
>
> Después, añade la aplicación a la zona `ejemplo.local`. Llámala `miapp` y haz que se dirija a la IP que hayas especificado. 
> 
> Comprueba que todo funcione usando dig y nslookup.
> 
> Para poder acceder a la web usando `http://miapp.ejemplo.local` necesitaríamos que nuestro navegador usara como DNS nuestro la IP de nuestro contenedor con el DNS cargado. Es más fácil hacerlo si tenemos un tercer contenedor conectado a la red, haciendo ping.
>
> Debemos acceder a `/etc/resolv.conf`, por ejemplo con `cat /etc/resolv.conf` y modificar la línea `nameserver 8.8.8.8` para que coincida con la IP de nuestro servidor DNS. Puedes usar el editor vi.

> **ACTIVIDAD 5:** Crea un `docker-compose` que refleje todo lo anterior (el contenedor con el DNS, el contenedor con la APP y el contenedor de pruebas). Puedes hacer commit de los contenedores para transformarlos en imágenes para que resulte más sencilla la configuración. Recuerda:
> - Contenedor para hospedar el servidor DNS. Con IP fija.
> - Contenedor con la app de Spring boot y/o NGINX. Con IP fija.
> - Contenedor para pruebas. No necesita IP fija, pero debe usar nuestro servidor DNS como servidor DNS para resolver nombres.

> **ACTIVIDAD 6:** Crea varios contenedores, cada uno de ellos con una aplicación web distinta (usa nginx y cambia ligeramente el index.html para identificarlas). Configura un contenedor con un servidor dns que las incluya a todas. Emplea al menos dos zonas. Finalmente, usa un último contenedor para poder hacer las pruebas. Recuerda cambiar el DNS por defecto.

> **ACTIVIDAD AMPLIACIÓN 1:** Configura el DNS del sistema host o del navegador para que consulte el DNS de tu contenedor. Entonces, comprueba que el navegador se conecta correctamente a los diferentes contenedores con las aplicaciones web. Finalmente, restablece el DNS para dejar el ordenador correctamente configurado. Usa una máquina virtual con Linux para hacerlo más sencillo.

> **ACTIVIDAD AMPLIACIÓN 2:** Configura el DNS del sistema para que cuando hagas `www.google.es` te lleve a la página de `www.gog.com` y viceversa. Usa una máquina virtual con Linux para hacerlo más sencillo.

