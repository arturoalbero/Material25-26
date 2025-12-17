# 6.2 Entidades y repositorios. Uso de Spring Data para la creación de tablas a partir de código Java

## 1. Entidades

Ya describimos en el capítulo anterior el modelo de dominio de nuestro sistema y las entidades del mismo. Comentábamos que, en un ambiente relacional, esas clases son mapeadas a tablas y los atributos a columnas de las tablas, para lograr su persistencia.

Para que ese mapeo sea realizado por *Spring Data* de forma transparente para nosotros, las clases de nuestro modelo deben cumplir estas características:

- Ser clases POJO (Plain Old Java Object), es decir, clases simples que no implementen ni hereden ni dependan de un framework en especial.
- Estar antoadas con `@Entity` (el que viene de jakarta).
- Tener un atributo que sea clave primaria, anotado con `@Id`. Si queremos que ese identificador sea un valor autonumérico generado por el gestor de base de datos, añadiremos `@GeneratedValue`.
- Tener el constructor sin argumentos. Si trabajamos con Lombok, simplementa habría que añadirle la anotación `@NoArgsConstructor`. **Se puede trabajar con Lombok y Entity**.

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
En este ejemplo, se crearía una tabla con el mismo nombre que la clase y con columnas con el mismo nombre que los atributos, y como hemos comentado el atributo *idProd* sería la clave primaria de la tabla.

En cuanto a los tipos de datos que podemos emplear en los atributos, son válidos los tipos primarios y sus envoltorios (int -> Integer, etc.), String y otros propios de Java como BigInteger, BigDecimal, util.Date, util.Calendar, sql.Date, sql.Time, sql.TimeStamp, etc.

### 1.1 Anotaciones

Además de las que acabamos de mencionar, disponemos de anotaciones adicionales para refinar el comportamiento por defecto del ORM:

* **`@Table (name = "nombreTabla")`**: Asignaría `nombreTabla` como nombre de la tabla en lugar de ponerle el mismo nombre que la clase. Esta anotación iría a continuación de `@Entity`.
* **`@Column (name = "nombreColumna")`**: Asignaría `nombreColumna` como nombre de la columna en vez de ponerle el mismo nombre que el atributo situado a continuación de la anotación. Esta misma anotación nos permite fijar otras propiedades de la columna y, por tanto, del atributo (Nullable, Length, etc). Por ejemplo, `@Column(nullable = false)` y una que puede ser muy útil: `@Column(unique = true)`. Esta última hará que la columna no contenga duplicados en la tabla, al igual que ocurre con la clave primara. Nos sirve, por tanto, para definir claves alternativas. En caso de intentar insertar un duplicado, se produce la excepción `DataIntegrityViolationException`.
* **`@UniqueConstraint`**: Similar a `@Column(unique = true)`, pero se aplica a nivel de tabla (y no de columna), por lo que nos permite añadir más de un atributo en la clave alternativa, por ejempl así:`@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"nombre", "fechaNacim"})})`.
* **`@GeneratedValue`**: Acompaña a `@Id` y le dice al sistema que ese campo será gestionado de forma automática generando números no repetidos. Se suele utilizar sobre el campo que sea clave primaria y habitualmente es de tipo Long. Existen distintas estrategias para generar ese número dependiendo del gestor de base de datos subyacente. Por defecto, si no especificamos ninguna estrategia, el propio Spring la elige automáticamente según el gestor de base de datos. 
* **`@GeneratedValue (strategy = GenerationType.IDENTITY)`**: En este caso definimos una estrategia para que Spring gestione los campos de tipo autoincremento usando los del gestor de base de datos. Esto no funciona en Oracle, por ejemplo, ya que no contiene este tipo de datos. 

> En las clases que tienen un atributo `@Id` con `@GeneratedValue` cuando se emplee el constructor que contiene todos los atributos pondremos un valor por defecto para el atributo etiquetado, por ejemplo `null`, ya que el valor real que se asignará lo determinará de forma automática el gestor de base de datos. Esto hay que tenerlo en cuenta si queremos crear algún elemento "a mano" desde un *CommandLineRunner*.

Asimismo, disponemos de otras anotaciones ya vistas en el capítulo de formularios (`@Min`, `@NotEmpty`, etc.)

A continuación, un ejemplo usando las anotaciones y Lombok:
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

Desde Hiberate 6, se pueden usar también `record`. Hay que tener en cuenta que los record son inmutables y que no generan constructor vacío. Por este motivo, funcionan mejor como entidades de solo lectura:

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

