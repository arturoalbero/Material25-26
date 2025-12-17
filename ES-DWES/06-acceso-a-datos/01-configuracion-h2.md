# 6.1 Acceso a datos. Configuración inicial de H2 en Spring

## 1. Introducción

### 1.1. Terminología clave

Antes de empezar a trabajar con el acceso a datos, debemos definir varios conceptos:

* **Persistencia**: Capacidad de una aplicación para almacenar información de forma estable, de modo que siga disponible después de finalizar la ejecución o reiniciarse el sistema.

* **Repositorio**: Capa o componente que encapsula la lógica de acceso a datos, proporcionando operaciones para consultar, guardar, actualizar y eliminar información sin exponer los detalles internos de la fuente de datos.

* **Bases de datos relacionales vs Bases de datos NoSQL**:

  * Las bases de datos relacionales organizan la información en tablas con relaciones definidas y utilizan SQL como lenguaje de consulta.
  * Las bases de datos NoSQL permiten modelos de datos más flexibles (documentos, clave-valor, grafos, columnas) y están orientadas a manejar grandes volúmenes de información y alta escalabilidad.

* **JDBC**: API de Java que permite conectarse a bases de datos relacionales mediante drivers específicos, ejecutar consultas SQL y manejar resultados de forma manual y detallada.

* **Hibernate y el mapeo objeto-relacional (ORM)**: Framework que automatiza la conversión entre objetos Java y estructuras de una base de datos relacional, reduciendo la necesidad de escribir SQL explícito y gestionando aspectos como transacciones, relaciones y caché.

* **JPA**: Especificación estándar que define cómo debe funcionar un ORM en Java, ofreciendo anotaciones y una API común que distintos proveedores (como Hibernate) implementan.

* **Spring Data**: Conjunto de módulos de Spring que simplifican el acceso a datos proporcionando repositorios genéricos, consultas derivadas automáticamente y soporte integrado para diversas tecnologías de almacenamiento.


### 1.2 Sistema Gestor de Bases de Datos (SGBD)

Spring soporta multitud de SGBD, tanto relacionales como no relacionales. En estos capítulos emplearemos H2 y MySQL.

* **H2**:
  Motor de base de datos relacional escrito en Java, ligero y muy usado para desarrollo y testing. Puede ejecutarse en memoria (rápido, efímero) o en modo embebido/archivo (persistente) o como servidor TCP. Soporta SQL estándar, transacciones ACID y modos de compatibilidad (p. ej. MySQL, PostgreSQL) para facilitar la migración y pruebas. 
  
  Se integra fácilmente con Spring mediante el driver JDBC `org.h2.Driver` y URLs como `jdbc:h2:mem:testdb` (memoria) o `jdbc:h2:file:./data/testdb` (archivo). Incluye consola web para consultas ad-hoc y arranque rápido sin dependencia externa, lo que lo hace ideal para pruebas unitarias y entornos de desarrollo.

