# ACTIVIDAD DE AMPLIACIÓN: Uso de JSP y Jakarta EE en IntelliJ Ultimate

Jakarta EE es una plataforma de programación para desarrollar y ejecutar aplicaciones en lenguaje Java. Entre sus estándares incluye el uso de servlets y de JavaServer Pages (JSP), herramientas para trabajar en la programación de aplicaciones web usando Java.

JSP es similar a PHP, en el sentido que combina el lenguaje HTML con, en este caso, fragmentos de código en Java. En un archivo .jsp, introduce tu código html como harías de forma normal y, cuando requieras algo de java, introduce el código entre `<% %>`. Si deseas imprimir directamente un valor por pantalla, puedes usar `<%= %>`. Al código introducido se lo conoce como `scriptlet`.

A nivel interno, el archivo .jsp se traduce a un archivo .java que emplea un objeto derivado de la clase `HttpServlet` y el escribe todo dentro del método `doGet` a través de un objeto PrintWriter.out. Necesita un servidor web, como Tomcat, para poder funcionar. Vamos a aprender cómo configurarlo fácilmente en IntelliJ IDEA Ultimate Edition. Recuerda que con la licencia educativa puedes acceder de forma gratuita a ese IDE.

Necesitarás:

1.  **IntelliJ IDEA Ultimate Edition:** Asegúrate de que tienes la versión Ultimate, ya que la Community Edition no tiene soporte para Java EE/Web.
2.  **Java Development Kit (JDK):** Necesitas un JDK instalado en tu sistema. Normalmente, IntelliJ lo instala de forma guiada y fácil.
3.  **Apache Tomcat** Descargado y descomprimido en tu sistema. Puedes bajarlo de [aquí](https://tomcat.apache.org/download-11.cgi). Si tienes un Mac o un Linux, baja la versión tar.gz. Guárdalo en una carpeta que te sea accesible.

### Pasos para crear y ejecutar un proyecto JSP en IntelliJ IDEA Ultimate:

#### 1. Crear un Nuevo Proyecto Web

1.  Abre IntelliJ IDEA.
2.  Desde la pantalla de bienvenida, haz clic en **"New Project"**. Si ya tienes un proyecto abierto, ve a `File > New > Project...`.
3.  En el panel izquierdo del asistente "New Project", selecciona **"Jakarta EE"** (o "Java Enterprise" en versiones más antiguas).
4.  En el panel derecho:
    * **Project name:** Dale un nombre a tu proyecto (ej., `MiPrimerJSP`).
    * **Location:** Elige la ubicación donde se guardará tu proyecto.
    * **Build system:** Selecciona **"Maven"** (recomendado para proyectos Java EE modernos) o "Gradle". Para este tutorial, usaremos Maven.
    * **JDK:** Asegúrate de que se selecciona el JDK correcto. Si no tienes uno configurado, haz clic en "Add JDK..." y navega a la ubicación de tu JDK.
    * **Template:** Selecciona **"Web Application"**. Esto creará la estructura básica para una aplicación web, incluyendo un `index.jsp` y `web.xml`.
    * **Dependencies (solo si usas Maven/Gradle):** Por ahora, puedes dejarlo tal cual.

5.  Haz clic en **"Next"**.

#### 2. Configurar el Servidor de Aplicaciones (Tomcat)

1.  En la siguiente pantalla, bajo **"Application Server"**:
    * Haz clic en el botón **"New..."**.
    * Selecciona **"Tomcat Server"**.
    * En la ventana emergente, haz clic en el botón `...` (Browse) y navega a la **carpeta raíz de tu instalación de Apache Tomcat** (donde se encuentran `bin`, `conf`, `lib`, etc.).
    * IntelliJ IDEA detectará la versión de Tomcat. Haz clic en "OK".
    * Asegúrate de que el Tomcat recién configurado esté seleccionado en la lista "Application Server".

2.  En la misma ventana:
    * **Jakarta EE version:** Elige la versión de Jakarta EE que deseas usar. Para la mayoría de los casos, la última versión estable (ej., `Jakarta EE 9` o `10`) estará bien. Si necesitas compatibilidad con versiones antiguas, elige `Jakarta EE 8` (que es el nombre anterior de Java EE 8).
    * **Language:** Deja "Java".
    * **Servlet version:** Deja la versión por defecto o la más reciente (ej., `6.0`).
    * **Generate web.xml:** **Asegúrate de que esta casilla esté marcada.** Es crucial para la configuración de tu aplicación web.

3.  Haz clic en **"Create"**.


#### 3. Explorar la Estructura del Proyecto

IntelliJ IDEA creará el proyecto con una estructura similar a esta si usas Maven:

```
MiPrimerJSP/
├── .idea/                 (Configuración de IntelliJ)
├── src/
│   └── main/
│       ├── java/          (Para tus clases Java, servlets, etc.)
│       └── webapp/        (La raíz de tu aplicación web)
│           ├── WEB-INF/
│           │   └── web.xml   (Descriptor de despliegue)
│           └── index.jsp  (Tu primera página JSP)
└── pom.xml                (Archivo de configuración de Maven)
```

* **`src/main/webapp/`**: Aquí es donde colocarás todos tus archivos JSP, HTML, CSS, JavaScript e imágenes. IntelliJ ya habrá creado un `index.jsp` por defecto.
* **`src/main/webapp/WEB-INF/web.xml`**: Este archivo es el descriptor de despliegue de tu aplicación web. Contiene configuraciones importantes, como la bienvenida, mapeos de servlets, etc.
* **`src/main/java/`**: Si vas a escribir servlets o clases Java que tu JSP va a usar, irán aquí.

#### 4. Modificar el `index.jsp` (Opcional)

Abre el archivo `src/main/webapp/index.jsp`. Verás un código HTML básico. Puedes modificarlo para incluir un poco de código JSP para probar:

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Mi Primer JSP</title>
</head>
<body>
<h1>¡Hola desde JSP en IntelliJ!</h1>
<%-- Código Java dentro de un JSP --%>
<%
    String mensaje = "La fecha actual es: " + new java.util.Date();
    out.println("<p>" + mensaje + "</p>");
%>
</body>
</html>
```

#### 5. Configurar la Ejecución (Run Configuration)

IntelliJ IDEA suele crear automáticamente una configuración de ejecución para Tomcat cuando creas un proyecto web.

1.  Mira en la barra de herramientas superior, cerca de los botones de "Play" (Run) y "Debug". Deberías ver un desplegable con el nombre de tu proyecto (ej., `Tomcat [nombre de tu proyecto]`).
2.  Si no está o quieres verificar la configuración:
    * Haz clic en el desplegable y selecciona **"Edit Configurations..."**.
    * En el panel izquierdo, bajo "Tomcat Server", selecciona **"Local"** (o el nombre de tu configuración).
    * Asegúrate de que en la pestaña **"Server"**:
        * `Application server` apunta a tu instalación de Tomcat.
        * `URL` muestra algo como `http://localhost:8080/[nombre_de_tu_proyecto]_war_exploded` (esto es el "context path" por defecto que usa IntelliJ para el despliegue de desarrollo).
    * En la pestaña **"Deployment"**:
        * Deberías ver una entrada con el nombre de tu proyecto seguido de `_war_exploded`. Esto significa que IntelliJ está desplegando tu proyecto de forma "descomprimida" para un desarrollo rápido.
        * El "Application context" (la URL por la que se accederá) debería ser `/MiPrimerJSP` (o el nombre que le diste a tu proyecto). Si quieres cambiarlo, haz clic en el lápiz al final de la línea.
        * Asegúrate de que está seleccionada la opción `Deploy at startup`.

3.  Haz clic en **"OK"**.

#### 6. Ejecutar el Proyecto

1.  En la barra de herramientas superior, haz clic en el botón verde de **"Play"** (Run) junto al desplegable de la configuración de Tomcat.
2.  IntelliJ IDEA:
    * Construirá tu proyecto (Maven lo compilará y empaquetará).
    * Iniciará el servidor Tomcat.
    * Desplegará tu aplicación web en Tomcat.
    * Automáticamente abrirá tu navegador predeterminado en la URL de tu aplicación (ej., `http://localhost:8080/MiPrimerJSP/`).

Deberías ver tu `index.jsp` renderizado en el navegador.

**Consejos adicionales:**

* **Cambios en JSP:** Si modificas tu archivo `.jsp`, simplemente **refresca tu navegador**. IntelliJ IDEA y Tomcat están configurados para detectar cambios en JSPs sin necesidad de reiniciar el servidor.
* **Cambios en clases Java/Servlets:** Si modificas clases Java (archivos `.java`), necesitarás **recompilar el proyecto** (Build > Rebuild Project) y luego **reiniciar el servidor Tomcat** (puedes detenerlo y volver a iniciarlo con los botones de la barra de herramientas, o usar el botón de "Restart" que aparece a veces).
* **Ventana "Run":** La ventana "Run" (en la parte inferior de IntelliJ) mostrará los logs de Tomcat, lo cual es muy útil para depurar si algo sale mal.
* **Depuración:** Puedes poner puntos de interrupción en tu código Java (incluso en los scriptlets JSP) y ejecutar en modo "Debug" para depurar tu aplicación.
