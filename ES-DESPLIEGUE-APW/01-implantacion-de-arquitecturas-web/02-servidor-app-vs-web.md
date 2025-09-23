# Servidores web y servidores de aplicaciones

> **Criterios de evaluación:** 1c, 1d, 1g, 1h, 1i

## 1. Servidores Web

Un **servidor web** es un programa informático diseñado para servir contenido estático a los clientes a través del protocolo HTTP. Su función principal es recibir peticiones de navegadores web y entregar archivos como HTML, CSS, JavaScript e imágenes. Un servidor web es altamente eficiente en esta tarea, optimizando la entrega para miles de conexiones simultáneas con bajo consumo de recursos.

### 1.1. NGINX

**Nginx** es un servidor web y proxy inverso de alto rendimiento. Se distingue por su arquitectura asíncrona y orientada a eventos, lo que le permite manejar una gran cantidad de conexiones concurrentes de manera eficiente, sin crear un nuevo proceso o hilo para cada una. Esto lo convierte en una opción ideal para sitios web con mucho tráfico y para actuar como una capa intermedia entre los usuarios y los servidores de aplicaciones. A menudo, Nginx se utiliza para servir el contenido estático de una aplicación (como el *frontend*) y redirigir las peticiones dinámicas a un servidor de aplicaciones.

### 1.2. Proxy y Proxy Inverso

La palabra proxy viene del latín procuratio, que significa "administración" o "gestión en nombre de otro". Este término, a su vez, se deriva de procurator, que se refiere a un "administrador" o "agente".

En el contexto informático, el uso de "proxy" para describir un servidor intermediario que actúa en nombre de un cliente se basa directamente en este significado. El servidor proxy "procura" o "gestiona" la conexión por ti, actuando como tu representante.

Un **proxy** es un servidor que actúa como intermediario entre un cliente (como un navegador) y otro servidor. Su función principal es reenviar las peticiones de los clientes a Internet. Cuando un cliente se conecta a un servidor a través de un proxy, es el proxy quien realiza la solicitud al destino final. La respuesta del servidor web primero llega al proxy y luego es enviada al cliente. Un proxy se utiliza comúnmente para filtrar contenido, mejorar la seguridad, o para mantener el anonimato del cliente. 

Por otro lado, un **proxy inverso** actúa también como intermediario, pero su rol es el opuesto: protege y representa a uno o más servidores de destino, no al cliente. El cliente hace una petición a un servidor proxy inverso, y este servidor decide a qué servidor backend (o servidor de origen) la envía. La respuesta del servidor backend es luego reenviada al cliente a través del proxy inverso.

Los usos más comunes de un proxy inverso son:

- Balanceo de carga: Distribuye las peticiones entre múltiples servidores para evitar la sobrecarga de uno solo.

- Seguridad: Oculta la dirección IP y la arquitectura interna de los servidores backend, actuando como una capa de protección.

- Caching: Almacena en caché las respuestas estáticas para reducir la carga de los servidores de origen y acelerar la entrega de contenido.

- Manejo de SSL/TLS: Descarga la tarea de encriptación de los servidores backend.
-   -   SSL: Segure Socket Layers. Protocolo criptográfico de la capa de transporte.
-   -   TLS: Transport Layer Security, evolución de TLS.

La diferencia fundamental entre un proxy y un proxy inverso reside en quién se beneficia del servicio y a quién representa el proxy.

- **Un proxy representa al cliente** y opera en su nombre para acceder a recursos externos.

- **Un proxy inverso representa a los servidores de origen** y enmascara su identidad para los clientes, actuando como un punto de entrada centralizado.

## 2. Servidores de Aplicaciones

Un **servidor de aplicaciones** es un *framework* de software que proporciona un entorno de ejecución para la lógica de negocio de las aplicaciones. A diferencia de un servidor web, su propósito no es solo servir archivos, sino procesar peticiones complejas, interactuar con bases de datos, y generar contenido dinámico. Un servidor de aplicaciones puede estar optimizado para un lenguaje de programación específico, como Java, Python o Node.js.

### 2.1. Tomcat

**Tomcat** es un servidor de aplicaciones de código abierto para Java. Proporciona un entorno para ejecutar servlets, JavaServer Pages (JSP) y otras tecnologías de la plataforma Java. Tomcat recibe una petición, la procesa utilizando la lógica de negocio de la aplicación (por ejemplo, consultando una base de datos) y genera una respuesta, que a menudo es HTML. El uso de IntelliJ Ultimate simplifica el proceso de despliegue y depuración de aplicaciones Java directamente en un servidor Tomcat.

### 2.2. Pila AMP. Uso de XAMPP

La **pila AMP** (Apache, MySQL, PHP) es un conjunto de software de código abierto que se utiliza para el desarrollo de aplicaciones web dinámicas. Es una de las combinaciones más populares para la creación de sitios web.
* **A**pache: El servidor web encargado de servir las páginas.
* **M**ySQL: El sistema de gestión de bases de datos para almacenar la información.
* **P**HP: El lenguaje de programación de lado del servidor para procesar la lógica de la aplicación.

**XAMPP** es una distribución gratuita y fácil de instalar de esta pila. Simplifica enormemente el proceso de configuración al empaquetar todos los componentes en una sola aplicación ejecutable, lo que permite a los desarrolladores tener un entorno de desarrollo local funcional en cuestión de minutos, sin necesidad de instalar cada componente por separado. Su uso es común en entornos académicos y de aprendizaje, ya que elimina la complejidad de la configuración manual, permitiendo a los estudiantes centrarse en la programación. 


## 3. Diferencias entre Servidor Web y Servidor de Aplicaciones

La diferencia fundamental radica en su propósito.

* Un **servidor web** se especializa en la entrega de **contenido estático**. Actúa como la primera línea de defensa, recibiendo todas las peticiones y respondiendo directamente si la solicitud es para un archivo simple (HTML, CSS, imagen, etc.). Su principal función es la de un cartero muy rápido y eficiente.

* Un **servidor de aplicaciones** se enfoca en el **procesamiento de lógica de negocio y la generación de contenido dinámico**. Es un motor de procesamiento que interpreta código, interactúa con bases de datos y devuelve un resultado. Su rol es el de un cocinero que prepara un plato personalizado a partir de ingredientes (datos).

En una arquitectura de dos niveles, el servidor web y el de aplicaciones colaboran. El servidor web (ej. Nginx) recibe la petición del usuario y, si es para contenido estático, lo entrega. Si la petición requiere una lógica de negocio (por ejemplo, `"/iniciar-sesion"` o `"/productos"`), el servidor web la reenvía al servidor de aplicaciones (ej. Tomcat) como un **proxy inverso**. El servidor de aplicaciones procesa la solicitud, genera el contenido dinámico y lo devuelve al servidor web, que finalmente lo entrega al cliente. Esta separación de roles mejora el rendimiento, la escalabilidad y la seguridad del sistema.
