
# **UNIDAD DIDÁCTICA: Administración de servidores de transferencia de archivos**

**Duración total:** 9 horas (3 sesiones de 3h)
**Última hora:** prueba de evaluación (teórico-práctica)
**Contexto:** Entorno Windows sin permisos de administrador, uso de **FileZilla Server portable**, **FileZilla Client**, **Docker**, **servicios SFTP/FTPS en contenedores**.

**Resultado de aprendizaje:**
*Administra servidores de transferencia de archivos, evaluando y aplicando criterios de configuración que garanticen la disponibilidad del servicio.*

---

# **SESIÓN 1 (3 horas)**

## **Título:** Protocolos de transferencia y despliegue básico de un servidor FTP con FileZilla Server Portable**

---

## **1. Introducción teórica (45 min)**

Contenidos ampliados:

* Función de los protocolos de transferencia de archivos en redes corporativas.
* **FTP**: características, arquitectura, comandos básicos, limitaciones.
* **Modos activo y pasivo:**

  * Diagrama de comunicación.
  * Problemas habituales con firewalls.
* Seguridad: por qué FTP *no* es seguro por defecto.
* Alternativas:

  * **FTPS** (FTP + TLS).
  * **SFTP** (subsistema SSH).
* Clientes disponibles en Windows sin instalación: `ftp` en terminal, **FileZilla Client** portable.

Objetivo: preparar a los alumnos para entender el funcionamiento antes de tocar el servidor.

---

## **2. Entorno de trabajo sin permisos de administrador (15 min)**

* Uso de software portable.
* Restricciones típicas en Windows sin privilegios: apertura de puertos, instalación de servicios, firewall.
* Estrategia: ejecutar FileZilla Server solo para prácticas locales (localhost / red interna), y usar Docker para servicios avanzados.

---

## **3. Instalación y configuración inicial de FileZilla Server Portable (1h 15 min)**

Actividades:

1. Descargar versión portable y ejecutarla desde una carpeta del usuario.
2. Configuración inicial:

   * Definición del puerto de administración.
   * Ajuste del número de conexiones simultáneas.
   * Carpeta raíz del servidor (home directory).
3. Creación de usuarios y grupos:

   * Usuario: `alumno01`
   * Grupo: `estudiantes`
   * Asignación de permisos: lectura, escritura, creación de carpetas.
4. Restricciones:

   * Limitar acceso a determinadas carpetas.
   * Configurar “force TLS” (solo teoría en esta primera sesión).
5. Comprobación del acceso:

   * Conexión usando **FileZilla Client**.
   * Pruebas con **cliente CLI** mediante `ftp` en PowerShell o CMD.

Criterios trabajados: **a, b, d**

---

## **4. Verificación de modos activo y pasivo (45 min)**

Debido a las restricciones del firewall sin permisos de administrador, algunas configuraciones no funcionarán externamente, pero sí en entorno local o en red interna controlada.

Actividades:

* Definir rango de puertos pasivos en FileZilla Server (p. ej., 50000–50100).
* Explicación práctica:

  * Qué ocurre si el firewall bloquea los puertos.
  * Cómo se comporta el cliente en modo pasivo en una red local.
* Realización de pruebas:

  * Conexión en modo activo.
  * Conexión en modo pasivo.
  * Análisis de mensajes del log del cliente.

Criterio trabajado: **c**

---

# **SESIÓN 2 (3 horas)**

## **Título:** Seguridad en FTP, FTPS, SFTP y uso de Docker para desplegar servidores avanzados**

---

## **1. Configuración de FTPS en FileZilla Server (45 min)**

Contenidos:

* Diferencias entre FTPS implícito y explícito.
* Certificados TLS: concepto, autofirmados, uso interno.

Actividades:

* Generar un certificado TLS autofirmado desde FileZilla Server.
* Activar FTPS explícito.
* Configurar obligatoriedad de cifrado.
* Conexión desde FileZilla Client y verificación del candado TLS.

Criterio trabajado: **e**

---

## **2. SFTP con Docker (1h)**

Ventajas de usar Docker en sistemas con permisos limitados:

* Contenedores aislados.
* No requiere instalar servicios en Windows.
* Acceso a puertos redirigidos.

Actividades prácticas:

1. Lanzar un contenedor SFTP común, por ejemplo:

   ```powershell
   docker run -p 2222:22 -v %cd%/data:/home/alumno/upload \
      -e SFTP_USERS="alumno:1234" atmoz/sftp
   ```
2. Explicar estructura de directorios interna del contenedor.
3. Conexión desde FileZilla Client usando protocolo SFTP.
4. Subida y descarga de archivos.
5. Análisis del cifrado SSH.

Criterios trabajados: **e, h, d**

---

## **3. FTP en servidores web (WebDAV con Docker) (45 min)**

Aunque no se puede usar IIS en Windows sin permisos, sí podemos usar WebDAV por Docker.

Explicación:

* Diferencias entre FTP y WebDAV.
* Ventajas: acceso desde navegador, autenticación HTTP.

Actividad:

* Levantar un contenedor WebDAV:

  ```powershell
  docker run -d -p 8080:80 \
     -e AUTH_TYPE=Basic -e USERNAME=alumno -e PASSWORD=1234 \
     -v %cd%/webdav:/var/lib/dav \
     bytemark/webdav
  ```
* Comprobar el servicio desde el navegador y desde FileZilla Client (soporta WebDAV).
* Subida de archivos a través del navegador.

Criterio trabajado: **f**

---

# **SESIÓN 3 (3 horas)**

## **Título:** Despliegue avanzado en contenedores, documentación del servicio y prueba final**

---

## **1. FTP/FTPS/SFTP en Docker con diferentes imágenes (45 min)**

Actividades:

* Comparar imágenes de FTP en Docker:

  * `stilliard/pure-ftpd`
  * `fauria/vsftpd`
  * `atmoz/sftp`
* Lanzar contenedores, modificar usuarios mediante variables de entorno.
* Probar puertos, ajustar permisos y carpetas compartidas.
* Explicar por qué Docker permite practicar escenarios inaccesibles desde Windows limitado.

Criterios: **a, h, d**

---

## **2. Documentación técnica del servicio (45 min)**

Producción de un documento (Markdown o Word) con:

* Objetivo del servicio.
* Protocolo usado y justificación.
* Configuración de FileZilla Server.
* Configuración de FTPS.
* Configuración de SFTP en Docker.
* Capturas de pantalla de pruebas de acceso.
* Listado de puertos y modos activo/pasivo.
* Consideraciones de seguridad y buenas prácticas.

Criterio: **g**

---

## **3. PRUEBA FINAL (1 hora)**

### **Parte teórica (5 preguntas cortas)**

1. Diferencias entre FTP, FTPS y SFTP.
2. Explicar cómo funciona el modo pasivo y por qué da problemas con firewalls.
3. ¿Qué es un certificado TLS y por qué es necesario en FTPS?
4. Ventajas de desplegar un servidor de transferencia en Docker.
5. ¿En qué se diferencia FTP de WebDAV?

### **Parte práctica (elegir 1 de estas pruebas):**

**Opción A:**

* Crear un usuario en FileZilla Server.
* Activar modo pasivo con rango de puertos.
* Conectar desde FileZilla Client y demostrar subida de archivo.

**Opción B:**

* Ejecutar un contenedor SFTP con usuario y carpeta compartida.
* Conectarse desde FileZilla Client a través del puerto 2222.
* Subir un archivo y comprobar permisos.

Criterios evaluados: **a, b, c, d, e, h**

---

# **METODOLOGÍA**

* Aprendizaje práctico, orientado a tareas.
* Trabajo por parejas y resolución de problemas reales.
* Exposición breve + práctica inmediata.
* Uso intensivo de Docker como alternativa a restricciones del entorno.

---

# **RECURSOS**

* Windows sin permisos de administrador.
* Software portable:

  * FileZilla Server portable
  * FileZilla Client
* Docker Desktop (preinstalado).
* Navegador web.
* PowerShell / CMD.

---

# **EVALUACIÓN**

* **Prácticas guiadas**: 40%
* **Documentación técnica**: 30%
* **Prueba final**: 30%

---

Si quieres, puedo:
📌 generar **la versión en formato documento (Word/PDF)**,
📌 hacer **las diapositivas** de cada sesión,
📌 preparar **rúbricas de evaluación**,
📌 generar **las hojas de prácticas paso a paso**.
