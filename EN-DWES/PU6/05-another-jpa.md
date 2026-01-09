# 6.5 More about JPA

## 1. Fetch Type

There are different types of fetching (Fetch type) depending on how data retrieval is performed, when talking about relationships between entities:

* **Lazy**: The data is not requested until it is referenced.
* **Eager**: The data is queried in advance.

By default, JPA uses Lazy for `@OneToMany` and `@ManyToMany`, and Eager for the others. This makes sense, since these two types are the ones that connect the largest number of objects on the other side of the relationship. As Lazy is the default behavior, we do not need to do anything to declare them as such. If we want them to be Eager (we will avoid problems at the cost of worse performance), we can specify it in the relationship annotation:

```java
@OneToMany(fetch = FetchType.EAGER)
```

Lazy fetch types have a problem: once a container entity has been detached from the persistence manager (for example, when sending it back to the client code that requested it), it is sent as it is at that moment, regardless of the state of its relationships that have been marked as Lazy.

If a relationship has been initialized before detaching the entity from the persistence manager, we will be able to access its values normally. Otherwise, the relationship will not point to any object and, therefore, we will obtain an exception when trying to handle it.

## 2. Pagination

When a query on a repository returns a large volume of data, it can be interesting to retrieve it in smaller subsets and, through different events (such as a user request), retrieve each part of the total dataset block by block. This is known as **pagination**.

Sometimes this happens transparently for us, such as when we swipe our finger on a mobile screen to advance through photos on social networks like Instagram. The mobile device does not receive all possible photos, but rather receives them from the server in small sets.

Spring defines within the repository interface hierarchy the interface ***PagingAndSortingRepository<T,ID>***, which defines methods that facilitate sorting and paging. Since the JpaRepository interface implements this interface, we can use its methods directly. You can check the methods in section 2, but the most important ones are ***Iterable<T> findAll(Sort sort)*** and ***Page<T> findAll(Pageable pageable)***. In the first case:

```java
empleadoRepository.findAll(Sort.by(Sort.Direction.DESC, "email")); //Returns the entities ordered by the Sort object passed as a parameter. In this case, with emails ordered descendingly.
```

As for the second one, it returns a ***Page*** object with the entities returned, according to the constraints provided by the ***Pageable*** object passed as a parameter.

This object allows us to define three fundamental parameters in pagination:

* Page number being handled in this request. If the query returns 20 pages, this parameter will range between 0 and 19.
* Page size, that is, the number of records in each returned set.
* Sorting criteria.

```java
@Service
public class VehiculoService{
    @Autowired
    private VehiculoRepository vr;
    private final Integer pageSize = 10;

    public List<Vehiculo> getVehiculosPaginados(Integer pageNum){
        Pageable paging = PageRequest.of(pageNum, pageSize, Sort.by("modelo"));
        Page<Vehiculo> pagedResult = vr.findAll(paging);
        if (pagedResult.hasContent()) return pagedResult.getContent();
        else return null;
    }
}
```

> **ACTIVITY 1:** In ***MyFavouriteComposer***, perform a search of all composers using pagination. Try a variable page size that can be entered by the user in the view. 
>
> Then create a view to see the different pages. It is like when you search for products on a shopping website and it shows the first 10 results and you can change the page.
>
> * The user determines the page size.
> * A view corresponding to the page is displayed.
> * The user can switch between different pages. Add links such as 1, 2… Last. For simplicity, add as many links as there are pages.
> * The user can change the page size at any time (which would restart the search).

## 3. Inheritance

Both Hibernate and JPA define three strategies to map inheritance relationships to tables in our database.

* **Single Table**: A single table to store the entire class hierarchy. It has the advantage of being the option with the best performance, since only one table needs to be accessed (fully denormalized). Its drawback is that all fields of the child classes must allow nulls, since when we store one type, the fields corresponding to the other types in the hierarchy will have no value. It is the default strategy. We need the annotations `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` and `@DiscriminatorColumn(name = "discriminator")`, where `"discriminator"` is the column that will indicate the child type.

* **Joined**: One table for the parent of the hierarchy, with common attributes, and another table for each child class with specific attributes. It is the most normalized option and, therefore, the most flexible, since to add new types it is enough to add new tables and, if we want to add new attributes, we only need to modify the table corresponding to the type where the attribute is being added. Its disadvantage is that, to retrieve the information of a class, it is necessary to perform joins with the parent class table. We only need the annotation `@Inheritance(strategy = InheritanceType.JOINED)`.

* **Table per class**: An independent table for each type. In this case, each table is independent, and the parent attributes (attributes common to the children) have to be repeated in each table. In principle, it can have performance problems, which is why it is the least recommended.

> **ACTIVITY 2:** Let us go back to the database we built in activity 1 of section 3. To remind you, the statement was the following:
>
> * We want a database in which students (id, name, email, date of birth, address, phones), teachers (same attributes as students plus department, category [PERMANENT, TEMPORARY]) and subjects (id, name, description) are registered.
>
>   * A student can take many subjects and a subject can have many students.
>   * A teacher can teach many subjects, but a subject can only be taught by one teacher.
>
>  As you can see, both teacher and student share the attributes `id`, `name`, `email`, `date of birth`, `address`, and `phones`. We are going to add to the student the attribute `promotion`, which reflects the year in which they enrolled at the institution. We will determine an inheritance relationship in which `individual` will be the abstract parent class of `student` and `teacher`.
>
> - Design the inheritance using the SINGLE_TABLE strategy.
> - Design the inheritance using the JOINED strategy.
>
>   Compare the results obtained.

## 4. Other annotations

We have other related annotations that may be useful.

> **ACTIVITY 3:** Search for information about the following annotations:
>
> * `@Transactional`
> * `@IdClass`
> * `@NaturalId`
> * `@Transient`
> * `@Enumerated`
> * `@Temporal`
> * `@MapsId`
>
> Accompany each annotation with a simple example.

> **ACTIVITY 4:** Improve My Favourite Composer to include advanced JPA concepts. For example, `@Enumerated` for enumerations and `@Temporal`.

## 5. Entity Manager

This is a fundamental JPA interface, since it is responsible for performing all persistence operations on the database: it establishes the transactional connection with the database, maintains an in-memory cache with the managed entities, and synchronizes them correctly with the database when a ***flush*** is performed. The set of entities managed by an entity manager is called its *persistence context*.

In our case, all this process is being done transparently for us, all managed by the repositories, but we could create it ourselves and use its methods, for example `persist()` to save data, `remove()` to delete it, etc.

```java
@Repository
public class Repositorio{
    @Autowired
    private EntityManager entityManager;
    public void save(Entidad entidad){
        entityManager.persist(entidad);
    }
}
```

Since in this case we implement the repository ourselves, we have to mark it with the `@Repository` annotation. In Spring, **`@Repository`** is a **stereotype annotation** that is used to mark a class as a **data access component (DAO)**.

`@Repository` indicates that a class:

1. **Is a Spring bean**: Spring automatically detects it during *component scanning*.
2. **Belongs to the persistence layer**: It is semantically equivalent to `@Component`, but with a clear purpose.
3. **Enables exception translation**: Spring converts provider-specific exceptions (JPA, Hibernate, JDBC…) into generic Spring exceptions (`DataAccessException`).

It is not necessary with `JpaRepository` because, when you do this:

```java
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
```

Spring **detects the interface**, generates a proxy class at runtime, and registers that proxy **as a `@Repository` bean**. Internally, Spring Data JPA already marks that bean as `@Repository`. However, you can optionally add the annotation, for clarity, if you wish.
