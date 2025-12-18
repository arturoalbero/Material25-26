# 6.3 Mapeo de asociaciones

## 1. Mapeo de asociaciones

Las entidades de nuestro modelo (clases) no están aisladas, sino que se relacionan entre ellas. Así pues, si tenemos en nuestro modelo de dominio una entidad "Libro" y una entidad "Autor" lo lógico es que exista una relación entre ellos. Los diagramas de clase UML son una forma de representación habitual de estas relaciones.

Un aspecto importante de estas asociaciones entre entidades es la cardinalidad o multiplicidad, es decir, cuántos elementos de una entidad se pueden relacionar con los de otra. Así hablamos de relaciones 1 a 1, 1 a muchos y muchos a muchos.

JPA nos permite representar las asociaciones entre clases mediante una serie de anotaciones en las entidades. Estas relaciones se establecerán generando claves ajenas o tablas adicionales y realizarán los join necesarios cuando vinculemos instancias de las clases involucradas en la relación. Todo de forma transparente para nosotros.

## 2. `@ManyToOne`

Es una de las relaciones que más nos vamos a encontrar y para resolverla añadiremos la anotación `@ManyToOne` en la entidad "muchos" y esa anotación hará referencia al elemento "uno" de la relación. Este elemento "uno", por supuesto, también estará anotado con `@Entity`.

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
Si consultamos la consola H2 después de iniciar la aplicación podemos ver que en la tabla Empleado añade una nueva columna llamada Departamento_id y que el nombre de la restricción es generado con carácteres al azar.

Opcionalmente, podemos añadir las anotaciones `@JoinColumn`, que nos permite indicar el nombre de la columna que hará las funciones de clave externa, así como `@ForeignKey`, con la que podemos indicar el nombre de la restricción que se creará a nivel de base de datos, algo muy útil para depurar errores.

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

### 2.1 Borrados cuando hay relaciones

Siguiendo con el ejemplo de Departamento y Empleado, si creamos un repositorio JPA con las operaciones básicas CRUD sobre Departamento, si tratamos de borrar un departamento que tiene empleados asignados se producirá una excepción. Esto sucede debido a la restricción de clave foránea, ya que si se borrase solo el departamento, la base de datos quedaría inconsistente: habría empleados con un departamento inexistente asignado. Para solucionar esta situación tenemos varias opciones:

1. **Borrado en cascada**: Al borrar un departamento se borrarían todos sus empleados de forma automática:
```java
@ManyToOne
@OnDelete (action = OnDeleteAction.CASCADE)
private Departamento departamento;
```
> Más adelante veremos la diferencia entre `@OnDelete` y `CascadeType.REMOVE`.

2. **Fijado a null**: Al borrar un departamento se fija a null la clave ajena en todos sus empleados. A nivel de integridad no es una buena opción e Hibernate no lo permite. Para hacer esto, deberíamos crear el esquema por fuera de Hibernate (es decir, con un *schema.sql*) y añadir el atributo ON DELETE SET NULL a la restricción de clave foránea.

3. Una última opción sería verificar antes del borrado que no hay empleados asignados a ese departamento. Podríamos crear en el repositorio de Empleado un método para este fin:
```java
@Query ("select count (e) from Empleado e where e.departamento.id = ?1")
Long cantidadEmpleadosDpto(Long idDepto);
```

Y luego, en el servicio de Departamento, en el método de borrado de departamentos, antes de hacer el borrado, verificar que no hay empleados en ese departamento. Necesitaríamos inyectar el repositorio de Empleados en este servicio para poder invocar el método que acabamos de crear:

```java
public void borrar(Long id){
    Long cantEmpleadosDepto = empleadoRepository.cantidadEmpleadosDpto(id);
    if (cantEmpleadosDepto == 0) departamentoRepository.deleteById(id);
}
```

## 3. `@OneToMany`

Esta asociación es la inversa a la anterior, nos permite enlazar dos entidades, pero añadiendo la anotación a la entidad "uno". Para ello, en esa clase, además de `@OneToMany` incluiremos una colección de elementos "muchos". Vamos a definir una relación de 1 Empleado tiene MUCHAS nóminas:

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
Aunque es típico que la colección empleada sea un ArrayList, también puede ser un conjunto (Set), opción recomendada por Hibernate para conseguir mayor eficiencia. Los conjuntos no tienen posiciones como tal y no admiten duplicados.
```java
private Set<Nomina> nominas = new HashSet<>();
```

