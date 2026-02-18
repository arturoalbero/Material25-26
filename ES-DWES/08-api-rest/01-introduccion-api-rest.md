# Introducción a API REST

## 1. Introducción a API REST

Hasta ahora, las aplicaciones que hemos desarrollado incluyen en un solo proyecto todas las capas necesarias, a excepción del navegador y la base de datos. Esta arquitectura nos ha facilitado un despliegue sencillo y aprender la tecnología más fácilmente.

Aunque este enfoque es el más recomendable para proyectos pequeños, tienen como inconveniente que no responden ante clientes heterogéneos, sino que solo lo hacen para aquel que fueron diseñadas (el navegador web). Para solucionar esta situación, se opta por desacoplar la capa de presentación. Los enfoques más usados en la actualidad son GraphQL y REST, el que vamos a trabajar.

REST es un enfoque propuesto por Roy Fielding en su tesis doctoral y estas son sus bases:

* La comunicación entre el cliente y el servidor se hace mediante el protocolo HTTP y sus verbos (GET, PUT, POST, DELETE, etc.)
* Es una comunicación sin estados. Cada petición-respuesta es completa, no necesita sincronizarse con otras peticiones.
* Los recursos a los que acceden los diferentes tipos de clientes se mapean mediante una URL y se denominan **end-points**.
* Los datos se envían al cliente, normalmente en formato JSON. El cliente lo procesa como desee. El cliente también pueden enviar datos al servidor en la petición, en el mismo formato.
* No es exclusivo de Java.
* El cliente no tiene por qué ser un solo cliente final, puede ser otra aplicación. De hecho, una aplicación se puede conectar a múltiples REST.
* Son la base para la arquitectura de aplicaciones basada en microservicios.

Los verbos HTTP más frecuentes, que se pueden identificar con el CRUD, son: 
* **POST**: Envía datos en el cuerpo de la petición para crear **nuevos** recursos. (CREATE)
* **GET**: Solicita un recurso al servidor. (READ)
* **PUT**: Envía datos en el cuerpo de la petición para editar un recurso existente. (UPDATE)
* **DELETE**: Borra un recurso del servidor.

> **IMPORTANTE** Cada verbo de HTTP tiene su anotación Mapping en Spring. Es decir, además de `@GetMapping` y `@PostMapping` tenemos `@PutMapping`, `@DeleteMapping`, etc.

## 2. API REST en Spring

Spring, a través de su dependencia starter-web, facilita el trabajo de "restificar" nuestras aplicaciones de forma sencilla. Estas son sus características:
* El cambio con respecto a las aplicaciones anteriores solo afecta a la capa del controlador y las vistas.
* Se sustituye la anotación `@Controller` por `@RestController`, que incluye un controller y un responseBody. De esta forma, sus métodos por defecto devuelven un cuerpo de respuesta HTTP y no un String como antes.
* Las vistas no tienen sentido. Son las aplicaciones clientes las que las facilitarán. En la arquitectura APIREST, el backend solo se encarga de los datos.
* Spring realiza la conversión de clase Java a cuerpo de respuesta, así que nuestro método de controlador puede devolver una clase de nuestro modelo o un DTO, que se convertirá de forma transparente para nosotros en un objeto para el peticionario, normalmente en formato JSON.
```java
@RestController
public class EmpleadoController{
    @Autowired
    private EmpleadoRepository empleadoRepository;

    @GetMapping("/")
    public Empleado getEmpleado(@PathVariable Long id){
        return empleadoRepository.findById(id).orElse(null);
    }
}
```

Disponemos de distintas clases para trabajar con peticiones y respuestas HTTP:

* `HttpMessageConverter`: se encarga de la conversión de clases JSON y viceversa usando librerías Jackson.
* `HttpEntity <T>` y sus dos subclases `RequestEntity <T>` y `ResponseEntity <T>`: representan una petición o respuesta HTTP completa con su cabecera y cuerpo. 
> **IMPORTANTE**: En el ejemplo anterior estamos devolviendo un empleado en el cuerpo de la respuesta, pero no gestionamos otros parámetros como el código de respuesta HttpStatus, esto lo hace Spring, pero con valores por defectos. Si empleamos estas clases tenemos un control más detallado.
* HttpHeaders: representa los encabezados de una petición o de una respuesta.
* RestClient: se emplea si queremos que nuestra API o la aplicación MVC sea a su vez cliente y haga peticiones a otras API REST remotas.
* Spring Data Rest: permite transformar un repositorio de Spring Data en API REST de forma sencilla sin apenas añadir código alguno.
* Spring HATEOAS (Hypermedia as Engine of Application State): permite incluir enlaces en los resultados devueltos en una respuesta REST para que el cliente pueda navegar de unos recursos a otros.

> **ACTIVIDAD 1:** En el proyecto MyFavouriteComposer, haz un RestController para /composer/{id} que se corresponda con la operación READ. Comprueba en el navegador como devuelve los datos del compositor. ***Los verbos PUT, POST y DELETE no se pueden probar en el navegador de forma efectiva.***

### 2.1 ResponseEntity<T>

Es una clase que nos va a permitir manejar la respuesta que damos a nuestros clientes de una forma más conveniente. Es una clase hoja de `HttpEntity<T>` que añade un atributo más para el código de estado de la respuesta.

En el apartado anterior vimos cómo en un método del RestController podíamos devolver una clase de nuestro modelo y que Spring se encargaba de convertirlo al cuerpo de una respuesta HTTP. Lo que no dijimos es que la cabecera de esa respuesta se construía por defecto y no teníamos forma alguna de personalizarla. Si lo que devolvemos es un ResponseEntity podremos configurar todos los parámetros de esa cabecera.

El proceso a seguir consiste en hacer que los métodos del RestController, en vez de devolver una clase del modelo, devuelvan un objeto de ResponseEntity. La clase dispone de diversos métodos estáticos que nos permiten construir la respuesta de forma sencilla. El método principal sería:
```java
ResponseEntity.status(n).body(recurso);
```
siendo n un código de estado y recurso el recurso que queremos enviar. Para los códigos tenemos la enumeración HttpStatus con valores OK, CREATED, NO_CONTENT, NOT_FOUND, FORBIDDEN, BAD_REQUEST,etc. En caso de que el cuerpo de la respuesta vaya vacío (habitual en borrados), sustituimos body(recurso) por build().
```java
ResponseEntity.status(HttpStatus.CREATED).body(empleado);
ResponseEntity.status(HttpStatus.NO_CONTENT).build();
```
Los códigos de respuesta para cada operación son:
* **GET** -> 200 (OK), 404 (NOT FOUND) si no se encuentra el recurso.
* **POST** -> 201 (CREATED), 400 (BAD REQUEST) si los datos recibidos son erróneos.
* **PUT** -> 200 (OK), 404 (NOT FOUND) si no se encuentra el recurso y 400 (BAD REQUEST) si los datos recibidos son erróneos.
* **DELETE** -> 204(NO CONTENT), 404(NOT FOUND) si no se encuentra el recurso a borrar.

***ResponseEntity*** dispone de métodos adicionales que agrupan el código de respuesta y el estado, pero no serían necesarios, simplemente nos permiten escribir la respuesta de una forma abreviada: `ResponseEntity.ok(objetoQueQueremosEnviar)`,`ResponseEntity.notFound().build()`, `ResponseEntity.noContent().build()`, etc.