* **MySQL**:
  Sistema gestor de bases de datos relacional cliente-servidor muy popular y maduro, optimizado para aplicaciones web y cargas de lectura/escritura comunes. Implementa motores de almacenamiento (principalmente InnoDB) que proporcionan soporte ACID, bloqueo a nivel de fila, índices, claves foráneas, procedimientos almacenados y replicación nativa (replicación maestro-esclavo, grupos de réplicas, etc.). 
  
  Escalable horizontal y verticalmente mediante réplicas, [sharding](https://www.unir.net/revista/ingenieria/sharding/) y herramientas de la comunidad/terceros. En aplicaciones Java se utiliza el driver `com.mysql.cj.jdbc.Driver` y URLs tipo `jdbc:mysql://host:3306/nombredb?serverTimezone=UTC&useSSL=false`. Es apropiado para entornos de producción, con amplio ecosistema (herramientas de administración, conectores, hosting) y consideraciones operativas como backups, tuning de índices y configuración de seguridad/usuarios.

H2 se utiliza principalmente en desarrollo y pruebas, ya que es un motor ligero, rápido y fácil de integrar; puede ejecutarse en memoria o embebido dentro de la propia aplicación, lo que permite un arranque inmediato y un entorno controlado para testear sin depender de servicios externos. 

Sin embargo, esta simplicidad implica que su persistencia es limitada, su rendimiento no está orientado a alta concurrencia real y su compatibilidad con SQL, aunque buena, no siempre coincide totalmente con la de motores usados en producción. Aun así, su fácil integración en Spring convierten a H2 en una herramienta muy cómoda para trabajar evitando instalaciones, conexiones y otros pasos extra.

Por el contrario, MySQL está pensado para entornos productivos: se ejecuta como un servicio independiente (por lo que requiere instalación y conexión al servicio), ofrece persistencia robusta, maneja grandes volúmenes de datos y está optimizado para soportar múltiples usuarios concurrentes. Además, cuenta con un amplio ecosistema de herramientas, opciones de replicación, administración avanzada y un dialecto SQL estable que sirve como referencia en aplicaciones comerciales. 

Para trabajar con MySQL o cualquier base de datos no integrada, podemos lanzarla a través de Docker y conectarnos a ella desde nuestra aplicación.

### 1.3 JDBCTemplate

JDBCTemplate es una clase que facilita y simplifica el acceso a base de datos mediante JDBC. Se encarga de establecer la conexión con la base de datos de forma transparente, ofrece métodos para realizar consultas SQL de forma sencilla y convierte las filas recibidas a objetos de nuestro dominio:
```java
@Autowired private JdbcTemplate jdbcTemplate;

@Override
public int añadir(Producto p){
    return jdbcTemplate.update("INSERT INTO producto (nombre, precio) VALUES(?,?)",
        new Object[]{p.getNombre(), p.getPrecio()});
}

@Override
public Producto obtenerPorClave(Long id){
    try{
        Producto p = jdbcTemplate.queryForObject("SELECT * FROM producto WHERE id = ?",BeanPropertyRowMapper.newInstance(p.class), id);
        return p;
    }catch(IncorrectResultSizeDataAccessException e){return null;}
}
```

## 2. Configuración inicial de H2 en Spring Boot

Para poder trabajar con H2 en nuestros proyectos Spring Boot no necesitamos instalar software adicional, pero deberemos realizar la siguiente configuración:

1. **Agregar H2 al proyecto**: debemos añadir al fichero `pom.xml` las dependencias `starter-jpa` y la base de datos con la que trabajaremos. 
```xml
    <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
    <dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>    
		</dependency>
```

Maven permite añadir incluso varios gestores de bases de datos diferentes en el `pom.xml` y emplear uno en cada entorno, por ejemplo H2 en desarrollo y MySQL en producción. Se hace mediante las etiquetas `<profile>` y `<scope>`.
```xml
<profiles>

    <!-- Perfil DEV con H2 -->
    <profile>
        <id>dev</id>
        <dependencies>
            <dependency>
                <groupId>com.h2database</groupId>
                <artifactId>h2</artifactId>
                <scope>runtime</scope>
            </dependency>
        </dependencies>
    </profile>

    <!-- Perfil PROD con MySQL -->
    <profile>
        <id>prod</id>
        <dependencies>
            <dependency>
                <groupId>com.mysql</groupId>
                <artifactId>mysql-connector-j</artifactId>
                <scope>runtime</scope>
            </dependency>
        </dependencies>
    </profile>

</profiles>
```

2. **Configuración de la base de datos H2**: por defecto, Spring Boot configura la aplicación con almacenamiento en memoria (no en disco) y con un usuario administrador llamado `sa` con contraseña vacía. Añadiremos estos parámetros al fichero `application.properties` del proyecto.

```
spring.datasource.url=jdbc:h2:mem:nombreBD
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

Desde la consola de H2 podríamos cambiar la contraseña del usuario `sa` mediante la instrucción SQL: `ALTER USER sa SET PASSWORD 'newpassword';`

En caso de querer trabajar en disco y no perder los datos al cerrar el proyecto cambiaríamos la primera línea por `spring.datasource.url=jdbc:h2:file:./ruta/nombreBD` para almacenarlo en la ruta especificada. Generará dos archivos: nombreBD.mv.db y nombreBD.trace.db. Al empezar la ruta por punto, creará las carpetas de la ruta a partir del directorio actual, es decir, de la raíz del proyecto.

Por defecto, cada vez que se inicia la aplicación (sea en memoria o en fichero), la base de datos será recreada por lo que, cuando el desarrollo llegue a una fase estable, si no queremos que se lleve ningún cambio sobre el esquema cada ve que arranquemos la aplicación añadiremos la propiedad `spring.jpa.hibernate.ddl-auto = none`. Otros valores son `create` (crea la base de datos de nuevo cada vez), `create-drop` (crea la base al inicializar y la destruye al salir), `validate` (revisa si hay diferencias entre la base de datos y las clases de la aplicación provocando una excepción en caso afirmativo) y `update` (actualiza cambios sin borrar tablas ni columnas).

Otra propiedad interesante, sobre todo en tiempo de desarrollo, es la que indica que aparezcan en el log las consultas SQL que realice la plataforma. Para ello, añadimos `spring.jpa.show-sql=true`.

Por el contrario, en un entorno de producción podemos establecer, para evitar que se muestren en el log `trazas` de sus ejecuciones y para deshabilitar el acceso remoto, las siguientes dos variables:
```
spring.h2.console.settings.trace=false
spring.h2.console.settings.web-allow-others=false
```

3. **Creación del esquema de la base de datos**: como acabamos de comentar, Hibernate por defecto, recrea el esquema de la base de datos en cada ejecución. Otra opción que tenemos es que, si queremos crear el esquema de forma manual, podemos añadir un script al que llamaríamos `schema.sql` con la definición del esquema (DDL) en la carpeta `src/main/resources` del proyecto. Debemos tener las siguientes propiedades:

```
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
```

De todas formas, siempre podemos ejecutar ese script, directamente contra el gestor de base de datos. También hay que ser cuidadosos en el orden de creación de tablas en el script, por las dependencias entre unas y otras (claves ajenas).

> **CONSEJO:** Puedes crear las tablas primero y, mediante `ALTER TABLE`, añadir las claves ajenas después. De esta forma, no hace falta ser tan cuidadoso con el orden de creación de las tablas. Este método es **obligatorio** cuando las relaciones son reflexivas (la clave ajena apunta a la misma tabla).

4. **Inicialización de la base de datos:** en el momento que arranque el proyecto podemos hacer la inicialización de las distintas tablas añadiendo datos a las mismas. Lo haríamos mediante un script de sentencias SQL (mediante INSERT) al que llamaríamos `data.sql` en la carpeta `/src/main/resources` del proyecto. Podemos cambiar este comportamiento por defecto desde el archivo de propiedades para que no se realice la carga inicial modificando `spring.sql.init.mode=never`. Como veremos más adelante, Hibernate creará el esquema de tablas a partir de las entidades (clases) definidas en el proyecto en la inicialización del mismo. 

Desde la versión 2.5 de Spring, el archivo `data.sql` se ejecuta antes de la inicialización de Hibernate por lo que se podría producir un error al tratar de insertar antes de tener las tablas creadas. Para cambiar este comportamiento y que la inicialización sea en el orden contrario debemos añadir `spring.jpa.defer-datasource-initialization=true` además de volver a `always` la propiedad que permite la ejecución de scripts con `spring.sql.init.mode=always`.

Así hacemos la carga de las tablas después de la creación del esquema generador por Hibernate. Por otra parte, el uso simultáneo de data.sql y schema.sql suele ser problemático. Hay que tener cuidado con la inicialización con datos si trabajamos con persistencia en disco y sin recrear la base de datos en cada ejecución ya que podría insertar duplicados. Algo parecido con la creación del esquema, en un entorno de producción debería hacerse una sola vez y de forma cuidadosa.

5. **Acceso a la consola H2:** ese gestor de base de datos tiene una consola en entorno gráfico para ver el contenido de la base de datos y ejecutar sentenciasl SQL. Por defecto, la consola no está habilidada; para habilitarlo debemos añadir la propiedad `spring.h2.console.enabled=true`. Una vez arrancado el proyecto podemos acceder a la consola desde un navegador, en la ruta /h2-console de la aplicación. Suponiendo que nuestro servidor corre en el puerto 9000, accederíamos mediante `http://localhost:9000/h2-console` con las mismas credenciales incluidas en el archivo de propiedades.

> **ACTIVIDAD (mini proyecto):** Crea una aplicación pequeña para asignar tareas a estudiantes. La base de datos tiene dos entidades, ESTUDIANTE(**id**, nombre) y TAREA(**id**, descripcion). Configura la aplicación para usar H2 en Spring Boot.
> - Configura H2 de forma adecuada.
> - Genera un archivo schema.sql y un archivo data.sql que creen el esquema e inserten datos en H2.
>   - ***Un estudiante puede tener cero o muchas tareas asignadas y una tarea asignada puede tener uno o muchos estudiantes asignados.***
> - Comprueba la base de datos en la consola de H2.

<details>
<summary>

***Ejemplo completo de un archivo `application.properties`***

</summary>

```properties
#configuración H2
spring.datasource.url=jdbc:h2:mem:mydb
#para crearla en disco
#spring.datasource.url=jdbc:h2:file:./ruta/nombreBD

#para crearla cada vez (con nuevos cambios)
spring.jpa.hibernate.ddl-auto = create 
#para no hacer cambios,solo validar que la estructura BD igual a las clases
#spring.jpa.hibernate.ddl-auto = validate     
#
#Para crear la BD desde un archivo schema.SQL
#spring.jpa.hibernate.ddl-auto=none
#spring.sql.init.mode=always

spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

#Mostarar operaciones SQL en log consola 
spring.jpa.show-sql=true

#Permitir acceso a la consola H2
spring.h2.console.enabled=true

#En producción, no mostrar información
#spring.h2.console.settings.trace=false
#spring.h2.console.settings.web-allow-others=false
```
</details>
