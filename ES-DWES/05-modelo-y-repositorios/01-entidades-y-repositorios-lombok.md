# 5.1. El modelo de dominio: Entidades. Uso de Lombok. Logging

## 1. Entidades: El modelo de dominio

El **modelo de dominio** de nuestro sistema va a ser el conjunto de toda la información relevante para la aplicación. Cada elemento de ese esquema se denomina **entidad** y cada entidad tendrá características que la describen y que tomarán diferentes valores para cada instancia de entidad. Por otra parte, esas entidades tendrán relaciones y asociaciones entre ellas.

En el caso de la programación orientada a objetos esas entidades serán clases y sus características serán los atributos de cada clase. Finalmente, en un ambiente relacional, esas clases serán mapeadas a tablas y los atributos a columnas de las tablas, para lograr su persistencia, aunque eso lo veremos más adelante.

Las clases que son las entidades de nuestro modelo incluirán generalmente los atributos con acceso privado, getters, setters, constructores, métodos comunes (*equals*, *hasCode*, *toString*, etc.) y métodos propios de su comportamiento.

Como vimos en el capítulo de los formularios, adicionalmente, las clases pueden incorporar ciertas restricciones en sus atributos (`@NotNull`, `@NotEmpty`, etc), que serán validadas de forma automática por el sistema, produciendo una excepción en el caso de que no se cumplan.

En cuanto a la ubicación de las clases que forma el modelo de dominio, podemos hacer un paquete con todas ellas y llamarle, por ejemplo, **domain**, o bien crear paquetes orientados a cada dominio, y que un mismo paquete contenga su controlador, servicios asociados, etc. Como siempre, estos paquetes deben ser subpaquetes del paquete raíz que contiene la aplicación (la clase con el main).

Los ***commandObject*** de los formularios, si son hechos ad-hoc y no se corresponden con ninguna entidad del dominio, podemos guardarlos en una carpeta o paquete llamado dto (DATA TRANSFER OBJECTS), de los cuales hablaremos más adelante.

## 2. Lombok

Lombok es una librería que, a través de anotaciones, reduce el código común que tenemos que codificar ahorrándonos tiempo y mejorando la legibilidad del mismo. Con esas anotaciones se pueden generar de forma automática getters, setters, constructores, etc, y esas transformaciones en el código se realizan en tiempo de compilación.

Tiene multitud de anotaciones, que se pueden emplear a nivel de atributo, método, clase, etc. A continuación, algunas de las más utilizadas:

* `@Getter` genera un getter público, con la forma getNombreDelAtributo, excepto si es un *booleano*, que será isNombreDelAtributo.
* `@Setter` análogo al anterior, pero con el método set.
* `@EqualsAndHashCode` crea los métodos `equals` y `hashCode`. Por defecto, ambos métodos se basan en los atributos de la clase, pero ese comportamiento se puede cambiar con parámetros.
* `@ToString` genera un método toString.
* `@NoArgsConstructor` genera un constructor sin parámetros.
* `@AllArgsConstructor` genera un constructor con todos los parámetros.
* `@Data` agrupa las anotaciones `@Getter`, `@Setter`, `@EqualsAndHashCode` y `@RequiredArgsConstructor`. Es muy **empleada**.
* `@Builder` genera un método para instanciar la clase de una forma más legible que con un constructor y desacopla dicha instanciación de forma que, aunque en un futuro cambien los constructores de la clase, la instancación con *builder* seguirá funcionando.

Para emplear Lombok, debes buscar su dependencia de Maven en https://mvnrepository.com e incluirla en el pom.xml del proyecto. También puedes añadirla como dependencia cuando creas el proyecto con Spring Initializr.

La anotación `@RequiredArgsConstructor` nos permite, desde la versión 4.3 de Spring, prescindir de la anotación `@Autowired` siempre y cuando los atributos que queramos cablear sean *finales*.
```java
@Controller
public class EmpleadoController{
    @Autowired
    private EmpleadoService empleadoService;
}
```
Es equivalente a:
```java
@Controller
@RequiredArgsConstructor
public class EmpleadoController{
    private final EmpleadoService empleadoService
}
```

> **ACTIVIDAD 1:** Rediseña la aplicación *My Favourite Composer* con un enfoque orientado a entidades. Recomiendo crear un nuevo proyecto desde cero, añadiendo las dependencias necesarias e incluyendo Lombok.
> - Agrupa los paquetes de forma correcta.
> - Diferencia los objetos que son entidades (Composer, Music Piece, etc.) de los DTO (objetos para recoger datos de los formularios).
> - Crea las clases de nuevo, usando Lombok.
> - Reutiliza las vistas y los controladores que puedas
> - Elimina toda la lógica de negocio que hayas puesto en los controladores y trasládala a diferentes servicios, que interactúen con las entidades (esto posiblemente ya lo tengas hecho).

## 3. Logging con Lombok

El sistema de logging de nuestra aplicación se encarga de mostrar los distintos eventos que están corriendo durante la ejecución. Con los logs podemos descubrir errores, comportamientos extraños, pero también **auditar ataques**. En Java hay varios sistemas de logging(Log4j, logback, java.util.logging...) y existe una capa de abstracción sobre todos ellos: `slf4j` (acrónimo de *Single Logging Facade For Java*).

En estas librerías de *logging*, las trazas se emiten a través de un *logger* que, normalmente, corresponde con el nombre de la clase en la que se emite la traza. De esta forma, las trazas se pueden filtrar por el nivel de importancia de la traza(debug, info, warn...) y por el nombre del *logger* de forma que podemos obtener un registro de las trazas emitidas por los *loggers* que deseamos. Si añadimos la anotación Lombok `@Slf4j` en nuestra clase, podemos generar un log así:
```java
private static final org.slf4.Logger log = org.slf4j.LoggerFactory.getLogger(LogExample.class);
```

Una vez incorporada, podemos usar sus métodos para añadir información al log con distintos niveles de criticidad (info, warn, error...) y que veremos por consola. 

```java
log.info("Información");
```

Para más información, consula **[este vídeo](https://www.youtube.com/watch?v=yTokW18ujZI)**.

> **ACTIVIDAD 2:**
> Añade logs a la aplicación.
> - Un log de info para cada controlador, para saber cuándo se accede a ellos.
> - Un log de info para los servicios, para comprobar que se está efectuando lo que queremos.
> - Un log de warning si:
>   - El compositor añadido vivió o vive más de 100 años.
>   - Si la pieza añadida a un compositor tuvo el estreno después de su fecha de nacimiento.
> - Añade un log de error cada vez que salte una excepción que tengas controlada.
>   - Añade una casuística más para no permitir añadir una pieza: Que su estreno sea anterior al nacimiento del compositor.

