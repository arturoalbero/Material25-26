# 6.1 Introduction to Data Access. Initial H2 Configuration in Spring

## 1. Introduction to Data Access

### 1.1. Key Terminology

Before starting to work with data access, we must define several concepts:

* **Persistence**: The ability of an application to store information in a stable way so that it remains available after execution ends or the system is restarted.

* **Repository**: A layer or component that encapsulates data access logic, providing operations to query, save, update, and delete information without exposing the internal details of the data source.

* **Relational Databases vs NoSQL Databases**:

  * Relational databases organize information into tables with defined relationships and use SQL as the query language.
  * NoSQL databases allow more flexible data models (documents, key-value, graphs, columns) and are designed to handle large volumes of data and high scalability.

* **JDBC**: A Java API that allows connections to relational databases through specific drivers, execution of SQL queries, and manual, fine-grained handling of results.

* **Hibernate and Object-Relational Mapping (ORM)**: A framework that automates the conversion between Java objects and relational database structures, reducing the need to write explicit SQL and managing aspects such as transactions, relationships, and caching.

* **JPA**: A standard specification that defines how an ORM should work in Java, providing annotations and a common API that different providers (such as Hibernate) implement.

* **Spring Data**: A set of Spring modules that simplify data access by providing generic repositories, automatically derived queries, and integrated support for various storage technologies.


### 1.2 Database Management System (DBMS)

Spring supports a wide variety of DBMSs, both relational and non-relational. In these chapters, we will use H2 and MySQL.

* **H2**:
  A relational database engine written in Java, lightweight and widely used for development and testing. It can run in memory (fast, ephemeral), in embedded/file mode (persistent), or as a TCP server. It supports standard SQL, ACID transactions, and compatibility modes (e.g., MySQL, PostgreSQL) to facilitate migration and testing.

  It integrates easily with Spring via the JDBC driver `org.h2.Driver` and URLs such as `jdbc:h2:mem:testdb` (memory) or `jdbc:h2:file:./data/testdb` (file). It includes a web console for ad-hoc queries and fast startup with no external dependencies, making it ideal for unit tests and development environments.

* **MySQL**:
  A very popular and mature client-server relational database management system, optimized for web applications and common read/write workloads. It implements storage engines (mainly InnoDB) that provide ACID support, row-level locking, indexes, foreign keys, stored procedures, and native replication (master–slave replication, replica groups, etc.).

  It can scale horizontally and vertically through replicas, sharding, and community/third-party tools. In Java applications, the driver `com.mysql.cj.jdbc.Driver` is used with URLs such as `jdbc:mysql://host:3306/dbname?serverTimezone=UTC&useSSL=false`. It is suitable for production environments, with a broad ecosystem (administration tools, connectors, hosting) and operational considerations such as backups, index tuning, and security/user configuration.

H2 is mainly used in development and testing because it is a lightweight, fast, and easy-to-integrate engine; it can run in memory or be embedded within the application itself, allowing immediate startup and a controlled environment for testing without relying on external services.

However, this simplicity means that its persistence is limited, its performance is not designed for real high concurrency, and its SQL compatibility, although good, does not always fully match that of production engines. Even so, its easy integration with Spring makes H2 a very convenient tool for working without installations, connections, and other extra steps.

In contrast, MySQL is designed for production environments: it runs as an independent service (therefore requiring installation and a service connection), offers robust persistence, handles large volumes of data, and is optimized to support multiple concurrent users. In addition, it provides a broad ecosystem of tools, replication options, advanced administration, and a stable SQL dialect that serves as a reference in commercial applications.

To work with MySQL or any non-embedded database, we can launch it using Docker and connect to it from our application.


### 1.3 JdbcTemplate

`JdbcTemplate` is a class that facilitates and simplifies database access using JDBC. It transparently manages the connection to the database, provides methods to execute SQL queries easily, and converts the retrieved rows into domain objects:

```java
@Autowired private JdbcTemplate jdbcTemplate;

@Override
public int add(Product p){
    return jdbcTemplate.update(
        "INSERT INTO product (name, price) VALUES (?, ?)",
        new Object[]{p.getName(), p.getPrice()}
    );
}

@Override
public Product findById(Long id){
    try{
        Product p = jdbcTemplate.queryForObject(
            "SELECT * FROM product WHERE id = ?",
            BeanPropertyRowMapper.newInstance(Product.class),
            id
        );
        return p;
    }catch(IncorrectResultSizeDataAccessException e){
        return null;
    }
}
```


## 2. Initial H2 Configuration in Spring Boot

To work with H2 in our Spring Boot projects, we do not need to install additional software, but we must perform the following configuration steps:

### 1. **Add H2 to the project**

We must add the `starter-jpa` dependency and the database dependency we are going to use to the `pom.xml` file.

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

Maven allows adding multiple database managers in the `pom.xml` and using a different one in each environment, for example H2 in development and MySQL in production. This is done using the `<profile>` and `<scope>` tags.

