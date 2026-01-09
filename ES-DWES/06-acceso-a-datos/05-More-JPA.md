# 6.5 Más acerca de JPA

## 1. Fetch Type

Existen distintos tipos de captura o búsqueda (Fetch type) en función de cómo se efectúa la búsqueda de los datos, hablando de relaciones entre entidades:
* **Lazy**: El dato no se solicita hasta que se referencia.
* **Eager**: Los datos se consultan por adelantado.

Por defecto, JPA usa Lazy para `@OneToMany` y `@ManyToMany`, mientras que Eager para los demás. Esto tiene sentido, pues son esos dos tipos los que a más objectos conectan en el otro lado de la relación. Al ser Lazy el comportamiento por defecto, no debemos hacer nada para declararlas como tal. Si queremos que sean Eager (evitaremos problemas a costa de empeorar el rendimiento) podemos especificarlo en la anotación de la relación:
```java
@OneToMany(fetch = FetchType.EAGER)
```

Los fetch de tipo Lazy tienen un problema: Una vez una entidad contenedor ha sido desconectada del gestor de persistencia (por ejemplo, al enviarla de vuelta al código cliente que la solicitó), esta se envía tal y como está en ese momento sin importar en qué estado estén sus relaciones que hayan sido marcadas como Lazy. 

Si una relación ha sido inicializada antes de desconectar la entidad del gestor de persistencia, podremos acceder a sus valores de forma normal. En caso contrario, la relación no apuntará a ningún objeto y, por tanto, obtendremos una excepción al internar manejarla.

## 2. Paginación

Cuando una consulta sobre un repositorio devuelve un volumen de datos elevado, puede ser interesante ir recuperándolos en subconjuntos más pequeños y que, a través de distintos eventos (como puede ser la petición del usuario), vayamos recuperando cada parte del conjunto total de datos, de bloque en bloque. Esto es lo que se conoce como **paginación**.

A veces esto ocurre de forma transparente para nosotros, como cuando deslizamos el dedo por la pantalla del móvil para avanzar las fotos de redes sociales como Instagram. El móvil no recibe todas las fotos posibles, sino que las va recibiendo desde el servidor en conjuntos pequeños.

Spring tiene definida dentro de la jerarquía de interfaces de repositorio la interfaz ***PagingAndSortingRepository<T,ID>*** que define métodos que facilitan la ordenación y el paginado. Como la interfaz JpaRepository implementa esta interfaz, podemos usar sus métodos directamente. Puedes consultar los métodos en el apartado 2, pero los más importantes son ***Iterable<T> FindAll(Sort sort)*** y ***Page<T> findAll(Pageable pageable)***. En el primer caso:
```java
empleadoRepository.findAll(Sort.by(Sort,Direction.DESC, "email")); //Devuelve las entidades ordenadas por el objeto Sort pasado como parámetro. En este caso, con los emails ordenados descendentemente.
```
En cuanto al segundo, devuelve un objeto ***Page*** con las entidades devueltas, de acuerdo con las restricciones proporcionadas por el objeto ***Pageable*** pasado como parámetro.

Este objeto nos permite definir tres parámetros fundamentales en la paginación:
* Número de página que estamos tratando en esta petición. Si la consulta devuelve 20 páginas, este parámetro lo moveremos entre 0 y 19.
* Tamaño de la página, es decir, cantidad de registros de cada conjunto devuelto.
* Criterio de ordenación.
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
> **ACTIVIDAD 1:** En ***MyFavouriteComposer***, haz una búsqueda de todos los compositores usando paginación. Prueba con un tamaño de página variable, que pueda ser introducido en la vista por el usuario. Después haz una vista para ver las diferentes páginas. Es como cuando buscas productos en una página de venta y te muestra los 10 primeros resultados y puedes cambiar de página.
* El usuario determina el tamaño de la página. 
* Se presenta una vista con la página correspondiente. 
* El usuario puede alternar entre diversas páginas. Pon enlaces de tipo 1, 2..Última. Por simplificar, pon tantos enlaces como páginas haya.
* El usuario puede cambiar en cualquier momento el tamaño de la página (lo que reiniciaría la búsqueda).

## 3. Herencia

Tanto en Hibernate como en JPA se definen tres estrategias para mapear relaciones de herencia a tablas de nuestra base de datos.
* **Single Table**: Una sola tabla para guardar toda la jerarquía de clases. Tiene la ventaja de ser la opción que mejor rendimiento da, ya que sólo es necesario acceder a una tabla (totalmente desnormalizada). Tiene como inconveniente que todos los campos de las clases hijas tienen que admitir nulos, ya que cuando guardemos un tipo, los campos correspondientes a los otros tipos de la jerarquía no tendrán valor. Es la estrategia por defecto. Necesitamos las anotaciones `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` y `@DiscriminatorColumn(name = "discriminador")`, siendo el `"discriminador"` la columna que nos indicará el tipo de hijo.