Más información sobre Hibernate en su página oficial: https://hibernate.org/

> **ACTIVIDAD 1:** Genera una aplicación usando entidades para el mapeo relacional. Haz una versión con Lombok y otra con records, pero usa todas las anotaciones que puedas. Emplea la base de datos H2.
> - Queremos una base de datos en la cual estén registrados alumnos (id, nombre, email, fecha de nacimiento, direccion, teléfonos), profesores (mismos atributos que alumnos y departamento, categoría [FIJO, INTERINO]) y asignaturas(id, nombre, descripción). 
>   - Un alumno puede cursar muchas asignaturas y una asignatura puede tener muchos alumnos.
>   - Un profesor puede impartir muchas asignaturas, pero una asignatura solo puede ser impartida por un profesor.
> Ten en cuenta que no es una situación realista, es una prueba simplificada para clase. Inserta datos con data.sql y comprueba que todo se ejecute de forma correcta en la consola de H2.
>
> **IMPORTANTE:** Las relaciones las estableceremos en el siguiente punto, aquí las trabajaremos de forma manual, como si existieran, pero sin definirlas explícitamente. No es lo normal y en cuanto veamos el mapeo de relaciones dejaremos de hacerlo así, pero nos sirve para practica.

## 2. Repositorios

Spring Data define una interfaz principal llamada *Repository* que permite tomar una entidad con su clave primaria y trabajar sobre ella. Esta interfaz es la base sobre la que se crea una jerarquía con interfaces más potentes, con métodos muy útiles (que los ORM, como Hibernate, implementan).

Una de ellas es *CrudRepository*, que contiene métodos para las operaciones básicas sobre una tabla referidas habitualmente con el acrónimo CRUD (Create, Read, Update y Delete), un método count() para contar filas, etc. Otra interfaz que podemos usar es *PagingAndSortingRepository* y, finalmente, *JpaRepository* que es la más completa, ofreciéndonos multitud de métodos útiles. Otra diferencia es que *CrudRepository* trabaja con *Iterable* mientras que *JpaRepository* lo hace con *List*, colección con la que normalmente estamos más familiarizados.

Emplearemos ***JpaRepository***. Para usarla, simplemente creamos una interfaz con la siguiente estructura:
```java
public interface ProductoRepository extends JpaRepository <Producto, Long>{}
```
Y no es necesario añadir ni una sola línea de código más: Spring Data y el ORM se encargan del resto con su "magia" habitual.

El nombre asignado a la interfaz es libre y los dos parámetros que le aportamos son la entidad (y por lo tanto, clase y tabla) sobre la que va a trabajar y el tipo de dato del atributo anotado con @id en la entidad, que como comentábamos muchas veces será Long.

En el ejemplo anterior, definimos la interfaz ProductoRepository sobre:

```java
@Entity
public class Producto{
    @Id
    private Long id;
}
```

## 3. Interfaces Repository

Vamos a trabajar con *JpaRepository* y, en general, con cualquier interfaz derivada de *Repository* de tres formas diferentes:

* **Métodos definidos en la interfaz**: Son métodos proporcionados por la propia interfaz, los típicos CRUD así como otros para la búsqueda, el conteo, etc. Estos métodos los podremos usar directamente en los servicios o donde deseemos sin crear ni siquiera su firma en el repositorio. Más abajo mostramos la lista de ellos.
* **Métodos derivados**: Veremos que, si creamos métodos empleando en su forma unas palabras clave determinadas, Spring Data construirá el método por nosotros. Por ejemplo:
```java
interface PersonaRepository extends JpaRepository<Persona, Long> {
    List<Persona> findByEmail (String email);
}
```
Puedes consultarlo en la documentación oficial: https://docs.spring.io/spring-data/jpa/reference/jpa.html

### 3.1 Métodos de Interfaces repository

A continuación, una serie de tablas con los métodos más importantes de *JpaRepository*.

#### Methods inherited from `CrudRepository`