Si queremos realizar una inserción directamente en el repositorio, sin servicio intermedio ni control de errores, podemos hacerlo así:
```java
@PostMapping("/")
public ResponseEntity<Empleado> nuevoEmpleado(@RequestBody Empleado nuevo){
    Empleado guardado = empleadoRepositorio.save(nuevo);
    return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
}
```
La anotación `@RequestBody`  es esencial en peticiones que llevan datos asociados, ya que permite inyectar en el método los datos recibidos, probablemente en JSON, que serán tratados en el método como cualquier otra clase Java. Los casos típicos de un CRUD son el alta y modificación de recursos, no así en consultas y borrados en las que no recibimos datos adicionales.

Cuando el elemento que añadimos al cuerpo es una entidad de nuestro modelo de dominio, este se transforma en formato JSON automáticamente. Cuando lo que enviamos es un valor sencillo lo habitual es definir un DTO con la estructura de esa respuesta, bien como clase o como record:
```java
public record EmpleadoDto(String nombre, Integer edad){}
```
Y devolver al cliente una instancia del dto:
```java
return ResponseEntity.ok(new EmpleadoDto("José López", 20));
```
> **IMPORTANTE:** Los DTO cobran especial valor precisamente en el manejo de API REST, para evitar el envío de información excesiva o comprometedora. Es por ello que **es una buena práctica que el controlador y el cliente se comuniquen mediante DTO** y no usando entidades del modelo de dominio.

También podríamos prescindir del DTO y construir un mapa, usando el nombre de cada atributo como clave y el contenido de estos como valor:
```java
String nombre = "José López";
Integer edad = 20;
Map<String, String> mapa = new LinkedHashMap<>();
mapa.put("nombre", nombre);
mapa.put("edad", edad.toString());
return ResponseEntity.ok(mapa);
```

### 2,2 Relaciones bidireccionales

Cuando tenemos relaciones bidireccionales entre entidades (`@OneToMany` y `@ManyToOne`) se pueden producir bucles infinitos a la hora de recuperar los datos de una petición: un empleado llevaría asociado una categoría, y esa categoría sus empleados, y así sucesivamente. 

Para evitar ese problema de recursividad tenemos varias opciones, una de ellas es generar clases DTO que no contengan la relación y adaptar controladores y servicios para trabajar con estos DTO allí donde sea necesario.

Otra opción más sencilla, es incluir la etiqueta `@JsonIgnore` en la clase "1" de la relación "1 a N", para el atributo con la lista de elementos "n". Así, a la hora de generar la respuesta en formato JSON para enviar al cliente, no se enviará la relación y, por tanto, se parará la recursividad, por ejemplo:

```java
public class Categoria{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Empleado> empleados = new ArrayList<>();
}
```

