# Herramientas de DNS

## 1. Instalación del conjunto de herramientas de DNS BIND9

Para poner en práctica esto, usaremos un contenedor de Docker con la imagen de Alpine. Instalaremos las herramientas del proyecto Bind, que incluyen el servidor DNS named y las bind-tools dig, nslookup y nsupdate.

Como siempre, creamos un contenedor de docker en modo iterativo:
```sh
docker run -it --name pruebas-dns alpine:latest sh
```

Para instalar bind9 en alpine, debemos ejecutar:
```shell
apk update
apk add bind
```
También podemos añadir bind con la opción `--no-cache` para reducir el tamaño del contenedor. Esto instalará el servidor `named` y otras utilidades, como `nslookup` o `dig`.

## 2. Introducción a la herramienta DIG

Dig significa "Domain Information Groper". Se trata de una herramienta de línea de comandos utilizada para realizar consultas a servidores DNS

Si hacemos por ejemplo `dig www.google.es` recibimos la siguiente información:
```
; <<>> DiG 9.20.17 <<>> www.google.es
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 53273
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;www.google.es.                 IN      A

;; ANSWER SECTION:
www.google.es.          58      IN      A       142.250.200.99

;; Query time: 20 msec
;; SERVER: 192.168.65.7#53(192.168.65.7) (UDP)
;; WHEN: Wed Jan 07 11:27:52 UTC 2026
;; MSG SIZE  rcvd: 60
```

En la primera línea, se infica que hemos usado la herramienta dig en su versión 9.20.17 para consultar `www.google.es`. Después aparecen las copciones globales, después nos indica que sí hubo respuesta `Got answer` y luego tenemos la cabecera DNS con la siguiente información:
* opcode: QUERY -> Código de la operación, en este caso: Consulta normal.
* status: NOERROR -> estatus de la operación, en este caso: Sin errores.
* id: 53273 -> identificador de la transacción, que sirve para emparejamientos petición/respuesta.

En la siguiente línea aparecen las banderas (flags). En este caso `qr` Query Response, `rd` Recursion Desired (se pide recursión) y `ra` Recursion Available (Recursión disponible).

Finalmente, viene la sección de la pregunta y la sección de la respuesta. Nos responde directamente con información de configuración de un servidor DNS. 
```
;; ANSWER SECTION:
www.google.es.          58      IN      A       142.250.200.99
```
En esta línea se nos dice que la búsqueda estará 58 segundos en caché, que se ha hecho en internet y que se ha asociado un nombre (www.google.es) con una ip (142.250.200.99).

Finalmente, nos indica lo siguiente:

```
;; Query time: 20 msec
;; SERVER: 192.168.65.7#53(192.168.65.7) (UDP)
;; WHEN: Wed Jan 07 11:27:52 UTC 2026
;; MSG SIZE  rcvd: 60
```
Toda la operación tardó 20 milisegundos, el servidor fue 192.168.65.7 (es decir, un servidor local interno) en el puerto 53 (el puerto del DNS) con el protocolo UDP. Se nos indica cuándo se realizó la petición y el tamaño del mensaje.

Para entender las posibles respuestas, tenemos que saber lo que significan los campos:

### Clases de DNS

| Valor | Nombre   | Uso                    |
| ----- | -------- | ---------------------- |
| `IN`  | Internet | **La única que se usa a día de hoy** |
| `CH`  | Chaos    | Histórica / debug      |
| `HS`  | Hesiod   | Obsoleta               |

### Tipos de registros DNS

| Tipo   | Nombre       | Apunta a   | Ejemplo                      | Uso         |
| ------ | ------------ | ---------- | ---------------------------- | ----------- |
| `A`    | Address      | IPv4       | `www IN A 192.0.2.1`         | Host IPv4   |
| `AAAA` | IPv6 Address | IPv6       | `www IN AAAA 2001:db8::1`    | Host IPv6   |
| `PTR`  | Pointer      | Nombre DNS | `1 IN PTR host.example.com.` | DNS inverso |

### Alias y nombres

| Tipo    | Nombre          | Apunta a    | Ejemplo                     | Uso              |
| ------- | --------------- | ----------- | --------------------------- | ---------------- |
| `CNAME` | Canonical Name  | Otro nombre | `ftp IN CNAME www`          | Alias            |
| `DNAME` | Delegation Name | Dominio     | `old IN DNAME new.example.` | Alias de dominio |

### Correo electrónico

| Tipo | Nombre         | Campos           | Ejemplo                        | Uso           |
| ---- | -------------- | ---------------- | ------------------------------ | ------------- |
| `MX` | Mail Exchanger | Prioridad + host | `@ IN MX 10 mail.example.com.` | Servidor mail |

