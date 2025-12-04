# Seguridad en los servidores de transferencia de archivos

## Módulos en ProFTPD

Para poder implementar tanto FTPS como SFTP, ProFTPD se nutre de módulos. Los módulos son programas en lenguaje C con las funcionalidades extra que queremos usar. Tenemos que tenerlos en nuestro ordenador, o dentro del contenedor que estemos usando, y activarlos en el archivo de configuración `proftpd.conf`. A continuación, veremos la implementación de ambos protocolos gracias a los módulos.


## Implementación de FTPS en ProFTPD

ProFTPD permite la implementación del protocolo FTPS a través del módulo `mod_tls`. FTPS no es más que el FTP tradicional usando una capa de seguridad a través de un certificado TLS. En [la unidad 2, punto 5, aprendimos a generar estos certificados](ES-DESPLIEGUE-APW/02-servidores-web/05-certificados-digitales-e-introduccion-al-despliegue-en-red.md).

Existen dos tipos de FTPS, explícito e implícito. Este último se considera obsoleto y cifraba desde el principio de la conexión, usando el puerto 990. El FTPS explícito se conecta por el puerto 21 y es entonces cuando establece el cifrado mediante `AUTH TLS`.

Para habilitar FTPS necesitamos un certificado y una clave. Genéralos como vimos en capítulos anteriores y colócalos en una carpeta de certificados. La *bindearemos* a la carpeta `/etc/proftpd/ssl/` del contenedor.

Para activar TLS, en el archivo de configuración debemos activar el módulo, añadiendo las siguientes líneas:

```nginx
<IfModule mod_tls.c>
  TLSEngine                   on
  TLSLog                      /var/log/proftpd/tls.log

  TLSRSACertificateFile       /etc/proftpd/ssl/proftpd.crt
  TLSRSACertificateKeyFile    /etc/proftpd/ssl/proftpd.key

  # Solo permitimos conexiones cifradas
  TLSRequired                 on

  # Protocolos mínimos seguros
  TLSProtocol                 TLSv1.2

  # Protección de los canales de datos
  TLSOptions                  NoCertRequest
  TLSVerifyClient             off
</IfModule>
```

Activamos el módulo mediante etiquetas similares a las de un xml, como todas las directivas de ProFTPD, y dentro ponemos los parámetros necesarios para el módulos, en pares parámetro-valor.

Para probar que todo funciona, en Filezilla debemos seleccionar:

```text
Protocolo: FTP

Cifrado: Requiere FTPS explícito (FTP sobre TLS)
```

Si el certificado es autofirmado, el cliente pedirá confirmación.

> **ACTIVIDAD 1** Implementa un servidor FTPS explícito en Docker siguiendo los pasos anteriores. Comprueba su funcionamiento correcto en Filezilla.

Para más información, puedes consultar la documentación oficial aquí: http://www.proftpd.org/docs/howto/TLS.html 

## Implementación de SFTP en ProFTPD

SFTP es un protocolo de transferencia de ficheros totalmente distinto que funciona en el puerto `22`. De esta forma, tendremos que cambiar esos datos en nuestra configuración. Recuerda que si el puerto está en uso, cuando mapeamos puertos lo podemos sustituir por cualquier otro, como `2222`. Como vamos a necesitar generar claves SSH, puedes bindear en una de tus carpetas la carpeta `/etc/proftpd/` del contenedor. En esa carpeta almacenamos las claves SSH, que podemos generar con el programa `ssh-keygen`:

```bash
ssh-keygen -t rsa   -f /etc/proftpd/ssh_host_rsa_key    -N ""
ssh-keygen -t ecdsa -f /etc/proftpd/ssh_host_ecdsa_key -N ""
```

SFTP utiliza un solo canal cifrado sobre SSH (protocolo 22), y es normalmente más sencillo de manejar a nivel de puertos y NAT. Es importante destacar que ProFTPD no usa el SSH del sistema, sino el suyo propio.

Como sucedía con FTPS, ProFTPD no incluye SFTP por defecto: se habilita mediante el módulo mod_sftp. En Alpine, ProFTPD suele incluir el módulo. Podemos comprobarlo con el siguiente comando:

```
proftpd -l | grep sftp
```
Que debería devolver los módulos, de esta forma:
```
mod_sftp.c
mod_sftp_pam.c
```