| Modifier and Type           | Method                                      | Description                                                              |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `<S extends T> S`           | `save(S entity)`                            | Guarda una entidad nueva o actualiza una existente.                      |
| `<S extends T> Iterable<S>` | `saveAll(Iterable<S> entities)`             | Guarda todas las entidades proporcionadas.                               |
| `Optional<T>`               | `findById(ID id)`                           | Devuelve la entidad con el identificador dado, si existe.                |
| `boolean`                   | `existsById(ID id)`                         | Indica si existe una entidad con el identificador dado.                  |
| `Iterable<T>`               | `findAll()`                                 | Devuelve todas las entidades.                                            |
| `Iterable<T>`               | `findAllById(Iterable<ID> ids)`             | Devuelve todas las entidades cuyos IDs coinciden con los proporcionados. |
| `long`                      | `count()`                                   | Devuelve el número total de entidades.                                   |
| `void`                      | `deleteById(ID id)`                         | Elimina la entidad con el identificador dado.                            |
| `void`                      | `delete(T entity)`                          | Elimina la entidad indicada.                                             |
| `void`                      | `deleteAll()`                               | Elimina todas las entidades.                                             |
| `void`                      | `deleteAll(Iterable<? extends T> entities)` | Elimina todas las entidades proporcionadas.                              |
| `void`                      | `deleteAllById(Iterable<? extends ID> ids)` | Elimina todas las entidades cuyos IDs coinciden.                         |


#### Methods inherited from `PagingAndSortingRepository`

| Modifier and Type | Method                       | Description                                                        |
| ----------------- | ---------------------------- | ------------------------------------------------------------------ |
| `Iterable<T>`     | `findAll(Sort sort)`         | Devuelve todas las entidades ordenadas según el criterio indicado. |
| `Page<T>`         | `findAll(Pageable pageable)` | Devuelve una página de entidades según la paginación solicitada.   |


#### Methods declared in `JpaRepository`

| Modifier and Type | Method                                   | Description                                                                    |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `List<T>`         | `findAll()`                              | Devuelve todas las entidades como una lista.                                   |
| `List<T>`         | `findAll(Sort sort)`                     | Devuelve todas las entidades ordenadas como una lista.                         |
| `List<T>`         | `findAllById(Iterable<ID> ids)`          | Devuelve una lista de entidades cuyos IDs coinciden.                           |
| `<S extends T> S` | `saveAndFlush(S entity)`                 | Guarda la entidad y fuerza la sincronización inmediata con la base de datos.   |
| `void`            | `flush()`                                | Fuerza la sincronización del contexto de persistencia con la base de datos.    |
| `void`            | `deleteAllInBatch()`                     | Elimina todas las entidades mediante una operación en lote.                    |
| `void`            | `deleteAllInBatch(Iterable<T> entities)` | Elimina las entidades dadas mediante una operación en lote.                    |
| `T`               | `getById(ID id)`                         | Devuelve una referencia a la entidad con el ID dado.                           |
| `T`               | `getReferenceById(ID id)`                | Devuelve un proxy de la entidad sin acceder inmediatamente a la base de datos. |


#### Methods inherited from `QueryByExampleExecutor`

| Modifier and Type           | Method                                           | Description                                                       |
| --------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `<S extends T> Optional<S>` | `findOne(Example<S> example)`                    | Devuelve una única entidad que coincida con el ejemplo dado.      |
| `<S extends T> List<S>`     | `findAll(Example<S> example)`                    | Devuelve todas las entidades que coincidan con el ejemplo dado.   |
| `<S extends T> List<S>`     | `findAll(Example<S> example, Sort sort)`         | Devuelve entidades por ejemplo, ordenadas.                        |
| `<S extends T> Page<S>`     | `findAll(Example<S> example, Pageable pageable)` | Devuelve entidades por ejemplo con paginación.                    |
| `<S extends T> long`        | `count(Example<S> example)`                      | Cuenta las entidades que coinciden con el ejemplo dado.           |
| `<S extends T> boolean`     | `exists(Example<S> example)`                     | Indica si existe alguna entidad que coincida con el ejemplo dado. |

### 3.2 Métodos derivados

Los métodos derivados se construyen automáticamente por el framework, pero debemos seguir una serie de reglas a la hora de escribir su nombre. Si lo hacemos correctamente, podemos usarlos como los métodos ya generados.

Los métodos se incluirán en la definición de la interfaz que extiende JpaRepository (o CRUDRepository, PageAndSortingRepository, etc). Las reglas que tenemos que seguir son las siguientes:

1. El nombre del método debe comenzar por:
    - findBy: El que más usaremos.
    - countBy: Contará instancias devolviendo un Long.
    - getBy
    - queryBy
    - readBy
