# 6.3 Association mapping

## 1. Association mapping

The entities in our model (classes) are not isolated; they are related to each other. Thus, if we have in our domain model an entity “Libro” and an entity “Autor”, it is logical that a relationship exists between them. UML class diagrams are a common way of representing these relationships.

An important aspect of these associations between entities is cardinality or multiplicity, that is, how many elements of one entity can be related to those of another. Thus, we talk about 1-to-1, 1-to-many, and many-to-many relationships.

JPA allows us to represent associations between classes through a series of annotations on the entities. These relationships will be established by generating foreign keys or additional tables and will perform the necessary joins when we link instances of the classes involved in the relationship. All transparently for us.

## 2. `@ManyToOne`

This is one of the relationships we will encounter most often, and to resolve it we will add the `@ManyToOne` annotation to the “many” entity, and that annotation will reference the “one” element of the relationship. This “one” element, of course, will also be annotated with `@Entity`.

```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    private Departamento departamento;
}
```

```java
@Entity
public class Departamento{
    @Id @GeneratedValue
    private Long id;
    private String nombre;
}
```

If we check the H2 console after starting the application, we can see that the Empleado table adds a new column called Departamento_id and that the name of the constraint is generated with random characters.

Optionally, we can add the `@JoinColumn` annotation, which allows us to indicate the name of the column that will act as the foreign key, as well as `@ForeignKey`, with which we can indicate the name of the constraint that will be created at the database level—something very useful for debugging errors.

```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    @JoinColumn(name = "DPTO_ID", foreignKey = @ForeignKey(name = "DPTO_ID_FK"))
    private Departamento departamento;
}
```

### 2.1 Deletions when there are relationships

Continuing with the Departamento and Empleado example, if we create a JPA repository with basic CRUD operations on Departamento and try to delete a department that has assigned employees, an exception will occur. This happens due to the foreign key constraint, since if only the department were deleted, the database would become inconsistent: there would be employees assigned to a non-existent department. To solve this situation we have several options:

1. **Cascade delete**: When deleting a department, all its employees would be deleted automatically:

```java
@ManyToOne
@OnDelete (action = OnDeleteAction.CASCADE)
private Departamento departamento;
```

> Later we will see the difference between `@OnDelete` and `CascadeType.REMOVE`.

2. **Set to null**: When deleting a department, the foreign key is set to null on all its employees. From an integrity standpoint this is not a good option and Hibernate does not allow it. To do this, we would need to create the schema outside of Hibernate (that is, with a *schema.sql*) and add the ON DELETE SET NULL attribute to the foreign key constraint.

3. A final option would be to check before deletion that there are no employees assigned to that department. We could create a method for this purpose in the Empleado repository:

```java
@Query ("select count (e) from Empleado e where e.departamento.id = ?1")
Long cantidadEmpleadosDpto(Long idDepto);
```

And then, in the Departamento service, in the department deletion method, before performing the deletion, check that there are no employees in that department. We would need to inject the Empleado repository into this service to be able to invoke the method we just created:

```java
public void borrar(Long id){
    Long cantEmpleadosDepto = empleadoRepository.cantidadEmpleadosDpto(id);
    if (cantEmpleadosDepto == 0) departamentoRepository.deleteById(id);
}
```

## 3. `@OneToMany`

This association is the inverse of the previous one; it allows us to link two entities by adding the annotation to the “one” entity. To do this, in that class, in addition to `@OneToMany`, we will include a collection of “many” elements. Let’s define a relationship where 1 Empleado has MANY payroll records:

```java
@Entity
public class Nomina{
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    LocalDate fechaNomina;
    Double importeBruto;
    Double porcentImpuestos;
    Double importeNeto;
}
```

```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToMany(cascade = CascadeType.ALL)
    private List<Nomina> nominas = new ArrayList<>();
}
```

Although it is typical for the collection used to be an ArrayList, it can also be a set (Set), an option recommended by Hibernate to achieve greater efficiency. Sets do not have positions as such and do not allow duplicates.

