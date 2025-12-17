# 6.2 Entities and Repositories. Using Spring Data to Create Tables from Java Code

## 1. Entities

In the previous chapter, we described the domain model of our system and its entities. We mentioned that, in a relational environment, these classes are mapped to tables and their attributes to table columns to achieve persistence.

For this mapping to be performed by *Spring Data* transparently for us, the classes in our model must meet the following characteristics:

* Be POJO classes (Plain Old Java Object), i.e., simple classes that do not implement, inherit from, or depend on any specific framework.
* Be annotated with `@Entity` (from Jakarta).
* Have an attribute that is a primary key, annotated with `@Id`. If we want that identifier to be an auto-generated value by the database, we add `@GeneratedValue`.
* Have a no-argument constructor. If we work with Lombok, we just need to add the annotation `@NoArgsConstructor`. **You can use Lombok and Entity together.**

```java
@Entity
@Data @NoArgsConstructor
public class Producto{
    @Id
    @GeneratedValue
    private Long idProd;
    private String nombre;
    private float pvp;
}
```

In this example, a table with the same name as the class would be created and columns with the same names as the attributes. As mentioned, the attribute *idProd* would be the primary key of the table.

Regarding the data types we can use in attributes, valid types include primitives and their wrappers (int -> Integer, etc.), String, and other Java types such as BigInteger, BigDecimal, util.Date, util.Calendar, sql.Date, sql.Time, sql.Timestamp, etc.

### 1.1 Annotations

In addition to those mentioned above, we have extra annotations to refine the default behavior of the ORM:

* **`@Table(name = "tableName")`**: Assigns `tableName` as the table name instead of using the class name. This annotation goes right after `@Entity`.
* **`@Column(name = "columnName")`**: Assigns `columnName` as the column name instead of using the attribute name. This annotation also allows setting other column properties (Nullable, Length, etc.), e.g., `@Column(nullable = false)` and a useful one: `@Column(unique = true)`. The latter ensures the column contains no duplicates, just like the primary key. This is useful for defining alternate keys. If a duplicate is inserted, a `DataIntegrityViolationException` is thrown.
* **`@UniqueConstraint`**: Similar to `@Column(unique = true)`, but applied at the table level (not the column), allowing more than one attribute in the alternate key, e.g.: `@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"nombre", "fechaNacim"})})`.
* **`@GeneratedValue`**: Accompanies `@Id` and indicates that this field will be automatically managed by generating unique numbers. It is usually used on the primary key field, commonly of type Long. There are different strategies for generating this number depending on the underlying database. By default, if no strategy is specified, Spring selects it automatically based on the database.
* **`@GeneratedValue(strategy = GenerationType.IDENTITY)`**: Defines a strategy for Spring to manage auto-increment fields using the database’s built-in mechanism. This does not work in Oracle, for example, as it does not have this type of data.

> In classes with an `@Id` annotated with `@GeneratedValue`, when using a constructor containing all attributes, we set a default value for the annotated attribute, e.g., `null`, since the actual value will be determined automatically by the database. This should be considered if we want to create elements manually using a *CommandLineRunner*.

Additionally, we can use other annotations already seen in the forms chapter (`@Min`, `@NotEmpty`, etc.)

Here is an example using annotations and Lombok:

```java
package com.ejemplo.demo.entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
    name = "clientes",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email", "fecha_nacimiento"})
    }
)
@Data
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @NotEmpty
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotEmpty
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Min(18)
    @Column(name = "edad", nullable = false)
    private int edad;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "activo", nullable = false)
    private boolean activo;
}
```

Since Hibernate 6, `record` can also be used. Note that records are immutable and do not generate a no-argument constructor. Therefore, they work better as read-only entities:

```java
package com.ejemplo.demo.entidades;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;

@Entity
@Table(
    name = "clientes",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email", "fecha_nacimiento"})
    }
)
public record ClienteRecord(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    Long id,

    @NotEmpty
    @Column(name = "nombre", nullable = false, length = 100)
    String nombre,

    @NotEmpty
    @Column(name = "email", nullable = false, unique = true, length = 150)
    String email,

    @Min(18)
    @Column(name = "edad", nullable = false)
    int edad,

    @Column(name = "fecha_nacimiento", nullable = false)
    LocalDate fechaNacimiento,

    @Column(name = "activo", nullable = false)
    boolean activo

) { }

```

More info about Hibernate: https://hibernate.org/

> **ACTIVITY 1:** Create an application using entities for relational mapping. Make a version with Lombok and another with records, but use all annotations possible. Use the H2 database.
>
> * We want a database where students (id, name, email, birth date, address, phone numbers), teachers (same attributes as students plus department, category [PERMANENT, TEMPORARY]), and courses (id, name, description) are registered.
>
>   * A student can enroll in many courses, and a course can have many students.
>   * A teacher can teach many courses, but a course can only be taught by one teacher.
>     Note that this is not a realistic scenario; it is a simplified practice for class. Insert data using data.sql and verify that everything runs correctly in the H2 console.
>
> **IMPORTANT:** Relationships will be defined in the next section. Here we work manually as if they exist but without defining them explicitly. This is not usual, and once we see relationship mapping, we will stop doing it this way, but it serves for practice.

## 2. Repositories

Spring Data defines a main interface called *Repository*, which allows taking an entity with its primary key and working with it. This interface is the base for a hierarchy with more powerful interfaces containing useful methods (implemented by ORMs like Hibernate).

One of them is *CrudRepository*, which contains methods for basic table operations commonly known as CRUD (Create, Read, Update, Delete), plus a count() method, etc. Another interface we can use is *PagingAndSortingRepository*, and finally *JpaRepository*, which is the most complete, offering many useful methods. Another difference is that *CrudRepository* works with *Iterable*, while *JpaRepository* works with *List*, a collection we are usually more familiar with.