## 4. Relaciones bidireccionales y unidireccionales

Si la asociación `@OneToMany` entre dos entidades no tiene la correspondiente `@ManyToOne` entre ellas en sentido contrario, decimos que es unidireccional, y es tal cual la hemos definido en los ejemplos anteriores. En caso de que sí exista la complementaria, decimos que la relación es **bidireccional**. La parte `@ManyToOne` se queda igual, pero en la parte `@OneToMany` tenemos que añadir el argumento `mappedBy="nombreColumna"`:

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
Aspectos importantes de las relaciones bidireccionales:

* Al tener List "nóminas" mediante su getter podemos acceder a todas las nóminas de un empleado mediante un simple getNominas() sin necesidad de métodos adicionales en el repositorio de nóminas. Si fuese solo unidireccional, necesitaríamos un método como `findByEmpleado(Empleado empleado)` en el repositorio de nóminas.
* Gracias a la anotación `CascadeType.All`, las relaciones se mantendrán sincronizadas cuando empleemos los métodos típicos de repositorios como JpaRepository. Es decir, al guardar un empleado se guardarán todas sus nóminas, al borrar un empleado se borrarán todas ellas, etc.
* Incluimos la anotación `@ToString.Exclude` a la anotación en Empleado ya que un empleado referencia a sus nóminas pero, a su vez, cada nómina referencia a su empleado y así sucesivamente. Esta anotación, por lo tanto, previene ese bucle infinito y habría que añadirla en todas las relaciones bidireccionales. Se puede usar en cualquiera de los dos lados de la relación.
* Hibernate recomienda en su cuaderno de buenas prácticas establecer las relaciones 1 a N de forma bidireccional, ya que facilita la navegación por sus atributos en ambos sentidos. Sin embargo, habrá casos en los que no sea aconsejable, por ejemplo si hubiese millones de nóminas para un solo empleado, la colección tendría un tamaño muy grande y podría resentirse su eficiencia.

En relaciones bidireccionales, el lado `@ManyToOne` es el **propietario**; `@OneToMany` solo refleja.

### CascadeType.All vs CascadeType.Remove vs OnDeleteAction.Cascade vs orphanRemoval=true

Cuando tenemos dos entidades y una de ellas depende de la otra, CascadeType hace referencia a todas las operaciones a realizar en cascada sobre la entidad dependiente cuando se produce un cambio en una entidad principal. Un caso típico es el borrado: Al borrar un empleado, se borrarían todas sus nóminas.

Este comportamiento se gestiona mediante los valores asignados al atributo CascadeType de forma que, si toma el valor REMOVE, solo los borrados se propagarán en cascada. Si toma el valor ALL, será cualquier operación la que se propagará.

Por otro lado, OnDeleteAction.CASCADE realiza la misma operación que CascadeType.Remove pero actúa en el extremo opuesto de la relación.

```java 
@Entity
public class Nomina{
    (...)
    @ManyToOne
    @OnDelete(action = OnDeleteAction.Cascade)
    private Empleado empleado;
    //AL BORRAR UN EMPLEADO, SE BORRAN TODAS SUS NÓMINAS
}
```
```java
@Entity
public class Nomina{
    (...)
    @ManyToOne(cascade = CascadeType.REMOVE)
    private Empleado empleado;
    //AL BORRAR UNA NÓMINA, SE BORRARÍA EL EMPLEADO. ¡¡¡ESTA OPCIÓN ESTÁ MAL!!!
}
```
```java
@Entity
public class Empleado{
    @OneToMany(cascade = CascadeType.ALL) //o CascadeType.REMOVE
    private List<Nomina> nominas = new ArrayList<>();
    //AL BORRAR UN EMPLEADO, SE BORRAN TODAS SUS NÓMINAS.
}
```

Para terminar, tenemos el atributo orphanRemoval que hace algo parecido a CascadeType.REMOVE, aunque más bien lo complementa. Lo que hace es borrar aquellos objetos no referenciados por nadie (es decir, huérfanos).

Para tenerlo claro, podemos recordar que:

- **El `cascade` siempre va desde la entidad que controla el ciclo de vida hacia la dependiente.** En padre–hijo sería **ONE to MANY**
- **Nunca pongas `CascadeType.REMOVE` en un `@ManyToOne`.** Borrar un hijo **no debe borrar al padre**.
- **`cascade` es JPA; `@OnDelete` es base de datos. No son equivalentes.**
    * `cascade`: Hibernate decide
    * `@OnDelete`: SQL decide