* **Joined**: Una tabla para el padre de la jerarquía, con los atributos comunes, y otra tabla para cada clase hija con los atributos concretos. Es la opción más normalizada y, por tanto, la más flexible, ya que para añadir nuevos tipos basta con añadir nuevas tablas y, si queremos añadir nuevos atributos, solo hay que modificar la tabla correspondiente al tipo donde se está añadiendo el atributo. Tiene la desventaja de que, para recuperar la información de una clase, hay que ir haciendo join con la tabla de la clase padre. Necesitamos solamente la anotación `@Inheritance(strategy = InheritanceType.JOINED)`.



* **Table per class**: Una tabla independiente para cada tipo. En este caso cada tabla es independiente, y los atributos del padre (atributos comunes en los hijos), tienen que estar repetidos en cada tabla. En principio, puede tener problemas de rendimiento por lo que es la menos recomendada. 

> **ACTIVIDAD 2:** Vamos a volver a la base de datos que habíamos construido en la actividad 1 del punto 3. Para que la recuerdes, el enunciado era el siguiente:
> - Queremos una base de datos en la cual estén registrados alumnos (id, nombre, email, fecha de nacimiento, direccion, teléfonos), profesores (mismos atributos que alumnos y departamento, categoría [FIJO, INTERINO]) y asignaturas(id, nombre, descripción). 
>   - Un alumno puede cursar muchas asignaturas y una asignatura puede tener muchos alumnos.
>   - Un profesor puede impartir muchas asignaturas, pero una asignatura solo puede ser impartida por un profesor.
> Como puedes observar, tanto profesor como alumno comparten los atributos `id`, `nombre`, `email`, `fecha de nacimiento`, `direccion` y `teléfonos`. Vamos a añadirle al alumno el atributo `promoción`, en el que se refleje el año en el que se matriculó en el centro. Determinaremos una relación de herencia, en el que `individuo` será la clase abstracta padre de `alumno` y `profesor`.
> * Diseña la herencia usando la estrategia SINGLE_TABLE.
> * Diseña la herencia usando la estrategia JOINED.
> Compara los resultados obtenidos.

## 4. Otras anotaciones

Disponemos de otras anotaciones relacionadas que pueden resultar útiles.

> **ACTIVIDAD 3:** Busca información sobre las siguientes anotaciones:
> * `@Transactional`
> * `@IdClass`
> * `@NaturalId`
> * `@Transient`
> * `@Enumerated`
> * `@Temporal`
> * `@MapsId`
>
> Acompaña cada anotación de un ejemplo sencillo.  

> **ACTIVIDAD 4:** Mejora My Favourite Composer para incluir conceptos avanzados de JPA. Por ejemplo, `@Enumerated` para los enumeradores y `@Temporal`.

## 5. Entity Manager

Esta es una interfaz fundamental de JPA, ya que se encarga de realizar todas las operaciones de persistencia sobre la base de datos: establece la conexión transaccional con la base de datos, mantiene en memoria una caché con las entidades gestionadas y las sincroniza correctamente con la base de datos cuando se realiza un ***flush***. El conjunto de entidades que gestiona un entity manager se denomina en su contexto *de persistencia*. 

En nuestro caso, todo este proceso se está haciendo de forma transparente para nosotros, todo gestionado por los repositorios, pero podríamos crearlo nosotros mismos y usar sus métodos, por ejemplo `persist()`, para guardar los datos, `remove()` para borrarlos, etc.

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

Como en este caso implementamos nosotros el repositorio, tenemos que marcarlo con la anotación `@Repository`. En Spring, **`@Repository`** es una **anotación de estereotipo** que se usa para marcar una clase como **componente de acceso a datos (DAO)**.

`@Repository` indica que una clase:

1. **Es un bean de Spring**: Spring la detecta automáticamente durante el *component scanning*.
2. **Pertenece a la capa de persistencia**: Es semánticamente equivalente a `@Component`, pero con un propósito claro.
3. **Activa la traducción de excepciones**: Spring convierte excepciones específicas del proveedor (JPA, Hibernate, JDBC…) en excepciones genéricas de Spring (`DataAccessException`).

No hace falta con `JpaRepository` porque, cuando haces esto:

```java
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
```
Spring **detecta la interfaz**, genera una clase proxy en tiempo de ejecución y registra ese proxy **como un bean `@Repository`**. Internamente, Spring Data JPA ya marca ese bean como `@Repository`. No obstante, puedes añadir la anotación de forma opcional, por claridad, si lo deseas.