```java
private Set<Nomina> nominas = new HashSet<>();
```

## 4. Bidirectional and unidirectional relationships

If the `@OneToMany` association between two entities does not have the corresponding `@ManyToOne` in the opposite direction, we say it is unidirectional, and it is exactly as we have defined it in the previous examples. If the complementary one does exist, we say that the relationship is **bidirectional**. The `@ManyToOne` side remains the same, but on the `@OneToMany` side we must add the argument `mappedBy="columnName"`:

```java
@Entity
public class Nomina{
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    LocalDate fechaNomina;
    Double importeBruto;
    Double porcentImpuestos;
    Double importeNeto;

    @ManyToOne(action = OnDeleteAction.Cascade)
    private Empleado empleado;
}
```

```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue
    private Long id;
    
    @ToString.Exclude
    @OneToMany(cascade = CascadeType.ALL, mappedBy="empleado", orphanRemoval=true)
    private List<Nomina> nominas = new ArrayList<>();
}
```

Important aspects of bidirectional relationships:

* By having the List “nominas” through its getter we can access all the payroll records of an employee with a simple getNominas() without the need for additional methods in the payroll repository. If it were only unidirectional, we would need a method like `findByEmpleado(Empleado empleado)` in the payroll repository.
* Thanks to the `CascadeType.All` annotation, the relationships will remain synchronized when we use typical repository methods such as those in JpaRepository. That is, when saving an employee all their payroll records will be saved; when deleting an employee, all of them will be deleted, etc.
* We include the `@ToString.Exclude` annotation on Empleado because an employee references their payroll records, and in turn each payroll record references its employee, and so on. This annotation therefore prevents that infinite loop and should be added in all bidirectional relationships. It can be used on either side of the relationship.
* Hibernate recommends in its best practices guide to establish 1-to-N relationships in a bidirectional way, since it facilitates navigation through attributes in both directions. However, there will be cases where this is not advisable, for example if there were millions of payroll records for a single employee—the collection would be very large and its efficiency could suffer.

In bidirectional relationships, the `@ManyToOne` side is the **owner**; `@OneToMany` only reflects.

### CascadeType.All vs CascadeType.Remove vs OnDeleteAction.Cascade vs orphanRemoval=true

When we have two entities and one depends on the other, CascadeType refers to all operations to be cascaded on the dependent entity when a change occurs in a principal entity. A typical case is deletion: when deleting an employee, all their payroll records would be deleted.

This behavior is managed through the values assigned to the CascadeType attribute so that, if it takes the value REMOVE, only deletions will be propagated in cascade. If it takes the value ALL, any operation will be propagated.

On the other hand, OnDeleteAction.CASCADE performs the same operation as CascadeType.Remove but acts on the opposite end of the relationship.

```java
@Entity
public class Nomina{
    (...)
    @ManyToOne
    @OnDelete(action = OnDeleteAction.Cascade)
    private Empleado empleado;
    //WHEN DELETING AN EMPLOYEE, ALL THEIR PAYROLL RECORDS ARE DELETED
}
```

```java
@Entity
public class Nomina{
    (...)
    @ManyToOne(cascade = CascadeType.REMOVE)
    private Empleado empleado;
    //WHEN DELETING A PAYROLL RECORD, THE EMPLOYEE WOULD BE DELETED. THIS OPTION IS WRONG!!!
}
```

```java
@Entity
public class Empleado{
    @OneToMany(cascade = CascadeType.ALL) //or CascadeType.REMOVE
    private List<Nomina> nominas = new ArrayList<>();
    //WHEN DELETING AN EMPLOYEE, ALL THEIR PAYROLL RECORDS ARE DELETED.
}
```

Finally, we have the orphanRemoval attribute, which does something similar to CascadeType.REMOVE, although it rather complements it. What it does is delete those objects not referenced by anyone (that is, orphans).

To be clear, we can remember that:

* **`cascade` always goes from the entity that controls the lifecycle to the dependent one.** In parent–child it would be **ONE to MANY**.

* **Never put `CascadeType.REMOVE` on a `@ManyToOne`.** Deleting a child **must not delete the parent**.

* **`cascade` is JPA; `@OnDelete` is database-level. They are not equivalent.**

  * `cascade`: Hibernate decides
  * `@OnDelete`: SQL decides

* **`orphanRemoval = true` deletes children when they are removed from the collection, not when the parent is deleted.** It is for *managing the collection*, not for normal cascades.

Therefore, the most common configuration will be:

```java
@OneToMany(
    mappedBy = "empleado",
    cascade = CascadeType.ALL,
    orphanRemoval = true
)
private List<Nomina> nominas;
```

We will use `@OnDelete` only if we need protection at the database level (scripts, other apps, legacy data). In JPA, `cascade` is defined by whoever controls the lifecycle. `@OnDelete` does not express dependency; it only delegates deletion to the database.

## 5. `@ManyToMany`

As its name indicates, in this type of association one or more instances of an entity can be related to one or many of the other entity. Continuing with the employee example, we could have a Proyecto entity and say that an employee can collaborate on several projects and that several employees collaborate on a project.

These many-to-many associations need a table to link both associated entities. They also have unidirectional and bidirectional handling.

### Unidirectional handling

We must define which of the entities is the owner, and in it we will include the list of elements of the opposite class, as in `@OneToMany`.

```java
@Entity
public class Empleado{
    (...)
    @ToString.Exclude
    
    @ManyToMany
    @JoinTable(
        name = "empleado_proyecto",
        joinColumns = @JoinColumn(name = "empleado_id"),
        inverseJoinColumns = @JoinColumn(name = "proyecto_id")
    )
    private Set<Proyecto> proyectos = new HashSet<>();

}
```

On the other hand, the other entity will not have any additional attribute. `@JoinTable` is used to explicitly define an intermediate table that joins two related entities. joinColumns is the FK that points to the owning entity; inverseJoinColumns points to the other entity.

### Bidirectional handling

In this case, we will add the mappedBy attribute on the non-owning side and a collection to store the elements of the opposite entity:

```java
@Entity
public class Proyecto{
    (...)
    @ToString.Exclude
    @ManyToMany(mappedBy = "proyectos")
    private List <Empleado> empleados = new ArrayList<>();
}
```

### Relationships with extra attributes

There will be attributes that belong to the association itself. In this example, the “puesto” within a project would be such an attribute, since the same employee can have different roles in different projects. Some authors call this type of association with attributes an “association class”.

In general, this will be the model we use for many-to-many relationships because, although at first it may seem that we do not have extra attributes, they may appear later and, if another model were used, the relationships would have to be redone.

Since this new role is neither of the employee nor of the project, we cannot place it in either entity, so we must generate a new entity with the extra attributes:

```java
@Entity
public class Colaboracion{
    @NotEmpty
    private String puesto;
}
```

Now we have to make a decision about the key of this new entity. On the one hand, we can do as in previous entities and generate a new attribute that we would call something like id and annotate it with `@Id`. The other option would be that the key is formed by two attributes: the employee id and the project id.

We are going to choose the first solution, due to its simplicity:

```java
public class Colaboracion{
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empleado_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "proyecto_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Proyecto proyecto;

    private String puesto;
}
```

Optionally, if we want the relationship to be bidirectional, we will add to each of the entities at the ends of the relationship the `@OneToMany` associations with the newly created entity.

## 6. `@OneToOne`

These are associations similar to `@OneToMany`, but at the end where we previously had a collection we will now have a single instance. Like those, these relationships can also be unidirectional or bidirectional. Let’s imagine that each Empleado has a car and that a car belongs to only one employee:

```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    //If we want a bidirectional relationship we would add:
    /*
    @OneToOne (mappedBy = "empleado")
    @ToString.Exclude
    private Coche coche;
    */
}
```