Cuanto más pequeño sea el número de prioridad, más prioritario será.

### Autoridad y control

| Tipo  | Nombre             | Ejemplo                               | Uso          |
| ----- | ------------------ | ------------------------------------- | ------------ |
| `SOA` | Start of Authority | `@ IN SOA ns1.example. root.example.` | Autoridad    |
| `NS`  | Name Server        | `@ IN NS ns1.example.`                | Servidor DNS |

### Seguridad

| Tipo  | Nombre                                | Uso                       |
| ----- | ------------------------------------- | ------------------------- |
| `TXT` | Text                                  | SPF, DKIM, verificaciones |
| `CAA` | Certification Authority Authorization | Control de certificados   |
| `SPF` | Sender Policy Framework               | **Obsoleto**, usar TXT    |

### Servicios y aplicaciones

| Tipo    | Campos                     | Ejemplo                                | Uso       |
| ------- | -------------------------- | -------------------------------------- | --------- |
| `SRV`   | prioridad peso puerto host | `_sip._tcp SRV 10 5 5060 sip.example.` | Servicios |
| `NAPTR` | reglas                     | Telefonía, ENUM                        | VoIP      |

### Infraestructuras

| Tipo     | Nombre                    | Uso    |
| -------- | ------------------------- | ------ |
| `DS`     | Delegation Signer         | DNSSEC |
| `DNSKEY` | DNS Public Key            | DNSSEC |
| `RRSIG`  | Resource Record Signature | DNSSEC |
| `NSEC`   | Next Secure               | DNSSEC |

### Ejemplo de uso

```dns
www     3600    IN      A       192.0.2.1
```

| Campo  | Significado     | Ejemplo     |
| ------ | --------------- | ----------- |
| Nombre | Host o dominio  | `www`       |
| TTL    | Tiempo en caché | `3600`      |
| Clase  | Tipo de red     | `IN`        |
| Tipo   | Registro DNS    | `A`         |
| Dato   | Valor           | `192.0.2.1` |

En este caso, traduce www en internet por la ip 192.0.2.1 y mantiene el resultado en caché 3600 milisegundos.

> **ACTIVIDAD 1:** Traduce los siguientes ejemplos:
> ```
> @       IN  A       192.0.2.10
> @       IN  AAAA    2001:db8::10
> www     IN  CNAME   @
> @       IN  MX 10   mail.example.com.
> mail    IN  A       192.0.2.20
> 1       IN  PTR     host.example.com.
> ```

>**ACTIVIDAD 2:** Consulta con DIG e interpreta los resultados de los siguientes dominios:
> * localhost
> * www.noexisto.no
> * www.google.com
> * google.com
> * www.bottlecaps.de
> * www.youtube.com
> Finalmente, prueba `dig -x 8.8.8.8` para hacer una resolución inversa (le damos la ip y nos devuelve el nombre)

## 3. Introducción a la herramienta nslookup

