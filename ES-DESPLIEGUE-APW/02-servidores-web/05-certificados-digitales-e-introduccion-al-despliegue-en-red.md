# Certificados digitales e introducción al despliegue en red

## 1. Certificados digitales y HTTPS en NGINX

El protocolo HTTPS permite establecer una conexión cifrada entre el servidor y el cliente, garantizando:

- **Confidencializad:** Los datos bajan cifrados.
- **Autenticidad:** El cliente puede verificar la identidad del servidor.
- **Integridad:** Evita que los datos se alteren durante la transmisión.
Para poder emplear HTTPS, el servidor web necesita disponer de un certificado digital.

Un **certificado digital X.509** es un archivo que contiene:

- El nombre del dominio o entidad.
- Una clave pública asociada.
- La firma de una [autoridad certificadora](https://es.wikipedia.org/wiki/Autoridad_de_certificaci%C3%B3n) (CA).

Los navegadores confían solo en certificados firmados por una autoridad certificadora (CA) reconocida, como *Let's Encrypt*, *DigiCert*, *Sectigo*, etc.

En entornos de pruebas, también podemos generar certificados autofirmados (**self-signed**).

### 1.1. Creación de un certificado autofirmado

Podemos usar un contenedor temporal con OpenSSL para generar el certificado. Una vez instalado, seguiremos [este tutorial](https://www.ssldragon.com/how-to/openssl/create-self-signed-certificate-openssl/) para crear certificados.

Lo primero es crear el contenedor en Docker que nos va a permitir acceder al terminal de linux como si fuera nuestro ordenador. Si tienes OpenSSL instalado en tu ordenador, este paso lo puedes omitir (o cambiar por la instalación de OpenSSL). Para ello, creamos un contenedor temporal (que se borra cuando acaba su ejecución, gracias a `--rm`) de la siguiente forma:

```bash
docker run -it --rm -v "./certs":/certs alpine:latest sh
```

En este comando, ejecutamos el contenedor en modo interactivo (`-it`) y le indicamos que se borre cuando deje de ejecutarse (`--rm`). Después, bindeamos nuestra carpeta ./certs a una carpeta interna del contenedor que llamamos /certs. El nombre de las carpetas es indiferente, ya que al usar openssl más adelante, lo pondremos de manera explícita. Elegimos la imagen `alpine:latest` y le indicamos que entre en modo `shell` con sh. Al ejecutarlo, nuestra consola se transformará en una consola de alpine linux. Sin embargo, no tiene openssl instalado... todavía. Para ello, en la nueva consola (la distinguirás por el símbolo `#`), instalamos openssl con el siguiente comando:

```bash
apk add --no-cache openssl
```
Esto instala openssl dentro del contenedor. Ahora ya podemos seguir [este tutorial](https://www.ssldragon.com/how-to/openssl/create-self-signed-certificate-openssl/) para crear los certificados paso a paso.

#### PASO 1: Generar la *Private Key*

El primer paso es generar la clave privada usando OpenSSL. Para ello, ejecuta el siguiente comando. Ten en cuenta que en los ejemplos suponemos que has hecho el bindeo de volúmenes con la carpeta `/certs` del contenedor:

```bash
openssl genpkey -algorithm RSA -out /certs/private.key
```

Ahora, si observas en tu carpeta `./certs` verás cómo aparece el archivo `private.key`. Realiza las prácticas en Visual Studio Code y siempre echándole un ojo al explorador de archivos para cerciorarte de que los pasos funcionan de forma adecuada.

Con el `private.key` en nuestro poder, podemos pasar al siguiente paso.

#### PASO 2: Generar el *CERTIFICATE SIGNING REQUEST (CSR)*

Lo siguiente es generar un CSR usando nuestra clave privada. El CSR es un bloque de texto con información de contacto sobre nuestro dominio y compañía. Al ejecutar el siguiente comando:

```bash
openssl req -new -key /certs/private.key -out /certs/csr.pem
```

Entraremos en un formulario con una serie de campos para rellenar.

1. Country Name: El nombre del país usando un código de dos letras (por ejemplo, ES para España)
2. State or Province Name: El nombre de la provincia o el estado, dependiendo del país. Por ejemplo, ALICANTE.
3. Locality Name: El nombre de la localidad, por ejemplo, MUTXAMEL.
4. Organization Name: El nombre de la organización, por ejemplo IES MUTXAMEL.
5. Organization Unit Name: El nombre del departamento (unidad) de la organización responsable de manejar los certificados SSL. Por ejemplo, 2DAW.
6. Common Name: El *Fully Qualified Domain Name* (FQDN) (es decir, dominio) que quieres asegurar, o tu nombre. Por ejemplo, www.yomismo.es.
7. Email Address: Un email de contacto.
8. Challenge Password: Una contraseña.
9. An optional company name: Un nombre opcional, que puedes dejar en blanco.

#### PASO 3: Generar el certificado autofirmado (Self-Signed Certificate)

Finalmente, podemos crear el certificado autofirmado usando el CSR y la clave privada con el siguiente comando:
```bash
openssl req -x509 -days 365 -key /certs/private.key -in /certs/csr.pem -out /certs/certificate.crt
```

* **`openssl req`**: Este es el subcomando de OpenSSL que se utiliza para la **gestión de peticiones de certificado** (CSR, *Certificate Signing Request*).
* **`-x509`**: Esta opción modifica el comportamiento del comando para que, en lugar de generar una CSR, cree un **certificado X.509 autofirmado**. Un certificado autofirmado es ideal para entornos de desarrollo, pruebas o redes privadas donde no se necesita la validación de una **Autoridad de Certificación (CA)** externa.
* **`-days 365`**: Define la **validez** del certificado en días. En este ejemplo, el certificado será válido durante **365 días** (un año).
* **`-key /certs/private.key`**: Especifica la **ruta** al archivo que contiene la **clave privada** del servidor. Esta clave privada es esencial, ya que se utiliza para cifrar y descifrar la información y debe coincidir con la clave utilizada para generar la CSR.
* **`-in /certs/csr.pem`**: Especifica la **ruta** al archivo de **Solicitud de Firma de Certificado (CSR)**. El CSR contiene la información de identidad (nombre del dominio, organización, etc.) que se incluirá en el certificado final.
* **`-out /certs/certificate.crt`**: Define la **ruta y el nombre del archivo** donde se escribirá el **certificado X.509 final** generado. Este es el archivo que tu servidor web utilizará para establecer conexiones seguras (HTTPS).

Si todo ha ido bien, ya tendrás todo creado:
```bash
private.key       ← clave privada
csr.pem           ← solicitud de firma
certificate.crt   ← certificado autofirmado
```

Para salir del contenedor, escribe `exit`. Ten en cuenta que esto borrará el contenedor y que, cada vez que quieras volver a crear un certificado, tendrás que repetir todos estos pasos.

### 1.2. Usar el certificado autofirmado en NGINX

El siguiente paso es configurar nginx para usar HTTPS, modificando el `nginx.conf` para que tenga una apariencia similar a esta:

```
events {}

http {
    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate     /etc/nginx/certs/certificate.crt;
        ssl_certificate_key /etc/nginx/certs/private.key;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }
    }

    # Redirección HTTP -> HTTPS
    server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
    }
}
```
Para que esto funcione, copia la carpeta `/certs` que bindeaste dentro de la carpeta `/etc/nginx/`. Si tienes la carpeta bindeada en el contenedor, como ya trabajamos en prácticas anteriores, simplemente copia la carpeta `/certs` dentro de la carpeta `/nginx` donde está el archivo de configuración. Lanza el contenedor de nginx. Acuérdate de que debes tener abiertos los puertos 80 y 443. Si has seguido las prácticas, debería ser algo parecido a esto:

```bash
docker run --name nginx-bindeado-con-seguridad -p80:80 -p443:443 -v ./volumes-nginx/conf/nginx:/etc/nginx -v ./volumes-nginx/data/nginx:/usr/share/nginx nginx
```


Ahora, vista `localhost` y verás un aviso de seguridad, porque el certificado es autofirmado y no pertenece a una CA reconocida. Esto es lo normal cuando estamos haciendo pruebas. En un despliegue final, deberías tener certificados que hayan pasado por una CA como las mencionadas anteriormente.

![alt text](img/05-img01-aviso-certificados.png)

> **ACTIVIDAD**
> Crea un certificado autofirmado con tus datos; configura NGINX para servir contenido seguro mediante HTTPS; verifica el certificado desde el navegador, dándole a `ver Detalles del certificado`; crea una redirección automática de http:// a https:// y comprueba la diferencia de comportamiento al acceder por http y https.


## 2. Introducción al despliegue en red

En este punto, vamos a trasladar todo lo que hemos hecho hasta ahora usando Docker a un servidor web real. Hay muchas opciones disponibles, pero vamos a emplear el servicio `koyeb`, que dispone de una opción gratuita. Lo primero que haremos será registrarnos en `koyeb` (podemos hacerlo con nuestra cuenta de github). Nada más comenzar, nos da acceso a un plan Pro, pero el que vamos a usar más adelante es el plan Free.

Para desplegar el proyecto en Koyeb, necesitamos crear un Dockerfile con los archivos que queramos desplegar. Dichos archivos los subiremos un repositorio de github. Antes de comenzar, debemos tener en cuenta que Koyeb por defecto escucha el puerto 8000. Deja que Koyeb gestione el HTTPS externamente. Ellos ponen su propio certificado y proxy SSL. Podemos dejar el nginx.conf así:

```nginx
events {}

http{
    include mime.types;
    server{
        listen 8000;
        root /usr/share/nginx/html;

        location /mascosas {
            alias /usr/share/nginx/html/miscosas;
        }
        # etcétera etcétera
   }
}
```

Si tenemos una estructura de carpetas así en el repositorio de github:
```bash
|- volumes-nginx/
|----|- conf/nginx/* #(TODOS LOS ARCHIVOS DE CONFIGURACIÓN)
|----|- data/nginx/html/* #(TODOS LOS ARCHIVOS HTML ESTÁTICOS)
|- dockerfile
```
El Dockerfile debe ser algo así:

```dockerfile
FROM nginx:latest

COPY volumes-nginx/conf/nginx /etc/nginx
COPY volumes-nginx/data/nginx /usr/share/nginx

```

A partir de aquí, el proceso es muy sencillo. Lo primero es crear un nuevo servicio en Koyeb e importar nuestro repositorio, copiando la dirección pública del mismo

![alt text](img/05-image.png)

Damos a siguiente y le indicamos que se trata de un dockerfile, para que lo monte.

![alt text](img/05-image-1.png)
Elegimos la opción gratuita.

![alt text](img/05-image-2.png)

Desplegamos el contenedor en la web. Aquí podemos configurar los puertos de la aplicación.  

![alt text](img/05-image-3.png)

Esperamos mientras se termina de desplegar. Este proceso es relativamente lento, así que deberás esperar unos minutos mientras se construye la imagen (rápido) y se despliega (más lento).

![alt text](img/05-image-4.png)

## 3. Certificados reales con Let's Encrypt

En un servidor público (con un dominio real apuntando a tu IP), puedes usar **Certbot** para obtener certificados gratuitos y automáticos de *Let's Encrypt*.

Podemos volver a usar nuestra imagen de alpine con el comando anterior (`docker run -it --rm -v ./certs:/certs alpine:latest sh`) e instalar certbot de la siguiente forma:

```bash
apk add certbot
```

Después de eso, ejecutamos:

```bash
certbot certonly --webroot -w /usr/share/nginx/html -d midominio.com -d www.midominio.com
```

Esto descargará los certificados en `/etc/letsencrypt/live/midominio.com/`.
Luego, actualiza tu `nginx.conf` con las rutas adecuadas:

```nginx
ssl_certificate     /etc/letsencrypt/live/midominio.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/midominio.com/privkey.pem;
```

La renovación automática se puede programar con `crond`:

```bash
crontab -e
# Añadir:
0 3 * * * certbot renew --quiet
```

## 4. Herramientas para la gestión de logs

NGINX genera logs de acceso y error en:

```
/var/log/nginx/access.log
/var/log/nginx/error.log
```

Para verlos dentro de tu contenedor:

```bash
docker exec -it nginx-https sh
cat /var/log/nginx/access.log
```

O desde el host:

```bash
docker logs nginx-https
```

En entornos reales, se pueden montar volúmenes para conservar los logs fuera del contenedor:

```bash
-v "$(pwd)/logs":/var/log/nginx
```

Esto facilita su análisis con herramientas como **GoAccess**, **Grafana Loki** o **Elastic Stack (ELK)**.

> **ACTIVIDAD**
> Si has ido siguiendo los pasos de estos apuntes, ya tendrás algo similar a lo que se propone aquí:
>
> 1. Genera un certificado autofirmado con tus datos.
> 2. Configura NGINX (en Docker) para servir contenido HTTPS.
> 3. Implementa la redirección automática de HTTP → HTTPS.
> 4. Comprueba los logs de acceso y los detalles del certificado desde el navegador.
> 5. Despliega tu sitio en Koyeb.