```java
@Entity
public class Coche{
    @Id @GeneratedValue
    private Long id;
    private String matricula;
    private String modelo;
    @OneToOne
    private Empleado empleado;
}
```

Points to consider:

* Thinking about user views, it will be in the car creation/editing where we optionally introduce the employee assigned to that car and not the other way around; there will be no car assignment in the employee creation/editing.
* Thinking about business logic, a car’s license plate must be unique, so in creation/editing we must ensure that the entered license plate is not assigned to another car.
* Also, when relating a car to an employee we must verify that the employee is not assigned to any other car.
* Another aspect to highlight is that, in this case, we have not added cascade delete options, since deleting a car does not necessarily require deleting its employee (another car can be assigned), and vice versa. This will cause an error if we try to delete an employee with an assigned car, since the Empleado id is a foreign key of Coche. Before deleting an employee, we must ensure that they have no assigned car.

> As a general rule, before deleting an entity we must check that the object has no relationships with others, unless we want to proceed with cascade deletions.

---

> **ACTIVITY 1:** Perform the corresponding mappings in the project from the previous section (the one with students, teachers, and subjects). Remember that the database was:
>
> * We want a database in which students (id, name, email, date of birth, address, phones), teachers (same attributes as students plus department, category [PERMANENT, TEMPORARY]) and subjects (id, name, description) are registered.
>
>   * A student can take many subjects and a subject can have many students.
>   * A teacher can teach many subjects, but a subject can only be taught by one teacher.
>     Check in the H2 console the correct functioning of the application. Use **unidirectional** mappings and a `@ManyToMany`. Rewrite the operations defined in the activities of the previous section using the already mapped entities.

---

> **ACTIVITY 2:** Create a new version of My Favourite Composer using:
>
> * Entities and relational mapping with Hibernate, using a persistent H2 database.
>
>   * Modify the classes so that the database properly manages primary keys and foreign keys.
> * Lombok to generate getters and setters.
> * Repositories using the Repository interfaces.
> * A package structure for services, controllers, entities, and repositories.
>   Also, organize the URIs to achieve the following:
>
> **CREATE:**
>
> * `add/composer`: Form to add composers.
> * `add/music-piece`: Form to add musical pieces.
>
> **READ**
>
> * `show/composer`: Shows all composers. Allows organizing them by different criteria (alphabetical, by date, etc.).
> * `show/music-piece`: Shows all musical pieces. Allows organizing them by different criteria (alphabetical, by date, etc.). Allows deleting pieces.
> * `search/composer`: Search composers by different criteria (name, nationality, etc.). Add `/result` for the result view. Similar to `show/composer`.
> * `search/music-piece/`: Search musical pieces by different criteria (name, instrumentation, etc.). Add `/result` for the result view. Similar to `show/music-piece`.
>
> **UPDATE**
>
> * `edit/composer/{id}`: Form to edit the composer with that {id}.
> * `edit/music-piece/{id}`: Form to edit the musical piece with that {id}.
>
> **DELETE**
>
> * `delete/composer/{id}`: Delete a composer. Choose whether you want musical pieces to be deleted in cascade, set the composer to *null*, or prevent deleting the composer until associated pieces are deleted.
> * `delete/music-piece/{id}`: Delete a musical piece.
>
> As you can see, these are the basic operations of a CRUD, so use repositories appropriately to make everything work correctly. Use services and keep a very clear separation between model, view, and controller (MVC) so that in the future, by changing only the controller, we can use a REST API. **[You can review MVC here](https://developer.mozilla.org/es/docs/Glossary/MVC)**. In this case, create the necessary views with **Thymeleaf** (they should be functional; you can reuse previous versions of the views if you see fit).
>
> Check that the database is generated correctly in the H2 console. Also check that insertions, updates, and deletions are performed properly. Use **bidirectional** mappings.
>
> For the database, you can follow a relational schema similar to this:
> ![alt text](image.png)