2. A continuación, pondremos el nombre de atributo que usaremos para filtrar la obtención de resultados. Pueden ser varios unidos por `And` o `Or`. Por convención, debemos emplear la notación `camelCase`. Podemos añadir Is o Equals para mejor legibilidad, aunque no es necesario.
```java
List<Empleado> findByNombre(String nombre);
List<Empleado> findByNombreAndEmail (String nombre, String email);
List<Empleado> findByEmailEquals(String email);
```
3. Podemos restringir el número de resultados devueltos insertando la partícula `First` o `Top` más la cantidad de resultados obtener. La insertamos entre el `find` y el `By`.
```java
List<Empleado> findTop3ByNombre(String nombre);
```
4. Podemos usar otras partículas para componer las consultas como: *Is, Equals, IsNot, Not, GreaterThan, GreaterThanEqual, LessThan, LessThanEqual, Between, IsNull, IsNotNull, True, False, Like, NotLike, Containing, StartingWith, EndingWith, In, NotIn, Empty, NotEmpty, Before, After, And, Or, OrderByAsc, OrderByDesc, First, Top, IgnoreCase*.

Combinando la ordenación y la restricción de datos, podemos obtener cosas como:
```java
Empleado findTopOrderBySalarioDesc (); //Encontramos al empleado mejor pagado
```

<details>
<summary>

**DEPRECATED**

</summary>


> **ACTIVIDAD 2:** Crea los repositorios para la base de datos anterior. Recuerda que debes estructurar el proyecto en `domain` (o `entities`), `controllers`, `repositories` y `services`. Los repositorios se deben inyectar en los servicios o en los controladores con `@Autowired`. 
> 
> Crea las siguientes vistas con sus respectivos controladores:
> - /alumnos: Muestra todos los alumnos
> - /profesores: Muestra todos los profesores
> - /asignaturas: Muestra todas las asignaturas
> - /alumnos/{asignatura}: Muestra los alumnos que cursan la asignatura {asignatura}
> - /asignaturas/{alumno}: Muestra las asignaturas que cursa el alumno {alumno}

> En esta actividad se trata de practicar los métodos derivados.

> **ACTIVIDAD 3:** Crea un formulario para añadir alumnos `/add/alumno`, otro para añadir profesores `add/profesor` y un tercero para añadir asignaturas `add/asignatura`.
> - Las asignaturas se asignan sí o sí a profesores ya existentes.
> - A los alumnos se les pueden asignar varias asignaturas ya existentes y al menos tienen que tener una.
>
> En esta actividad se trata de practicar los métodos heredados de CrudRepository.

</details>

> **ACTIVITY 2:** Create the repositories for the database above. Remember to structure the project into `domain` (or `entities`), `controllers`, `repositories`, and `services`. Repositories should be injected into services or controllers using `@Autowired`.
>
> Create the following views with their respective controllers. Use the repositories interfaces:
> **CREATE**
> * `/add/alumno`: Create a form to add a student.
> * `/add/profesor`: Create a form to add a teacher.
> * `/add/subject`: Create a form to add a subject.
> **READ**
> * `/alumnos`: Shows all students
> * `/profesores`: Shows all teachers
> * `/asignaturas`: Shows all subjects
> **UPDATE**
> * `edit/alumno/{id}`: Edit the {id} student with an edit form.
> * `edit/profesor/{id}`: Edit the {id} teacher with an edit form.
> * `edit/asignatura/{id}`: Edit the {id} subject with an edit form.
> You can leave the UPDATE URIS to later, using `@Query`
> **DELETE**
> * `delete/profesor/{id}`: Deletes the {id} teacher.
> * `delete/alumno/{id}`: Deletes the {id} student.
> * `delete/asignatura/{id}`: Deletes the {id} subject.

> **ACTIVITY 3:** Create the following views with their respective controllers:
> * `/alumnos/{asignatura}`: Shows students enrolled in the {asignatura} course
> * `/asignaturas/{alumno}`: Shows subjects taken by {alumno}
> * `/alumnos/oldest/`: Shows the oldest student.
> * `/alumnos/findby/email`: Searches students by email and shows the results also in `/alumnos/findby/email/` (use the model object properly).


### 3.3 Métodos @Query

Cuando la consulta que necesitamos no se puede resolver por ninguno de los dos sistemas anteriores (los métodos de la interfaz o los métodos derviados de nombre) JPA nos ofrece una forma adicional de componer consultas a medida con lenguaje con la anotación `@Query` y el lenguaje JPQL, que *grosso modo* es una mezcla entre SQL y orientación a objetos. 