```xml
<profiles>

    <!-- DEV profile with H2 -->
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

    <!-- PROD profile with MySQL -->
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


### 2. **H2 Database Configuration**

By default, Spring Boot configures the application with in-memory storage (not on disk) and an administrator user named `sa` with an empty password. We add these parameters to the project’s `application.properties` file:

```properties
spring.datasource.url=jdbc:h2:mem:databaseName
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

From the H2 console, we could change the password of the `sa` user using the SQL statement:
`ALTER USER sa SET PASSWORD 'newpassword';`

If we want to work with disk persistence and not lose data when closing the project, we would change the first line to
`spring.datasource.url=jdbc:h2:file:./path/databaseName`
to store it at the specified path. This will generate two files: `databaseName.mv.db` and `databaseName.trace.db`. By starting the path with a dot, the folders in the path will be created relative to the current directory, that is, the project root.

By default, each time the application starts (either in memory or in file mode), the database will be recreated. Therefore, when development reaches a stable phase and we do not want any schema changes to occur at startup, we add the property
`spring.jpa.hibernate.ddl-auto=none`.

Other possible values are:

* `create` (creates the database from scratch each time),
* `create-drop` (creates the database at startup and drops it on shutdown),
* `validate` (checks for differences between the database and the application classes, throwing an exception if any are found),
* `update` (applies changes without deleting tables or columns).

Another useful property, especially during development, enables SQL queries executed by the platform to appear in the log. To do this, we add:
`spring.jpa.show-sql=true`.

Conversely, in a production environment, to prevent execution traces from appearing in the logs and to disable remote access, we can set the following two variables:

```properties
spring.h2.console.settings.trace=false
spring.h2.console.settings.web-allow-others=false
```


### 3. **Database Schema Creation**

As mentioned above, by default Hibernate recreates the database schema on each execution. Another option, if we want to create the schema manually, is to add a script called `schema.sql` with the schema definition (DDL) in the `src/main/resources` folder of the project. We must set the following properties:

```properties
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
```

In any case, we can always execute that script directly against the database manager. We must also be careful with the order in which tables are created in the script, due to dependencies between them (foreign keys).

> **TIP:** You can create the tables first and then add foreign keys using `ALTER TABLE`. This way, you do not need to be as careful with the table creation order. This method is **mandatory** when relationships are reflexive (the foreign key references the same table).


### 4. **Database Initialization**

When the project starts, we can initialize the different tables by inserting data into them. This is done using an SQL script (with INSERT statements) called `data.sql` located in the `/src/main/resources` folder of the project. We can change this default behavior from the properties file so that the initial load is not performed by setting `spring.sql.init.mode=never`.

As we will see later, Hibernate will create the table schema from the entities (classes) defined in the project during initialization.

Since Spring version 2.5, the `data.sql` file is executed before Hibernate initialization, which may cause an error if inserts are attempted before the tables are created. To change this behavior so that initialization occurs in the opposite order, we must add
`spring.jpa.defer-datasource-initialization=true`
and also set `spring.sql.init.mode=always` again.

This way, table data is loaded after the schema is generated by Hibernate. On the other hand, using `data.sql` and `schema.sql` simultaneously is often problematic. Care must be taken when initializing data if we work with disk persistence and do not recreate the database on each execution, as duplicate inserts may occur. Something similar applies to schema creation: in a production environment, it should be done only once and very carefully.


### 5. **Accessing the H2 Console**

This database manager provides a graphical console to view database contents and execute SQL statements. By default, the console is not enabled; to enable it, we must add the property
`spring.h2.console.enabled=true`.

Once the project is running, we can access the console from a browser at the application’s `/h2-console` path. Assuming our server runs on port 9000, we would access it at
`http://localhost:9000/h2-console`
using the same credentials defined in the properties file.


> **ACTIVITY (mini project):** Create a small application to assign tasks to students. The database has two entities, STUDENT (**id**, name) and TASK (**id**, description). Configure the application to use H2 in Spring Boot.
>
> * Configure H2 appropriately.
> * Generate a `schema.sql` file and a `data.sql` file that create the schema and insert data into H2.
>
>   * ***A student can have zero or many assigned tasks, and an assigned task can have one or many students.***
> * Check the database in the H2 console.


<details>
<summary>

***Complete example of an `application.properties` file***

</summary>

```properties
# H2 configuration
spring.datasource.url=jdbc:h2:mem:mydb
# to create it on disk
#spring.datasource.url=jdbc:h2:file:./path/databaseName

# to create it each time (with new changes)
spring.jpa.hibernate.ddl-auto=create
# to make no changes, only validate that the DB structure matches the classes
#spring.jpa.hibernate.ddl-auto=validate
#
# to create the DB from a schema.sql file
#spring.jpa.hibernate.ddl-auto=none
#spring.sql.init.mode=always

spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Show SQL operations in console log
spring.jpa.show-sql=true

# Allow access to the H2 console
spring.h2.console.enabled=true

# In production, do not show information
#spring.h2.console.settings.trace=false
#spring.h2.console.settings.web-allow-others=false
```

</details>


