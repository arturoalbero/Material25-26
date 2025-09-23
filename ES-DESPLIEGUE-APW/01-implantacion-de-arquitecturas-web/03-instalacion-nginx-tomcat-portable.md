# Instalación básica de NGINX y TOMCAT portables en Windows

En esta práctica vamos a lanzar un servidor web y un servidor de aplicaciones portable. Portable significa que no necesitan instalarse en el ordenador y, por lo tanto, pueden lanzarse desde cualquier sistema compatible. Tampoco necesitan permisos de administrador.

> Para la práctica, debes documentar todos los pasos realizados dentro de la memoria. Finalmente, debes comprimir la carpeta servidores_portables y después, comprimirlo todo en un solo archivo que sea la entrega. Se revisará el archivo de configuración del nginx, el de tomcat y que se hayan creado bien las variables de entorno de tomcat.

## 1. Preparación del entorno

El primer paso es crear una carpeta donde tengamos permisos de escritura y lectura. En esa carpeta meteremos los servidores que vamos a emplear. Por ejemplo, en la carpeta Documents podemos crear una carpeta para la práctica:

```
C:\Users\[USUARIO]\Documents\servidores_portables\
```
Es recomendable abrir en VS CODE la carpeta en la que vamos a trabajar, para modificar o crear archivos según lo necesitemos. El siguiente paso es descargar el servidor web y el servidor de aplicaciones. Usaremos NGINX y TOMCAT.

* **Nginx portátil**: descarga la **versión Windows** (zip) desde [https://nginx.org/en/download.html](https://nginx.org/en/download.html). Extrae en:

```
C:\Users\[USUARIO]\Documents\servidores_portables\nginx[version]\
```
(Puedes usar el nombre que viene por defecto)

Para comprobar que has bajado la versión de Windows, métete en la carpeta y asegúrate de que está el archivo .exe.

* **Tomcat portátil**: descarga Apache Tomcat (zip) desde [https://tomcat.apache.org/download-10.cgi](https://tomcat.apache.org/download-10.cgi) (elige *Core: zip*). Puedes elegir cualquier versión, en este caso el enlace te lleva a las descargas de la versión 10, pero también están disponibles la 9 y la 11. Extrae en una carpeta, por ejemplo:

```
C:\Users\[USUARIO]\Documents\servidores_portables\tomcat\
```

(Puedes usar el nombre que viene por defecto, que será apache-tomcat o algo así)

## 2. Configuración de Nginx (web server)

Lo primero es configurar el servidor web. Abre el archivo `conf\nginx.conf` con un editor de texto.

```
C:\Users\[USUARIO]\Documents\servidores_portables\nginx\conf\nginx.conf
```

Editamos el bloque `server` básico para usar un puerto que **no requiera admin** (ej. 8080 en lugar de 80). Los puertos inferiores a 1024 requieren permisos de administrador:

```nginx
server {
      listen       **8080; <- Aquí pondrá 80, lo cambias**
      server_name  localhost;

      location / {
         root   html;
         index  index.html index.htm;
      }

}
```
El cambio que hemos realizado es `listen 8080;` → Nginx responderá en `http://localhost:8080`.

Ejecuta nginx.exe para comprobar que funciona. Ejecuta desde el terminal de windows por si has cometido algún error, ya que te saldrá en la consola.

Te debería salir la página de bienvenida de nginx. El contenido html que ejecuta el servidor web se encuentra en la carpeta `C:\Users\[USUARIO]\Documents\servidores_portables\nginx\html\`. 

El servidor se cierra si cerramos la ventana del terminal donde se esté ejecutando o con el administrador de tareas si usamos directamente el exe en el escritorio.

> **Actividad:**
> Corre .nginx y crea un index.html personalizado, para que se ejecute en lugar del index que viene por defecto.

## 3. Configuración de Tomcat (app server)

Lo siguiente es configurar el servidor de aplicaciones. Ve a la carpeta `   C:\Users\[USUARIO]\Documents\servidores_portables\tomcat\conf\` y edita el archivo `server.xml`. Cambia el puerto del conector HTTP a **8081** (para que no choque con el que le habíamos dado a Nginx). Busca la etiqueta `<Connector>` y edita lo siguiente:

```xml
<Connector port="8081" protocol="HTTP/1.1"
            connectionTimeout="20000"
            redirectPort="8443" />
```

Para comprobar que funciona, coloca alguna aplicación de prueba en Tomcat. Las aplicaciones se deben guardar en `C:\Users\[USUARIO]\Documents\servidores_portables\tomcat\webapps\`. Ahí dentro, crea una carpeta `miapp` y pon un archivo `index.jsp` con algo simple:

```jsp
<html>
<body>
   <h1>Hola desde Tomcat portable!</h1>
   <p>Tiempo actual: <%= new java.util.Date() %></p>
</body>
</html>
```

Recuerda que en jsp, la etiqueta `<% %>` sirve para iniciar un *scriplet* y la etiqueta `<%= %>` equivale a hacer un `out.println("loquesea")`. En este caso, estamos sacando la fecha actual.

Ejecuta ahora el servidor de tomcat. Para ello, abre un terminal y ejecuta el archivo `C:\Users\[USUARIO]\Documents\servidores_portables\tomcat\bin\startup.bat`.

Nos daremos cuenta de que, si no tenemos Java instalado en el ordenador, tenemos que decirle a tomcat donde se encuentra. Podemos bajar la última versión de java (la 25) y añadirla a nuestra carpeta. Bajamos la versión comprimida para Windows desde la [página oficial](www.oracle.com/java/technologies/downloads) y la añadimos a la práctica en su propia carpeta `C:\Users\[USUARIO]\Documents\servidores_portables\jdk-25`.

Ahora creamos el archivo setenv.bat dentro de la carpeta bin, con la siguiente línea:

```bat
set "JAVA_HOME=[la dirección de nuestro java]"
```

Para obtener la dirección de nuestro java, podemos hacer click derecho y copiar directamente el camino. Recuerda quitar las comillas de la dirección. Una vez hecho esto, volvemos a ejecutar el tomcat y ya debería funcionar. Para pararlo, cerramos la ventana del terminal.

Si accedemos a `http://localhost:8081` veremos la página de bienvenida de Tomcat y si accedemos a `http://localhost:8081\miapp` la página jsp que hemos creado.




