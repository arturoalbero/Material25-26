# 5.1. The Domain Model: Entities. Use of Lombok. Logging

## 1. Entities: The Domain Model

The **domain model** of our system will be the set of all relevant information for the application. Each element of this schema is called an **entity**, and each entity will have characteristics that describe it and which will take different values for each instance of the entity. Furthermore, these entities will have relationships and associations between them.

In the case of object-oriented programming, these entities will be classes, and their characteristics will be the attributes of each class. Finally, in a relational environment, these classes will be mapped to tables and the attributes to columns of the tables, to achieve their persistence, although we will see that later.

The classes that are the entities of our model will generally include attributes with private access, getters, setters, constructors, common methods (*equals*, *hashCode*, *toString*, etc.) and methods specific to their behavior.

As we saw in the forms chapter, classes can additionally incorporate certain restrictions on their attributes (`@NotNull`, `@NotEmpty`, etc.), which will be automatically validated by the system, producing an exception if they are not met.

Regarding the location of the classes that form the domain model, we can create one package with all of them and call it, for example, **domain**, or create packages oriented to each domain, where a single package contains its controller, associated services, etc. As always, these packages must be sub-packages of the root package that contains the application (the class with the main method).

The ***commandObject*** of the forms, if they are made ad-hoc and do not correspond to any domain entity, can be stored in a folder or package called **dto** (**DATA TRANSFER OBJECTS**), which we will talk about later.


## 2. Lombok

Lombok is a library that, through annotations, reduces the common code we have to write, saving us time and improving its readability. With these annotations, getters, setters, constructors, etc., can be generated automatically, and these transformations in the code are performed at compile time.

It has a multitude of annotations, which can be used at the attribute, method, class level, etc. Below are some of the most used:

  * `@Getter` generates a public getter, with the form getAttributeName, except if it is a *boolean*, which will be isAttributeName.
  * `@Setter` analogous to the previous one, but with the set method.
  * `@EqualsAndHashCode` creates the `equals` and `hashCode` methods. By default, both methods are based on the attributes of the class, but this behavior can be changed with parameters.
  * `@ToString` generates a toString method.
  * `@NoArgsConstructor` generates a constructor with no parameters.
  * `@AllArgsConstructor` generates a constructor with all parameters.
  * `@Data` groups the annotations `@Getter`, `@Setter`, `@EqualsAndHashCode`, and `@RequiredArgsConstructor`. It is very **commonly used**.
  * `@Builder` generates a method to instantiate the class in a more readable way than with a constructor and decouples said instantiation so that, even if the class constructors change in the future, instantiation with *builder* will continue to work.

To use Lombok, you must search for its Maven dependency on [https://mvnrepository.com](https://mvnrepository.com) and include it in the project's pom.xml. You can also add it as a dependency when you create the project with Spring Initializr.

The `@RequiredArgsConstructor` annotation allows us, since version 4.3 of Spring, to dispense with the `@Autowired` annotation as long as the attributes we want to wire are *final*.

```java
@Controller
public class EmpleadoController{
    @Autowired
    private EmpleadoService empleadoService;
}
```

Is equivalent to:

```java
@Controller
@RequiredArgsConstructor
public class EmpleadoController{
    private final EmpleadoService empleadoService
}
```

> **ACTIVITY 1:** Redesign the *My Favourite Composer* application with an entity-oriented approach. I recommend creating a new project from scratch, adding the necessary dependencies and including Lombok.
>
>   - Group the packages correctly.
>   - Differentiate the objects that are entities (Composer, Music Piece, etc.) from the DTOs (objects for collecting form data).
>   - Create the classes again, using Lombok.
>   - Reuse the views and controllers that you can.
>   - Eliminate all the business logic you put in the controllers and transfer it to different services that interact with the entities (you may have already done this).


## 3. Logging with Lombok

Our application's logging system is responsible for displaying the different events that are running during execution. With logs, we can discover errors, strange behavior, but also **audit attacks**. In Java there are several logging systems (Log4j, logback, java.util.logging...) and there is an abstraction layer over all of them: `slf4j` (acronym for *Single Logging Facade For Java*).

In these *logging* libraries, traces are emitted through a *logger* that normally corresponds to the name of the class in which the trace is emitted. In this way, traces can be filtered by the level of importance of the trace (debug, info, warn...) and by the name of the *logger* so that we can obtain a record of the traces emitted by the *loggers* we want. If we add the Lombok annotation `@Slf4j` to our class, we can generate a log like this:

```java
private static final org.slf4.Logger log = org.slf4j.LoggerFactory.getLogger(LogExample.class);
```

Once incorporated, we can use its methods to add information to the log with different levels of criticality (info, warn, error...) and which we will see on the console.

```java
log.info("Información");
```

For more information, consult **[this video](https://www.youtube.com/watch?v=yTokW18ujZI)**.

> **ACTIVITY 2:**
> Add logs to the application.
>
>   - An info log for each controller, to know when they are accessed.
>   - An info log for the services, to check that what we want is being carried out.
>   - A warning log if:
>       - The added composer lived or lives for more than 100 years.
>       - If the piece added to a composer premiered after their date of birth.
>   - Add an error log every time a controlled exception is thrown.
>       - Add one more case to not allow adding a piece: That its premiere is earlier than the composer's birth.