Debemos activar el módulo en el archivo de configuración de la siguiente manera:

```nginx
<IfModule mod_sftp.c>
  SFTPEngine                on
  SFTPLog                   /var/log/proftpd/sftp.log

  # Puerto SFTP (SSH)
  Port                      2222

  # Claves del servidor (SSH)
  SFTPHostKey               /etc/proftpd/ssh_host_rsa_key
  SFTPHostKey               /etc/proftpd/ssh_host_ecdsa_key

  # Aislamiento del usuario
  DefaultRoot               ~

  # Algoritmos seguros
  SFTPAuthMethods           publickey,password
</IfModule>

```

Finalmente, para comprobar que funciona, debemos conectarnos al servidor con Filezilla estableciendo como protocolo: `SFTP - SSH File Transfer Protocol` y como puerto el 2222 (o el hayamos abierto).

> **ACTIVIDAD 2** Implementa un servidor SFTP en Docker siguiendo los pasos anteriores. Comprueba su funcionamiento correcto en Filezilla.

Para más información, puedes consultar la documentación oficial aquí: http://www.proftpd.org/docs/contrib/mod_sftp.html 

## Combinación de ProFTPD y NGINX

La mala noticia es que, a diferencia de lo que sí podíamos hacer con tomcat en la unidad anterior, NGINX no puede hacer de proxy con ProFTPD. Esto se debe a que el protocolo es más complejo y requiere varios puertos para funcionar correctamente. Sin embargo, lo que sí puede hacer y se hace muy a menudo, es servir archivos desde el servidor FTP, de la misma forma que podría conectarse a una base de datos desde un servidor de bases de datos.

Básicamente, lo que tenemos que hacer es lanzar un contenedor de NGINX que sirva archivos pidiéndoselos al servidor FTP haciendo que:

- ProFTPD gestione uploads y descargas por FTP/FTPS/SFTP
- NGINX sirva esos mismos archivos por HTTP/HTTPS

Para ello, en `docker`, debemos lanzar los dos contenedores y conectarlos a través de una red.

> **ACTIVIDAD 3** Transforma los contenedores anteriores en imágenes. Puedes usar el comando `docker commit` para ello. Busca información aquí: https://docs.docker.com/reference/cli/docker/container/commit/ 
> Es algo relativamente habitual cuando creas manipulas el contenedor a través de una shell, como estamos haciendo nosotros, y quieres "imprimir" el estado actual para que otros lo usen.
> - Haz una imagen del contenedor FTPS(`proftpd-ftps`) y otra del contenedor SFTP(`proftpd-sftp`).

Una vez tengamos los contenedores, podemos lanzarlos:
```bash
docker run -d --name proftpd -p 21:21 -p 21000-21010:21000-21010 -v ./ftp/conf:/etc/proftpd -v ./ftp/data:/home/ftpuser proftpd-ftps
```
A continuación, lanzamos el contenedor NGINX, bindeando la configuración:
```bash
docker run -d --name nginx -p 80:80 -p 443:443 -v ./nginx/conf:/etc/nginx/conf.d -v ./ftp/data:/usr/share/nginx/html/ nginx:latest
```
Con este *bindeo* `-v ./ftp/data:/usr/share/nginx/html/` le indicamos al servidor nginx que su carpeta de html es la misma que la carpeta donde los datos de nuestro servidor de ftp se descargan.

Cuando lo tenemos todo listo y funcionando, los conectamos mediante una red:

```bash
docker network create mynet
docker network connect mynet proftpd
docker network connect mynet nginx
```
> **NOTA** No olvides hacerlo en modo detached `-d` para poder ejecutar un comando detrás de otro.

> **ACTIVIDAD 4** Haz que colaboren tus tres servidores FTP con el servidor web NGINX. Haz las siguientes pruebas con cada uno de los servidores FTP (FTP, FTPS y SFTP):
- Sube la página web por el servidor FTP usando filezilla.
- Ábrela en el navegador servida por NGINX.

> **ACTIVIDAD 5** Realiza el test de repaso de AULES para comprobar tu conocimiento. Esta vez es de la unidad al completo. Indica en la memoria las preguntas que fallaste la primera vez (fallar no resta puntuación, así que no te preocupes si no te sale muy bien). Repite el test las veces que necesites.