- **`orphanRemoval = true` borra hijos cuando salen de la colección, no cuando se borra el padre.** Es para *gestionar la colección*, no para cascadas normales.

Por lo tanto, la configuración más común será:

```java
@OneToMany(
    mappedBy = "empleado",
    cascade = CascadeType.ALL,
    orphanRemoval = true
)
private List<Nomina> nominas;
```

Usaremos `@OnDelete` solo si necesitamos protección a nivel BD (scripts, otras apps, datos legacy). En JPA, el `cascade` se define desde quien controla el ciclo de vida. `@OnDelete` no expresa dependencia, solo delega el borrado a la base de datos.

## 5. `@ManyToMany`

Como su nombre indica, en este tipo de asociaciones una o varias instancias de una entidad pueden relacionarse con una o muchas de la otra entidad. Siguiendo con el ejemplo de empleados, podríamos tener una entidad Proyecto y decir que un empleado puede colaborar en varios proyectos y que en un proyecto colaboran varios empleados.

Estas asociaciones muchos a muchos necesitan una tabla que realice el enlace entre ambas entidades asociadas. También disponen de un tratamiento unidireccional y bidireccional.

### Tratamiento unidireccional

Debemos definir cuál de las entidades es la propietaria y en ella incluiremos la lista de elementos de la clase opuesta, como en `@OneToMany`.
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
Por otra parte, la otra entidad no tendrá ningún atributo adicional. `@JoinTable` se usa para definir explícitamente una tabla intermedia que une dos entidades relacionadas. joinColumns es la FK que apunta a la entidad propietaria, inverseJoinColumns apunta a la otra entidad.

### Tratamiento bidireccional

En este caso, añadiremos en el ado no propietario el atributo mappedBy y una colección para almacenar los elementos de la entidad opuesta:

```java
@Entity
public class Proyecto{
    (...)
    @ToString.Exclude
    @ManyToMany(mappedBy = "proyectos")
    private List <Empleado> empleados = new ArrayList<>();
}
```
### Relaciones con atributos extra

Habrá atributos que sean propios de la asociación, en este ejemplo, el "puesto" dentro de un proyecto sería un atributo de este tipo, ya que un mismo empleado puede tener distintos puestos en distintos proyectos. Algunos autores llaman a este tipo de asociación con atributos "clase de asociación".

En general, este será el modelo que emplearemos para relaciones muchos a muchos ya que, aunque en un principio parezca que no tenemos atributos extra, pueden aparecer más adelante y, de emplear otro modelo, habría que rehacer de nuevo las relaciones. 

Como este nuevo puesto no es ni del empleado ni del proyecto, no lo podemos colocar en ninguna de las dos entidades, por lo que tenemos que generar una nueva entidad con los atributos extra:
```java
@Entity
public class Colaboracion{
    @NotEmpty
    private String puesto;
}
```

Ahora tenemos que tomar una decisión sobre la clave de esta nueva entidad. Por una parte, podemos hacer como en entidades anteriores y generar un nuevo atributo al que llamaríamos algo como id y lo anotaríamos con `@Id`. La otra opción sería que la clave estuviese formada por dos atributos, el id de empleado y el id del proyecto.

Vamos a optar por la primera solución, por su sencillez:

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
Opcionalmente, si deseamos que la relación sea bidireccional, añadiremos a cada una de las entidades extremo de la relación las asociaciones `@OneToMany` con la nueva entidad creada.

## 6. `@OneToOne`

