# Going to production

In the following section we will look at a series of short, but necessary, tasks to give the final touches to our application. We will see the different types of packaging in a theoretical way, but then we will move on to testing, scheduled tasks, the use of Docker within Spring Boot and how to connect to a MySQL database, finally ending with the Cloud Config Server.

## 1. Application distribution: .jar or .war

Once the development of an application is finished, there are still important tasks to carry out such as testing and documentation, which ideally should be done as the application is being developed.

The developed application can be packaged in two different ways, in a .jar file with its own web server or in a .war file, which will need a separate server. During the course we saw how to work with .jar, but if we wanted to work with .war packaging we would need to install Tomcat (or another Java web server) and move the .war file to the /webapps folder.

## 2. Testing applications in Spring Boot

Testing consists of verifying that our applications work correctly. That is, without errors and responding to the required functionalities.

> **ACTIVITY 1:** Unit, integration and functional testing. Look for information about them and how you could implement (conceptually and mentioning some libraries, but without code) each of them. Also look for information about **how to include testing in the project documentation**.

> **ACTIVITY 2:** Complete this [**guide**](https://spring.io/guides/gs/testing-web) on how to implement JUnit integrated in Spring Boot, [**this other one**](https://www.baeldung.com/mockito-annotations) on how to use Mockito and [**this last one**](https://www.baeldung.com/spring-mock-rest-template) on how to use Mockito in REST APIs. You need the `starter-test` dependency which includes JUnit and Mockito.

> **EXPANSION ACTIVITY 1:** Complete this [**guide**](https://www.baeldung.com/spring-mockmvc-vs-webmvctest) to implement MockMvc and compare it with WebMvc.

> **ACTIVITY 3:** Implement tests for all the controllers of MyFavouriteComposer (hybrid version).

> **ACTIVITY 4:** Complete this [**guide**](https://qaautomation.expert/2023/06/26/how-to-run-springboot-tests-with-github-actions/) to implement GitHub Actions in a Spring project.

> **ACTIVITY 5:** Implement continuous integration with GitHub Actions in your MyFavouriteComposer project

## 3. Scheduled tasks in Spring Boot

The automatic execution of programs will allow tasks to be carried out without human intervention, and we can plan them to be executed at specific times.

Typical tasks of this nature are data backup, dumping information into historical repositories, log management, etc. Complete activity 6 to put scheduled tasks into practice.

> **ACTIVITY 6:** Complete this [**guide**](https://spring.io/guides/gs/scheduling-tasks) on how to implement scheduled tasks in Spring Boot.

## 4. Using Docker in Spring Boot

> **ACTIVITY 7:** Complete this [**guide**](https://docs.spring.io/spring-boot/reference/features/dev-services.html#features.dev-services.docker-compose) on how to use Docker within a Spring Boot application. We will use Docker later for the MySQL database.

## 5. Connection to a MySQL database

We can connect to any database with Spring Boot. Spring Data will take care of making how the information is processed and exchanged between the database and the application transparent to development. However, we must configure the connection properly. We need the `spring-data` dependency and the MySQL connector:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.2.0</version>
</dependency>
```

And in the `application.properties` file:

```sh
spring.datasource.url = jdbc:mysql://localhost:3306/databaseName
spring.datasource.username = root
spring.datasource.password = abc123
spring.jpa.hibernate.ddl-auto=create
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql = true
```

It is necessary to have a MySQL server available to connect to. We can create it with Docker or install it on our computer. In the guide for **activity 8** it is explained how to use Docker to implement MySQL in our application:

> **ACTIVITY 8:** Complete this [**guide**](https://spring.io/guides/gs/accessing-data-mysql) on how to use MySQL within a Spring Boot application.

> **ACTIVITY 9:** Replace in MyFavouriteComposer the H2 database with a production-ready database such as MySQL.

## 6. Cloud Config Server

Cloud Config Server is a service responsible for maintaining the configuration of all components of a microservices architecture in a single place, instead of each one having its own within each Spring project.

It manages all configuration through a single repository in a location such as GitHub or GitLab. Complete activity 10 to learn how to use Cloud Config Server.

> **ACTIVITY 10:** Complete this [**guide**](https://www.baeldung.com/spring-mockmvc-vs-webmvctest) on how to use Cloud Config Server.

> **FINAL ACTIVITY:** Submit MyFavouriteComposer ready, with everything worked on so far:
>
> * Hybrid application, with Spring MVC and REST API
> * Application with a continuous integration workflow using GitHub Actions (or similar)
> * Application with MySQL integrated for production, using Docker

> **FINAL EXPANSION:** Complete the final activity by adding:
>
> * Task scheduling
> * Cloud Config Server