We will use ***JpaRepository***. To use it, simply create an interface like this:

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {}
```

No additional code is necessary: Spring Data and the ORM handle the rest automatically.

The interface name is free, and the two parameters provided are the entity (and therefore the class and table) it works on, and the type of the attribute annotated with @Id in the entity, which as mentioned is usually Long.

In the previous example, we defined the interface ProductoRepository for:

```java
@Entity
public class Producto{
    @Id
    private Long id;
}
```

## 3. Repository Interfaces

We can work with *JpaRepository* and, in general, with any interface derived from *Repository* in three ways:

* **Methods defined in the interface**: These are provided by the interface itself, typical CRUD operations as well as search and count. We can use these methods directly in services or elsewhere without defining their signature in the repository. See the list below.
* **Derived methods**: If we create methods using certain keywords, Spring Data will build the method automatically. For example:

```java
interface PersonaRepository extends JpaRepository<Persona, Long> {
    List<Persona> findByEmail(String email);
}
```

You can consult the official documentation: [https://docs.spring.io/spring-data/jpa/reference/jpa.html](https://docs.spring.io/spring-data/jpa/reference/jpa.html)

### 3.1 Repository Interface Methods

Here is a series of tables with the most important *JpaRepository* methods.

#### Methods inherited from `CrudRepository`

| Modifier and Type           | Method                                      | Description                                             |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| `<S extends T> S`           | `save(S entity)`                            | Saves a new entity or updates an existing one.          |
| `<S extends T> Iterable<S>` | `saveAll(Iterable<S> entities)`             | Saves all provided entities.                            |
| `Optional<T>`               | `findById(ID id)`                           | Returns the entity with the given ID, if it exists.     |
| `boolean`                   | `existsById(ID id)`                         | Indicates if an entity with the given ID exists.        |
| `Iterable<T>`               | `findAll()`                                 | Returns all entities.                                   |
| `Iterable<T>`               | `findAllById(Iterable<ID> ids)`             | Returns all entities whose IDs match the provided ones. |
| `long`                      | `count()`                                   | Returns the total number of entities.                   |
| `void`                      | `deleteById(ID id)`                         | Deletes the entity with the given ID.                   |
| `void`                      | `delete(T entity)`                          | Deletes the specified entity.                           |
| `void`                      | `deleteAll()`                               | Deletes all entities.                                   |
| `void`                      | `deleteAll(Iterable<? extends T> entities)` | Deletes all provided entities.                          |
| `void`                      | `deleteAllById(Iterable<? extends ID> ids)` | Deletes all entities whose IDs match.                   |

#### Methods inherited from `PagingAndSortingRepository`

| Modifier and Type | Method                       | Description                                                       |
| ----------------- | ---------------------------- | ----------------------------------------------------------------- |
| `Iterable<T>`     | `findAll(Sort sort)`         | Returns all entities sorted according to the specified criteria.  |
| `Page<T>`         | `findAll(Pageable pageable)` | Returns a page of entities according to the requested pagination. |

#### Methods declared in `JpaRepository`

| Modifier and Type | Method                                   | Description                                                               |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| `List<T>`         | `findAll()`                              | Returns all entities as a list.                                           |
| `List<T>`         | `findAll(Sort sort)`                     | Returns all entities sorted as a list.                                    |
| `List<T>`         | `findAllById(Iterable<ID> ids)`          | Returns a list of entities whose IDs match.                               |
| `<S extends T> S` | `saveAndFlush(S entity)`                 | Saves the entity and immediately synchronizes with the database.          |
| `void`            | `flush()`                                | Forces synchronization of the persistence context with the database.      |
| `void`            | `deleteAllInBatch()`                     | Deletes all entities in a batch operation.                                |
| `void`            | `deleteAllInBatch(Iterable<T> entities)` | Deletes the given entities in a batch operation.                          |
| `T`               | `getById(ID id)`                         | Returns a reference to the entity with the given ID.                      |
| `T`               | `getReferenceById(ID id)`                | Returns a proxy of the entity without immediately accessing the database. |

#### Methods inherited from `QueryByExampleExecutor`

| Modifier and Type           | Method                                           | Description                                         |
| --------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| `<S extends T> Optional<S>` | `findOne(Example<S> example)`                    | Returns a single entity matching the given example. |
| `<S extends T> List<S>`     | `findAll(Example<S> example)`                    | Returns all entities matching the given example.    |
| `<S extends T> List<S>`     | `findAll(Example<S> example, Sort sort)`         | Returns entities by example, sorted.                |
| `<S extends T> Page<S>`     | `findAll(Example<S> example, Pageable pageable)` | Returns entities by example with pagination.        |
| `<S extends T> long`        | `count(Example<S> example)`                      | Counts the entities matching the given example.     |
| `<S extends T> boolean`     | `exists(Example<S> example)`                     | Indicates if any entity matches the given example.  |

### 3.2 Derived Methods

Derived methods are automatically constructed by the framework, but we must follow certain rules when writing their names. If done correctly, we can use them like the already provided methods.

These methods are included in the interface definition that extends JpaRepository (or CRUDRepository, PagingAndSortingRepository, etc.). The rules are as follows:

1. The method name must start with:

   * findBy: The one we will use most.
   * countBy: Counts instances returning a Long.
   * getBy
   * queryBy
   * readBy
2. Next, we add the attribute(s) we want to filter by. Multiple attributes can be combined using `And` or `Or`. By convention, use `camelCase`. We can add `Is` or `Equals` for readability, though it is not necessary.

```java
List<Empleado> findByNombre(String nombre);
List<Empleado> findByNombreAndEmail(String nombre, String email);
List<Empleado> findByEmailEquals(String email);
```

3. We can limit the number of returned results by inserting `First` or `Top` plus the number of results, placed between `find` and `By`.

```java
List<Empleado> findTop3ByNombre(String nombre);
```

4. Other keywords can be used to compose queries: *Is, Equals, IsNot, Not, GreaterThan, GreaterThanEqual, LessThan, LessThanEqual, Between, IsNull, IsNotNull, True, False, Like, NotLike, Containing, StartingWith, EndingWith, In, NotIn, Empty, NotEmpty, Before, After, And, Or, OrderByAsc, OrderByDesc, First, Top, IgnoreCase*.

Combining sorting and result limitation, we can get things like:

```java
Empleado findTopOrderBySalarioDesc(); //Finds the highest-paid employee
```

> **ACTIVITY 2:** Create the repositories for the database above. Remember to structure the project into `domain` (or `entities`), `controllers`, `repositories`, and `services`. Repositories should be injected into services or controllers using `@Autowired`.
>
> Create the following views with their respective controllers:
>
> * /alumnos: Shows all students
> * /profesores: Shows all teachers
> * /asignaturas: Shows all courses
> * /alumnos/{asignatura}: Shows students enrolled in the {asignatura} course
> * /asignaturas/{alumno}: Shows courses taken by {alumno}

> This activity focuses on practicing derived methods.

> **ACTIVITY 3:** Create a form to add students `/add/alumno`, another to add teachers `add/profesor`, and a third to add courses `add/asignatura`.
>
> * Courses must be assigned to existing teachers.
> * Students can be assigned several existing courses and must have at least one.

> This activity focuses on practicing methods inherited from CrudRepository.

### 3.3 @Query Methods

When a query cannot be solved by either of the previous systems (interface methods or derived methods), JPA provides an additional way to compose custom queries using the `@Query` annotation and JPQL, which roughly combines SQL and object-oriented programming.

A typical SQL query like `select * from Empleado e where e.id = 1` becomes JPQL `select e from Empleado e where e.id=1`. The main difference is that the result can be stored in a primitive type, a wrapper, an instance of the underlying object, or a list of objects, depending on the *select* result.

The `@Query` annotation includes the JPQL query and the method signature that executes it.

```java
@Query("select e from Empleado e where e.id=(select max(e2.id) from Empleado e2)")
Empleado queryMaxIdEmpleado();
```

If the query can return null, it is recommended to use an `Optional<>` wrapper.

These queries are defined in the repository and generally invoked from a @Service class in the application with the repository injected.

#### Parameters in @Query

A query can receive parameters in several ways. One is using "?" with a number indicating the order in the method parameters, starting at 1. For example:

```java
@Query("select e from Empleado e where e.nombre=?1 and e.eamil=?2")
Empleado obtenerEmpleadoPorNombreYEmail(String nombre, String email);
```

The recommended way is by name using `@Param`:

```java
@Query("select e from Empleado e where e.nombre=:nombre and e.email=:email")
Empleado obtenerEmpleadoPorNombreYEmail(@Param("nombre") String nombre, @Param("email") String email);
```

The previous method could be solved with a derived method by name. Queries that require aggregation, which cannot be expressed via derived methods, must use `@Query`. For example, summing salaries by gender:

```java
@Query("select sum(e.salario) from Empleado e where e.genero=:genero")
Optional<Double> querySumSalarioByGenero(@Param("genero") Genero genero);
```

Spring Data also supports native SQL by adding the *nativeQuery* parameter:

```java
@Query(nativeQuery = true, value = "select count(1) from Empleado")
long obtenerTotalFilas();
```

#### Updates with @Query

`@Query` also supports update and delete operations with JPQL (not inserts) using the `@Modifying` annotation:

```java
@Modifying
@Query("update Empleado e set e.email = :email where e.id = :id")
int updateEmailById(@Param("id") Integer id, @Param("email") String email);
```

Such operations require that the calling method, from a service, be annotated with `@Transactional`, which will be covered later, along with Joins.

> **ACTIVITY 4:**
> Based on the students, courses, and teachers project:
> - Create edit forms from the previous add forms (changing `add` to `edit` in the URI). Include hidden attribute techniques from section 5.3 to manage IDs, and remember to annotate services with `@Transactional` if using a query for editing.
> - Use @Query to create the following URIs:
>   - /alumnos/{profesor}: Shows all students taught by {profesor}, including the course.
>   - /emails/: Shows the emails of teachers and students.

> **ACTIVITY 5:** Configure the application so the repository is persistent. Follow the instructions in the previous configuration section.