> **ACTIVIDAD 2**: Haz dentro de MyFavoriteComposer las operaciones CRUD siguiendo la arquitectura API REST, para compositores y piezas musicales:
> * `/composer/create/{id}` con el verbo POST
> * `/composer/read/{id}` con el verbo GET
> * `/composer/update/{id}` con el verbo PUT
> * `/composer/delete/{id}` con el verbo DELETE
> * Lo mismo con `/piece`.
> Utiliza PostMan para las pruebas. Consulta la [documentación oficial](https://learning.postman.com/docs/getting-started/overview) y/o mira este [tutorial](https://www.youtube.com/watch?v=ypKHnRmPOUk).

## 3. Gestión de Errores

En todos los ejemplos anteriores hemos hecho una gestión muy sencilla de los errores y sin tratamiento basado en excepciones, simplemente construíamos una respuesta vacía en la que asignábamos un código de respuesta para indicar el error, pero no enviábamos al cliente ningún mensaje adicional sobre el error producido.

En este apartado aprenderemos cómo gestionar los errores mediante excepciones y enviando al usuario una respuesta que, además del código de error, informe con un texto del error producido. Desde la versión 3.2 de Spring, disponemos de una nueva anotación llamada `@RestControllerAdvice` que permite gestionar de forma centralizada en  una sola clase todas las excepciones de toda una aplicación REST.

Por otra parte, desde Spring 5, también disponemos de una clase llamada ResponseStatusException, que ofrece una solución básica pero rápida para la gestión de errores, pero de forma individualizada, con una llamada para cada excepción.

> **NOTA:** Todo este apartado es análogo a lo que se trató en el punto 4.2 de gestión de errores, solo que esta vez con controladores REST.

### 3.1 ResponseStatusException

Es una clase derivada de RuntimeException y tiene 3 constructores mediante los que podemos asignarle el estado a devolver (HttpStatus), opcionalmente el mensaje de error (String) y opcionalmente, la causa del mismo. Al invocar a los constructores, enviamos al cliente la excepción producida, con los datos que acabamos de describir.

Un ejemplo sencillo de utilización sería este: supongamos un método del controlador que recibe un "id" de empleado y obtiene la instancia de empleado correspondiente del repositorio a través de un servicio. Si el servicio devuelve null cuando no encuentra el empleado buscado, podríamos lanzar una excepción con ResponseStatusException:
```java
@GetMapping("/empleado/{id}")
public Empleado findById(@PathVariable Long id){
    Empleado empleado = empleadoService.obtenerPorId(id);
    if(empleado == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Empleado no encontrado");
    return empleado;
}
```
De todas formas, esta no sería la forma más correcta de trabajar, ya que el método de servicio en caso de error no debería de devolver null, sino que debería de lanzar excepciones. O bien lanzar RuntimeException o bien sus propias excepciones personalizadas. El proceso a seguir sería el siguiente:

1. Definir las excepciones hijas de RuntimeException y con un constructor que puede recibir parámetros o no. El cuerpo del constructor solo invocará al constructor de RuntimeException con el mensaje asociado a esta excepción.
```java
public class EmpleadoNotFoundException extends RuntimeException {
    public EmpleadoNotFoundException(Long id){
        super("No se puede encontrar empleado con ID: " + id);
    }
}
public class EmptyEmpleadosException extends RuntimeException{
    public EmptyEmpleadosException(){
        super("No hay empleados en el sistema");
    }
}
```
2. En el servicio, al llamar a los métodos del repositorio, podemos invocar a las excepciones en caso de error:
```java
public Empleado obtenerPorId(long id){
    Empleado empleado = repositorio.findById(id).orElseThrow(()-> new EmpleadoNotFoundException(id));
    return empleado;
}
```
La otra opción sería lanzar directamente RuntimeException, sin crear excepción alguna:
```java
public Empleado obtenerPorId(long id){
    Empleado empleado = repositorio.findById(id).orElseThrow(()-> new RuntimeException("No se encuentra empleado con ID: " + id));
    return empleado;
}
```

Recordemos que el método findById de JpaRepository devuelve un Optional y nunca devuelve nulo. Optional tiene un método orElseThrow que se ejecuta si el elemento dentro del Optional es nulo. Así pues, la sentencia anterior, si no encuentra el empleado, lanza la excepción y, si lo encuentra, lo devuelve. Se puede abrevia (y, además, es aconsejable  y común) poníendolo todo en el return:
```java
public Empleado obtenerPorId(long id){
    return repositorio.findById(id).orElseThrow(()-> new RuntimeException("No se encuentra empleado con ID: " + id));
    
}
```

3. En el controlador, capturamos las excepciones del servicio y procederemos a invocar a ResponseStatusException con el mensaje de la excepción definido en la primera excepción o bien con el mensaje que deseamos:
```java
@GetMapping("/empleado/{id}")
public Empleado getOneElement(@PathVariable Long id){
    try{
        return empleadoService.obtenerPorId(id);
    }catch(EmpleadoNotFoundException ex){
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND, ex.getMessage();
        );
    }
}
```

4. En los métodos `@PostMapping` y `@PutMapping`, si hay errores en los parámetros de entrada, que no se ajustan a los tipos de datos esperados, se producirá una excepción con código de estado 400(BAD REQUEST) sin necesidad de que nosotros programemos nada. Si además el objeto enviado tiene restricciones de validación, deberemos haber prececido al @RequestBody con @Valid para que se produzca la respuesta BAD REQUES. Si no, se produciría el error 500, que es más impreciso.

5. Para que todo esto funcione, debemos configurar tres aspectos más.
    * Desde las últimas versiones, por seguridad, no se envía al usuario el mensaje de error. Esto es así para reducir el riesgo de que al cliente le llegue información no deseada. Para cambiar este comportamiento, en ***application.properties*** añadimos `server.error.include-message=always`.
    * Con la dependencia DevTools añadida, la respuesta enviada al cliente incluye un campo llamado `trace` que incorpora información del servidor que es mejor ocultar a los clientes, por seguridad. Añadimos a application.properties la siguiente línea `server.error.include-stacktrace=never` o quitamos la dependencia DevTools.
    * Internamente, al producirse una excepción de este tipo, accede a una ruta /error aunque realmente no exista esa URL. Entonces, si tenemos configurada la seguridad como vimos anteriormente, debemos permitir el acceso a esa ruta en el Bean SecurityFilterChain `.requestMatchers("/error").permitAll()`.

> **ACTIVIDAD 3:** En MyFavoriteComposer, gestiona la excepción de "Compositor no encontrado" con ResponseStatusException.

### 3.2 RestControllerAdvice

la forma de tratar las excepciones que acabamos de ver no es centralizada, es decir, tenemos que incorporar la gestión de la excepción en cada método en el que pueda ocurrir, llevándonos a duplicar código en algunos casos y a una organización menos controlada cuando tengamos en nuestro código muchos puntos en los que controlar excepciones.

Como vimos anteriormente, una clase anotada con `@ControllerAdvice` es una clase que contendrá todos los métodos para tratar todas las excepciones que se produzcan en cualquier método de servicio y lleguen a los controladores de nuestra aplicación. `@RestControllerAdvice` es una especialización de `@ControllerAdvice` que incluye un `@ResponseBody` y será la que empleemos nosotros.

Cada método de esta clase tendrá que incluir una anotación llamada `@ExceptionHandler` y el nombre de la excepción que gestiona con `.class`:
```java
@ExceptionHandler(EmpleadoNotFoundException.class)
public ResponseEntity<?> handleEmpleadoNotFound(Long id){
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
}
```
> **NOTA:** El ? es un comodín (wildcard) de genéricos en Java. Indica que puede ser cualquier tipo de datos. Es práctica común usarlo en controladores REST.

En lugar de crear la clase desde cero podemos declararla como hija de ResponseEntityExceptionHandler y aprovechar toda su funcionalidad. Entre todos los métodos que tiene esta superclase, es muy útil sobreescribir el método `handleExceptionInternal` que permite personalizar el cuerpo por defecto de cualquier excepción que se pueda producir.

Así, podemos tratar por una parte nuestras excepciones específicas y, por la otra, el resto de las excepciones que se puedan producir. Hay otros métodos útiles que podrían ser candidatos a ser sobreescritos.

Podemos crear esta clase en cualquier parte de la aplicación, aunque quizá el mismo paquete donde hayamos creado las excepciones (presumiblemente `/exceptions`) sea un buen lugar. Los pasos a seguir son los siguientes:

1. Definir las excepciones que queremos que sean consideradas en nuestra aplicación, derivadas de RuntimeException.
```java
public class EmptyEmpleadosException extends RuntimeException{
    public EmptyEmpleadosException(){
        super("No hay empleados en el sistema");
    }
}
```
2. Crear la clase anotada con `@RestControllerAdvice`, hija de `ResponseEntityExceptionHandler`. En el mismo archivo, definimos la clase `ExceptionBody`, con los atributos que queremos que se devuelvan al cliente en la respuesta JSON. El archivo quedaría así:
```java
@RestControllerAdvice
public class GlobalControllerAdvice extends ResponseEntityExceptionHandler {
    @ExceptionHandler(EmpleadoNotFoundException.class)
    public ResponseEntity<?> handleEmpleadoNotFound(
            EmpleadoNotFoundException ex, WebRequest request) {
        ExcepcionBody body = new ExcepcionBody(LocalDateTime.now(), HttpStatus.NOT_FOUND, ex.getMessage(),
                ((ServletWebRequest) request).getRequest().getRequestURI());
        return new ResponseEntity<Object>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EmpleadosEmptyException.class)
    public ResponseEntity<?> handleEmptyEmpleados(
            EmpleadosEmptyException ex, WebRequest request) {
        ExcepcionBody body = new ExcepcionBody(LocalDateTime.now(),
                HttpStatus.NOT_FOUND, ex.getMessage(),
                ((ServletWebRequest) request).getRequest().getRequestURI());
        return new ResponseEntity<Object>(body, HttpStatus.NOT_FOUND);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, @Nullable Object body, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ExcepcionBody myBody = new ExcepcionBody(LocalDateTime.now(),
                status, ex.getMessage(),
                ((ServletWebRequest) request).getRequest().getRequestURI());
        return ResponseEntity.status(status).headers(headers).body(myBody);
    }
}

@AllArgsConstructor
@Getter
class ExcepcionBody {
    private LocalDateTime timestamp;
    private HttpStatusCode status;
    private String message;
    private String path;
}

```
3. Los métodos de los controladores ahora son mucho más sencillos que en el caso de tratarlas de forma individual e incluso más sencillos que de la forma más básica, pues no necesitamos tener en cuenta si se produce un error o no.

Por ejemplo, un método `@GetMapping` podría ser así de sencillo, ya que la respuesta por defecto es con código 200, OK y el resto de situaciones con código de estado se traspasan al gestor de excepciones:

```java
@GetMapping("/empleado")
public List<Empleado> getList(){
    return empleadoService.obtenerTodos();
}
```

En el caso de `@PostMapping` podemos validar los datos enviados con las anotaciones de validación incluidas en la entidad (`@Min`, `@NotEmpty`, etc) de forma que devuelva un error 400, BAD_REQUEST. Esto lo lograremos simplemente añadiendo la anotación @Valid a los datos enviados, es decir, al @RequestBody. Por otra parte, no queremos un código 200 de respuesta, queremos 201:
```java
@PostMapping("/empleado")
public ResponseEntity<?> newElement(@Valid @RequestBody Empleado nuevoEmpleado){
    return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.añadir(nuevoEmpleado));
}
```

En el caso del `@PutMapping`, para modificar un elemento, es similar al de PostMapping, pero antes de modificar el objeto, podemos añadir una llamada al findById de dicho objeto, para verificar que el elemento que vamos a modificar existe. Si no existe, se producirá una excepción 404 NOT_FOUND, dejando la 400 BAD_REQUEST si no se pasan las validaciones.

```java
@PutMapping("/empleado/{id}")
public Empleado editElement(@Valid @RequestBody Empleado editEmpleado, @PathVariable Long id){
    empleadoService.obtenerPorId(id); //Solo sirve para comprobar que existe. Si no existe, se produce excepción y acaba la ejecución del controlador.
    return empleadoService.editar(editEmpleado);
}
```

Podríamos tener más de una clase `@ControllerAdvice` o de su especialización, pero no es frecuente. Lo habitual es que una sola clase agrupe la gestión de todas las excepciones.

Por otro lado, por defecto, las clases antoadas con `@ControllerAdvice` y derivados van a controlar todas las excepciones que lleguen a cualquier método de cualquier controlador de la aplicación, pero se podría restringir para que tratasen solo las de algún controlador, alguna clase, etc:
```java
@ControllerAdvice("my.chosen.package")
```

> **ACTIVIDAD 4:** Controla los errores de MyFavoriteComposer usando `RestControllerAdvice`.