Son asociaciones similares a las `@OneToMany`, pero en el extremo en el que antes teníamos una colección ahora tendremos una única instancia. Al igual que aquellas, estas relaciones también pueden ser unidireccionales o bidireccionales. Imaginemos que cada Empleado tiene un coche y que un coche solo pertenece a un empleado:
```java
@Entity
public class Empleado{
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    //En caso de querer relación bidireccional añadiríamos:
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
A tener en cuenta:
* Pensando en las vistas de usuario, será en el alta/edición de coches donde introduciremos opcionalmente el empleado asignado a ese coche y no al revés, no habrá atribución de coche en el alta/edición de empleado.
* Pensando en la lógica de negocio, la matrícula de un coche debe ser única, por lo que en el alta/edición habrá que asegurarse de que la matrícula introducida no está asignada a otro coche.
* También al relacionar un coche con un empleado debemos verificar que dicho empleado no esté asignado en ningún otro coche.
* Otro aspecto a resaltar es que, en este caso, no hemos añadido opciones de borrado en cascada, ya que al eliminar un coche no necesariamente hay que eliminar su empleado (a este se le puede asignar otro coche) y viceversa. Esto provocará un error si intentamos hacer un borrado de empleado con coche asignado ya que el id de Empleado es clave ajena de Coche. Antes de borrar un empleado, debemos asegurarnos de que no tiene coche asignado.

> Como norma general, antes de hacer un borrado de una entidad debemos revisar que ese objeto no tenga relaciones con otros, salvo que queramos proceder a los borrados en cascada.

---

> **ACTIVIDAD 1:** Realiza los mapeos correspondientes en el proyecto del apartado anterior (el de alumnos, profesores y asignaturas). Recuerda que la base de datos era:
> - Queremos una base de datos en la cual estén registrados alumnos (id, nombre, email, fecha de nacimiento, direccion, teléfonos), profesores (mismos atributos que alumnos y departamento, categoría [FIJO, INTERINO]) y asignaturas(id, nombre, descripción). 
>   - Un alumno puede cursar muchas asignaturas y una asignatura puede tener muchos alumnos.
>   - Un profesor puede impartir muchas asignaturas, pero una asignatura solo puede ser impartida por un profesor.
> Comprueba en la consola de H2 el funcionamiento correcto de la aplicación. Usa mapeos **unidireccionales** y un `@ManyToMany`. Reescribe las operaciones definidas en las actividades del apartado anterior usando las entidades ya mapeadas.

----

> **ACTIVIDAD 2:** Haz una nueva versión de My Favourite Composer empleando:
> - Entidades y mapeo relacional con Hibernate. Que emplee una base de datos persistente H2.
>   - Modifica las clases para que la base de datos gestione bien las claves primarias y las claves ajenas.
> - Lombok para generar los getters y los setters.
> - Repositorios usando las interfaces Repository.
> - La estructura de paquetes de servicios, controladores, entidades y repositorios.
> Además, organiza las URIs para conseguir lo siguiente:
>
> **CREATE:**
>
> - `add/composer`: Formulario para añadir compositores.
> - `add/music-piece`: Formulario para añadir piezas musicales.
>
> **READ**
>
> - `show/composer`: Muestra todos los compositores. Permite organizarlos por diferentes criterios (alfabético, por fecha, etc.).
> - `show/music-piece`: Muestra todas las piezas musicales. Permite organizarlas por diferentes criterios (alfabético, por fecha, etc.). Permite la eliminación de piezas.
> - `search/composer`: Búsqueda de compositores según diferentes criterios (nombre, nacionalidad, etc.). Añade `/result` para la vista del resultado. Parecida a `show/composer`.
> - `search/music-piece/`: Búsqueda de piezas musicales según diferentes criterios (nombre, instrumentación, etc.). Añade `/result` para la vista del resultado. Parecida a `show/music-piece`.
>
> **UPDATE**
>
> - `edit/composer/{id}` : Formulario para editar al compositor con esa {id}.
> - `edit/music-piece/{id}`: Formulario para editar la pieza musical con esa {id}.
>
> **DELETE**
>
> - `delete/composer/{id}`: Elimina un compositor. Elige si quieres que las piezas musicales se eliminen en cascada, pongan el compositor a *null* o que el compositor no se pueda eliminar hasta que no se eliminen las piezas asociadas.
> - `delete/music-piece/{id}`: Elimina una pieza musical.
>
> Como ves, son las operaciones básicas de un CRUD, así que emplea los repositorios de forma adecuada para conseguir  que funcione todo de forma correcta. Emplea servicios y mantén muy clara la separación entre modelo, vista y controlador (MVC) para que en un futuro, cambiando solamente el controlador podamos usar API-REST. **[Puedes recordar aquí el MVC](https://developer.mozilla.org/es/docs/Glossary/MVC)**. En este caso, crea las vistas que necesites con **Thymeleaf** (que sean funcionales, puedes reciclar las anteriores versiones de las vistas si lo ves oportuno).
>
> Comprueba que la base de datos se genera de forma correcta en la consola de H2. Comprueba también que las inserciones, actualizaciones y borrados se realizan de manera adecuada. Usa mapeos **bidireccionales**.
> 
> Para la base de datos, puedes seguir un esquema relacional similar a este:
> ![alt text](image.png)
