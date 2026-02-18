# Paso a producción

En el siguiente apartado vamos a ver una serie de tareas cortas, pero necesarias, para dar los últimos toques a nuestra aplicación. Veremos los diferentes tipos de empaquetado de forma teórica, pero después entraremos en el testeo, las tareas programadas, el uso de docker dentro de Spring Boot y cómo conectarnos a una base de datos MySQL, terminando finalmente con el Cloud Config Server.

## 1. Distribución de la aplicación. .jar o .war

Una vez terminado el desarrollo de una aplicación, quedan todavía tareas importantes a realizar como puede ser el testing y la documentación, que de forma ideal deberían realizarse conforme se desarrolla la aplicación.

La aplicación desarrollada puede ser empaquetada de dos formas diferentes, en un archivo .jar con su propio servidor web o en un archivo .war, que necesitará un servidor aparte. Durante el curso vimos cómo trabajar con .jar, pero si quisiéramos trabajar con un empaquetado .war deberíamos instalar tomcat (u otro servidor web de java) y mover el archivo .war a la carpeta /webapps.

## 2. Testeo de aplicaciones en Spring Boot

El testing consiste en verificar que nuestras aplicaciones funcionan correctamente. Esto es, sin errores y respondiendo a las funcionalidades requeridas.

> **ACTIVIDAD 1:** Test de unidad, de integración y de funcionalidad. Busca información sobre ellos y cómo podrías implementar (de forma conceptual y mencionando algunas librerías, pero sin código) cada uno de ellos. Busca información también sobre **como incluir el testeo en la documentación del proyecto**.

> **ACTIVIDAD 2:** Completa esta [**guía**](https://spring.io/guides/gs/testing-web) sobre cómo implementar junit integrado en Spring Boot, [**esta otra**](https://www.baeldung.com/mockito-annotations) sobre cómo utilizar mockito y [**esta última**](https://www.baeldung.com/spring-mock-rest-template) sobre cómo usar mockito en API REST. Necesitas la dependencia `starter-test` que incluye junit y mockito.

> **ACTIVIDAD DE AMPLIACIÓN 1:** Completa esta [**guía**](https://www.baeldung.com/spring-mockmvc-vs-webmvctest) para implementar mockmvc y compararlo con webmvc.

> **ACTIVIDAD 3:** Implementa test para todos los controladores de MyFavouriteComposer (versión híbrida).

> **ACTIVIDAD 4:** Completa esta [**guía**](https://qaautomation.expert/2023/06/26/how-to-run-springboot-tests-with-github-actions/) para implementar Github Actions en un proyecto Spring.

> **ACTIVIDAD 5:** Implementa la integración continua con Github Actions en tu proyecto MyFavouriteComposer

## 3. Tareas programadas en Spring Boot

La ejecución automática de programas va a permitir la realización de tareas sin intervención humana, y podemos planificarlas para que se realicen a horas específicas.

Tareas típicas de esta naturaleza son la copia de datos, el volcado de información a repositorios históricos, la gestión de logs, etc. Completa la actividad 6 para poner en la práctica la realización de tareas programadas.

> **ACTIVIDAD 6:** Competa esta [**guía**](https://spring.io/guides/gs/scheduling-tasks) sobre cómo implementar tareas programadas en Spring Boot.

## 4. Uso de Docker en Spring Boot

> **ACTIVIDAD 7:** Completa esta [**guía**](https://docs.spring.io/spring-boot/reference/features/dev-services.html#features.dev-services.docker-compose) sobre cómo usar Docker dentro de una aplicación Spring Boot. Usaremos Docker más adelante para la base de datos MySQL.

## 5. Conexión a una base de datos MySQL

Podemos conectarnos a cualquier base de datos con Spring Boot. Spring Data se encargará de que cómo se procesa la información y se intercambia entre la base de datos y la aplicación sea transparente para el desarrollo. Sin embargo, debemos configurar la conexión de forma adecuada. Necesitamos la dependencia `spring-data` y el conector con MySQL:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.2.0</version>
</dependency>
```

Y en el archivo `application.properties`:
```sh
spring.datasource.url = jdbc:mysql://localhost:3306/nombreBD
spring.datasource.username = root
spring.datasource.password = abc123
spring.jpa.hibernate.ddl-auto=create
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql = true
```

Es necesario que haya un servidor de MySQL al que se pueda conectar. Lo podemos crear con Docker o instalarlo en nuestro ordenador. En la guía de la **actividad 8** se explica como aprovechar Docker para implementar MySQL en nuestra aplicación:

> **ACTIVIDAD 8:** Completa esta [**guía**](https://spring.io/guides/gs/accessing-data-mysql) sobre cómo usar MySQL dentro de una aplicación Spring Boot.

> **ACTIVIDAD 9:** Sustituye en MyFavouriteComposer la base de datos H2 por una base de datos apta para producción, como es MySQL.

## 6. Cloud Config Server

Cloud Config Server es un servicio que se encarga de mantener la configuración de todos los componentes de una arquitectura de microservicios en un único lugar, en vez de que cada uno tenga la suya dentro de cada proyecto de Spring.

Gestiona toda la configuración mediante un único repositorio en una ubicación como Github o GitLab. Completa la actividad 10 para aprender a utilizar Cloud Config Server.

> **ACTIVIDAD 10:** Completa esta [**guía**](https://www.baeldung.com/spring-mockmvc-vs-webmvctest) sobre cómo usar Cloud Config Server.

> **ACTIVIDAD FINAL:** Entrega MyFavouriteComposer lista, con todo lo trabajado hasta ahora:
> - Aplicación híbrida, con Spring MVC y API REST
> - Aplicación con un workflow de integración continua usando Github Actions (o similares)
> - Aplicación con MySQL integrado para producción, usando Docker

> **AMPLIACIÓN FINAL:** Completa la actividad final añadiendo:
> - Planificación de tareas
> - Cloud Config Server