Una consulta típica de SQL como `select * from Empleado e where e.id = 1` se convierte en JPQL en `select e from Empleado e where e.id=1`. La diferencia principal es que guardamos el resultado en un tipo primitivo, un envoltorio, en una instancia del objeto subyacente o en una lista de objetos, en función del resultado del *select*. 

En la anotación `@Query` se incluye la consulta JPQL y, a continuación, la firma del método que invoca esa consulta. 
```java
@Query("select e from Empleado e where e.id=(select max(e2.id) from Empleado e2)")
Empleado queryMaxIdEmpleado();
```
Si la consulta puede devolver null, es conveniente usar un envoltorio de tipo `Optional<>`.

Estas consultas se definen en el repositorio y se invocan generalmente desde una clase @Service de nuestra aplicación que tenga inyectado dicho repositorio.

#### Parámetros en @Query

Una consulta, lógicamente, puede recibir parámetros. Tenemos varias formas de hacerlo, una es empleando el símbolo "?" y un número que indica el orden dentro de los parámetros pasados, empezando en 1. Por ejemplo:
```java
@Query("select e from Empleado e where e.nombre=?1 and e.eamil=?2")
Empleado obtenerEmpleadoPorNombreYEmail (String nombre, String email);
```

La otra forma de pasar un parámetro, y es la recomendada, es por nombre y no por posición. Usaríamos la anotación `@Param` y quedaría así:

```java
@Query("select e from Empleado e where e.nombre=:nombre and e.email=:email")
Empleado obtenerEmpleadoPorNombreYEmail(@Param("nombre") String nombre, @Param("email") String email);
```

El método anterior podría ser resuelto por un método derivado por nombre de forma más sencilla. Como ejemplo de consultas que debemos hacer mediante Query, ya que no son compatibles con métodos derivados por nombre, tendríamos las agregaciones. El siguiente ejemplo devuelve la suma de los salarios de todos los empleados de un género que es pasado como parámetro:

```java
@Query("select sum(e.salario) from Empleado e where e.genero=:genero")
Optional<Double> querySumSalarioByGenero(@Param("genero") Genero genero);

```

Spring Data también es compatible con SQL native, añadiendo el parámetro *nativeQuery* a la consulta:

```java
@Query(nativeQuery = true, value = "select count(1) from Empleado")
long obtenerTotalFilas();
```

#### Actualizaciones con @Query

@Query también admite operaciones de actualización y eliminación con JPQL (no inserciones) añadiendo la anotación @Modifying.
```java
@Modifying
@Query("update Empleado e set e.email = :email where e.id = :id")
int updateEmailById(@Param("id") Integer id, @Param("email") String email);
```

Este tipo de operaciones requiere que la llamada a este método, desde un servicio, esté anotada con @Transactional, que trabajaremos más adelante, igual que los Joins.

<details>
<summary>

**DEPRECATED**

</summary>

> **ACTIVIDAD 4:**
> Partiendo del proyecto de los alumnos, asignaturas y profesores: 
> - Crea los formularios de edición partiendo de los formularios anteriores (cambiando `add` por `edit` en la URI). Incluye en el formulario de edición alguna de las técnicas que vimos en el apartado 5.3 (atributos ocultos en formularios) para gestionar las `id` y no te olvides de anotar con `@Transactional` los servicios que empleen la edición si usas un query.
> Además, utiliza @Query para crear las siguientes URIS.
> - /alumnos/{profesor}: Muestra todos los alumnos a los que el profesor {profesor} da clases. Muestra también en qué asignatura es.
> - /emails/: Muestra los emails de los profesores y los alumnos.


> **ACTIVIDAD 5:** Configura la aplicación para que el repositorio sea persistente. Sigue las instrucciones del apartado anterior de configuración.

</details>

> **ACTIVITY 4:**
> Based on the students, courses, and teachers project:
> - Create the edit forms, if you have not created them yet. Include hidden attribute techniques from section 5.3 to manage IDs, and remember to annotate services with `@Transactional` if using a query for editing.
> Use @Query to create the following URIs:
> * `/alumnos/{profesor}`: Shows the students enrolled in subjects which are taught by {profesor}
> * `/alumnos/oldest/{num}`: Shows the *num* oldest students (being num an integer number greater than 0).

> **ACTIVITY 5:** Configure the application so the repository is persistent. Follow the instructions in the previous configuration section.