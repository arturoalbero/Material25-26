## Configuración de un DNS usando BIND9

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
También podemos añadir bind con la opción `--no-cache` para reducir el tamaño del contenedor. Esto instalará el servidor `named` y otras utilidades, como `nslookup`.

Ahora podemos usar dig o nslookup para comprobar direcciones ip. Dig significa "Domain Information Groper". Se trata de una herramienta de línea de comandos utilizada para realizar consultas a servidores DNS

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