[***fuente***](https://axarnet.es/blog/que-es-nslookup)

NSLOOKUP es una herramienta que nos permite realizar consultas sobre los nombres de dominio y conocer cómo están resolviendo los DNS, a qué IP apunta el dominio, etc. La herramienta está disponible también en Windows y la puedes probar desde PowerShell.

Su función principal es conocer la IP del dominio, pero además de eso, podemos conocer el resto de los registros DNS que pueda tener el dominio, como los MX, CNAME o TXT.

También podemos usar NSLOOKUP a la inversa, esto quiere decir que desde una dirección IP, podemos saber a qué dominio corresponde, lo cual puede ser de utilidad en ciertos momentos.

Si hacemos `nslookup google.es`, obtendremos una respuesta similar a esta:
```sh
Servidor:  UnKnown
Address:  192.168.10.1
Respuesta no autoritativa:
Nombre:  google.es
Addresses:  2a00:1450:4003:80f::2003
142.250.178.163
```
Básicamente, esto es lo que significa cada cosa:

* **Servidor**: Esto es el servidor que realiza la petición En este caso desconocido, porque es el nuestro propio.
* **Address**: La IP que realiza la consulta, en este caso el de nuestro router, switch, etc.
* **Respuesta no autoritativa**: Esto indica que el dominio no pertenece a las DNS que estamos consultando. Los servidores DNS se replican por Internet y esto nos indica que así ha sido, se han consultado otros DNS para obtener la información del dominio.
* **Nombre**: El nombre del dominio que ha sido consultado.
* **Addresses**: Aquí encontraremos las direcciones IP asociadas al dominio, en este caso hay dos, una IPv4 y un IPv6.

Si invocamos el programa `nslookup` sin especificar una dirección, entramos en el modo interactivo. Una vez ahí, vamos poniendo nuestras direcciones y se van resolviendo. Si escribimos `exit` salimos del modo interactivo.


> **ACTIVIDAD 3**: Realiza las consultas de la actividad 2 con `nslookup`. El programa detecta de forma automática si buscas una resolución convencional o inversa. Realiza las consultas usando el modo interactivo, por comodidad.

### NSLOOKUP - comandos de ejemplo

Hasta aquí hemos visto cómo funciona NSLOOKUP de forma básica, pero como hemos comentado antes, podemos usarlo con otros comandos para obtener más información sobre las DNS del dominio.
En las pruebas que hemos hecho, siempre nos ha devuelto al IP del dominio, que sería el registro del tipo A.

Esto es así por defecto en NSLOOKUP, pero podemos cambiarlo para que nos muestre el resto de los registros, como, por ejemplo:
```sh
A
Registros del tipo A IPv4
AAA
Registros del tipo A IPv6
MX
Mail Exchanger, para el correo electrónico
PTR
Registros inverso. De una IP a un nombre de dominio
NS
Servidor de nombres de dominio
TXT
Registros TXT que tenga el dominio
```
Pongamos que queremos ver los registros TXT que tiene creados un dominio en sus DNS, para esto accederemos de nuevo a NSLOOKUP:
```sh
nslookup
```
A continuación, le diríamos que queremos que se muestren los TXT con:
```sh
set type=TXT
```
Y a continuación, sólo tendríamos que escribir el nombre del dominio para ver los resultados.

> **ACTIVIDAD 4**: Busca los dominios de la actividad 2, pero con el modo texto.


Si queremos ver otro tipo de registro, como los registros MX, introduciríamos el valor correspondiente:
```sh
set type=MX
```
Y luego el nombre del dominio para ver el resultado.

> **ACTIVIDAD 5:** Busca los dominios de la actividad 2, pero con el modo email.

Como verás, es muy sencillo, aunque tengamos que escribir en la línea de comandos, cualquier puede hacerlo, ya que no es complicado.

### Cambiar Servidor DNS para hacer las consultas

Una de las cosas más interesantes que podemos hacer con NSLOOKUP es cambiar el servidor DNS desde donde hacer las consultas.

Por defecto, usará las de nuestro proveedor o las que estén configuradas en el router que no de la conexión a Internet, pero podemos cambiarlo para, por ejemplo, ver la información desde el servidor DNS de Google de Google.

Es muy sencillo, tan sólo volvemos a la pantalla del sistema y entramos de nuevo en NSLOOKUP:
```sh
nslookup
```
Después de pulsar enter, añadimos lo siguiente:
```sh
server 8.8.8.8
```
Esto nos dará como respuesta que el servidor predeterminado será el de Google:
```sh
server 8.8.8.8
Servidor predeterminado: dns.google
Address: 8.8.8.8
```
¡Y ya está! Ahora cualquier consulta que hagamos en NSLOOKUP, tendrá respuesta de los DNS de Google.

¿Por qué es así? Porque las DNS públicas de Google, las cuales puedes configurar en cualquier ordenador, son 8.8.8.8 y 8.8.4.4.

En el caso que quieras probar con otro servidor DNS, sólo tendrías que conocer las DNS de ese proveedor y que estas sean públicas. Por ejemplo, 1.1.1.1 pertenece a CloudFlare y 208.67.222.222 pertenece al servidor DNS de OpenDNS.

Si realizas una búsqueda encontrarás distintos DNS públicos que puedes usar con NSLOOKUP.

> **ACTIVIDAD 6**: Cambia el servidor de búsqueda y realiza las mismas búsquedas que en la actividad 2. Usa el tipo de búsqueda `A` (por defecto). Compara las diferencias entre los resultados obtenidos aquí y los resultados obtenidos en la actividad 3.

### Otros comandos NSLOOKUP

Como puedes ver, no es nada complicado usar NSLOOKUP, aunque se tenga que escribir algo de texto.

El problema que puedes tener es conocer los comandos, pero no te preocupes, ya que NSLOOKUP te los puedes mostrar. Sólo entra en NSLOOKUP y escribe:
```sh
help
```
Y te mostrará información acerca de los comandos más comunes.

> **ACTIVIDAD 7**: Busca con el comando help los comandos más comunes. Haz una captura del resultado de la búsqueda.

### Comandos que empiezan por [no]

Como verás, hay un montón de comandos que puedes utilizar en NSLOOKUP y hay algunas cosas que pueden confundir un poco al principio, pero verás enseguida que la rutina es más o menos la misma para todos los comandos.

Por ejemplo, verás que hay algunas opciones en las que hay que puedes incluir [no] delante de cada una de las opciones, lo que puede crear confusiones si no lo has usado nunca.

comandos-no-nslookup
Los comandos en los que se pueden usar los prefijos no en NSLOOKUP son los siguientes:

* [no]debug
* [no]d2
* [no]defname
* [no]recurse
* [no]search
* [no]vc
* [no]msxfr

Lo que hace cada uno de estos comandos la tienes en la pantalla de ayuda, pero vamos a enseñarte cómo activarlos y cómo desactivarlos. Es muy sencillo. Digamos que quieres activar el modo debug para ver más información sobre algunos dominios, así que, sencillamente, escribe el siguiente comando en NSLOOKUP:
```sh
set debug
```
Ahora prueba a añadir un dominio y veras la información que la aplicación te dará sobre él.

A partir de ahora, todas las consultas que hagas sobre los dominios será bajo el comando debug, lo cual nos puede venir muy bien si queremos ver esta información en estos dominios, pero.... ¿cómo salimos del comando debug? Como quizás ya estás imaginando, usando el prefijo no saldremos de esta opción:

```sh
set nodebug
```

Como ves, que no es necesario tener que salir/entrar en el Símbolo del sistema para reiniciar NSLOOKUP y salir de una opción que hayas iniciado, sólo tienes que conocer el comando adecuando. Esto mismo funciona con todas las opciones en las que veas [no] delante en la pantalla de ayuda de NSLOOKUP.

> **ACTIVIDAD 8**: Consulta el dominio `www.google.es` en el modo debug y sal del modo debug.

### Casos prácticos de uso de NSLOOKUP
NSLOOKUP es una herramienta que te ayudará a resolver problemas y obtener información relacionada con el Sistema de Nombres de Dominio (DNS).

Vamos a ver algunos casos en los que NSLOOKUP te puede ayudar a resolver un problema.

#### Verificación de la Configuración de DNS de un Sitio Web

Imagina que tienes un sitio web y notas que algunos usuarios no pueden acceder a él.

Usando NSLOOKUP, puedes verificar si los registros DNS de tu sitio están configurados correctamente.

Simplemente ejecutas NSLOOKUP seguido del nombre de tu dominio y obtienes detalles sobre su dirección IP y servidores DNS asociados.

#### Diagnóstico de Problemas de Correo Electrónico

Supongamos que algunos de tus correos electrónicos no llegan a sus destinatarios.

NSLOOKUP puede ayudarte a verificar si los registros MX (Mail Exchange) de tu dominio están correctamente establecidos, lo cual es crucial para el correcto funcionamiento del correo electrónico.

#### Identificación de Cambios en los Registros DNS

En ocasiones, los cambios en los registros DNS pueden tardar en propagarse. Si recientemente hiciste cambios en la configuración DNS de tu dominio, puedes usar NSLOOKUP para comprobar si estos cambios se han propagado por Internet.

Al ingresar tu dominio en NSLOOKUP, obtendrás información actualizada sobre su configuración DNS y además, ya hemos explicado que puedes realizar consultas desde distintos servidores DNS, así que puedes comprobar si la propagación ya es efectiva en todos ellos.

Por ejemplo, puedes hacer un cabio en un registro MX, pero el correo no está llegando a su destino en las cuentas de Gmail. Puedes usar la DNS de Google en NSLOOKUP para comprobar si el cambio en el registro ya ven los servidores de Google.

## 4. nslookup web

También dispones del portal https://www.nslookup.io/ para realizar búsquedas de dns. El portal nos da toda la información disponible y dispone de varias opciones. Podemos alternar los servidores fácilmente sobre una búsqueda en la pestaña superior. Por defecto busca en `Cloudflare`.

> **ACTIVIDAD 9:** Ve a la página nslookup.io y realiza las siguientes búsquedas:
> * www.google.com
> * www.gog.com
> * ceice.gva.es
> Anota los resultados de `Cloudflare`, `Google DNS`, `Authoritative`, `Local DNS -> SouthAfrica` y `Local DNS -> Canada`.

> **ACTIVIDAD 10**: Reflexiona sobre los parecidos y las diferencias entre nslookup y dig. Resumiendo, nslookup es para consultas rápidas y dig dispone de mayor información relacionada con la configuración del DNS.
