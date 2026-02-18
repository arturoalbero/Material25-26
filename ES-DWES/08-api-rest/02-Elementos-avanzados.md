# Elementos Avanzados de API REST

## 1. Envío de ficheros

La recepción de archivos en nuestro servidor procedentes del cliente ya fue tratada anteriormente, pero bajo el esquema Spring MVC. Para las aplicaciones REST es válido todo lo que comentamos en cuanto al servicio de recepción y almacenamiento de los servicios (FileStorageService), pero, obviamente, el controlador será distinto y también la forma en la que nuestros clientes enviarán archivos.

Para subir archivos en nuestros métodos del controlador (@PostMapping y @PutMapping) tendremos que indicarle que lo que recibimos son datos multiparte, es decir, no son solo datos en formato JSON inyectables con @RequestBody, sino que tendremos distintos tipos de datos. Para ello, emplearemos la anotación @RequestPart.
```java
@PostMapping(value="/nuevoEmpleado", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> newElement(@RequestPart("data") Empleado nuevoEmpleado,
    @RequestPart("file") MultipartFile file){

}
```
En este ejemplo, el parámetro value es la ruta a la que responderá el controlador(lo que hasta ahora poníamos habitualmente sin value) y el parámetro consumes, opcional, indica el tipo de dato que recibiremos.

* @RequestPart("data") Empleado nuevoEmpleado: recibiremos datos textuales en un elemento llamado "data" y que mapearemos en una instancia de una clase de nuestro dominio, Empleado en este caso, y por defecto en formato JSON.
* @RequestPart("file") MultipartFile file: archivo que puede ser una imagen, un PDF, etc. Podemos definir y cambiar los nombres "data" y "file", pero la aplicación cliente que envíe los datos deberá conocerlos.

Para ponerlo en la práctica, debes fijarte en los ejemplos de código del proyecto 905. En ese ejemplo, se ve el proceso de añadir una imagen a un Empleado usando API REST.
1. Lo primero es añadir un campo a la entidad Empleado de tipo String, que almacene el nombre de la imagen. También habría que modificar los DTO relacionados, si existiesen.
2. Desarrollar un servicio `FileStorageService` y crear en la raíz del proyecto la carpeta `uploadDir`. Observa el proyecto adjunto para comprobar cómo sería el servicio y cómo quedaría la estructura de carpetas.
3. Modificar el RestController para que, en los casos de POST y PUT, sea capaz de recibir dos parámetros distintos desde el cliente. Por una parte, los datos del empleado en formato JSON y, por la otra, el fichero tal y como acabamos de explicar en el apartado anterior. Observa los controladores del proyecto adjunto.
4. Por otro lado, en el RestController también añadimos un método para enviar los ficheros cuando sean solicitados. Observa el método del controlador `serveFile`.

Cuando realices las pruebas desde Postman, el cuerpo de la petición no será de tipo JSON sino form-data e incluiremos dos pares clave-valor. Por una parte, la clave "data" con un archivo JSON con los datos textuales del empleado y, por la otra, la clave "file" con el archivo de imagen. Los nombres de las claves se corresponden con los definidos en los parámetros `@RequestPart` del controlador.

> **ACTIVIDAD 1:** Implementa la subida de imágenes para cada compositor y comprueba que funciona en PostMan.

## 2. HATEOAS

Este acrónimo se corresponde con Hypermedia As The Engine Of Application State y viene a decir que el cliente debe poder moverse por la aplicación web únicamente a través de hipervínculos incluidos en las respuestas recibidas, sin necesidad de crear peticiones nuevas independientes.

Un ejemplo del estándar HATEOAS podría ser que, si en una petición me devuelve un archivo JSON con los nombres de los empleados de una empresa, esta respuesta debería incluir no solo el nombre del empleado, sino también un enlace para cada uno de ellos, que nos devolviese el detalle de cada empleado. Si además, para cada empleado, la respuesta ofrece el departamento al que pertenece, también debería incluir un enlace a los datos de ese departamento. De esta forma, se podría navegar por toda la aplicación saltando de enlace en enlace sin tener que elaborar nuevas peticiones idependientes.

También se puede configurar para facilitar el cliente el saber qué operaciones puede hacer y cuáles no puede hacer, introduciendo en la respuesta enlaces para eliminar el recurso, actualizarlo, etc.

En la parte negativa está que HATEOAS añade complejidad a la API, que afecta tanto al desarrollador de la API como al consumidor de la misma. Hay que realizar un trabajo adicional para añadir los enlaces apropiados en cada respuesta según el estado de la entidad. Esto provoca que la API sea más compleja de construir que una que no implementa HATEOAS. Los clientes de la API también tienen complejidad añadida para entender la semántica de cada enlace  además de tener yprocesar la respuesta para obtener los enlaces.
```json
{
    "_embedded" : {
        "empleadoes" : [{
            "nombre" : "pepe",
            "email" : "pepe@gmail.com",
            "salario" : 800.0,
            "enActivo" : true,
            "genero" : "MASCULINO",
            "_links" : {
                "self" : {
                    "href" : "http://localhost:9000/empleadoes/1"
                },
                "departamento" : {
                    "href" : "http://localhost:9000/empleadoes/1/departamento"
                }
            }
        }, {
            "nombre" : "ana",
//(...)
```
En el ejemplo anterior se ve que cada elemento tiene un link self que enlaza al propio elemento y otros links como "departamento" que enlazan con relaciones del recurso con otras clases.

Spring nos ofrece tres clases para incorporar estos enlaces a las representaciones de nuestros recursos:
* `RepresentationModel`: clase base para que nuestras clases de dominio o nuestros DTO incorporen enlaces.
* `Link`: clase cuyas instancias contienen tanto el hipervínculo como la relación del enlace con el recurso, por ejemplo "self".
* `WebMvcLinkBuilder`: permite construir instancias de Link que incluyan los mappings de los controladores de nuestra aplicación.

### 2.1 HAL

A veces se confunde el término HATEOAS con HAL (Hypertext Application Language) y, en realidad, son complementarios. Para implementar HATEOAS es necesario un lenguaje que represente los recursos que contendrán hipervínculos para navegar por la aplicación.

HAL es uno de esos lenguajes, es decir, un formato específico para la representación de recursos con enlaces, pero podría emplearse cualquier otro lenguaje para implementar HATEOAS.

### 2.2 Añadir HATEOAS al proyecto

Para que las respuestas de nuestra aplicación API REST incluyan la navegación por enlaces de la que estamos hablando debemos seguir los siguientes pasos:

1. incorporar al pom.xml la dependencia starter-hateoas:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```
2. Las clases de modelo de dominio o los DTO que pretendemos adaptar deberán ser hijas de la clase RepresentationModel para poder usar los métodos que nos ayudarán a crear los enlaces del recurso. Heredamos un método add() con el que añadiremos los enlaces a la representación del recurso sin tener que añadir nuevos atributos a la clase.
```java
public class Empleado extends RepresentationModel <Empleado> {}
```
3. Creamos los links que deseamos añadir a la representación con la clase Link. El siguiente ejemplo crearía un enlace estático, que no es lo que buscamos:
```java
Link link = Link.of("http://localhost:9000/empleado/1");
Empleado empleado.add(link);
```

Para crear enlaces dinámicos (es decir, no *hardcodearlos*) podemos usar WebMvcLinkBuilder que simplifica esta tarea. El siguiente ejemplo crea el enlace "self" de un empleado:
```java
Empleado empleado = empleadoService.obtenerPorId(id);
Link link = WebMvcLinkBuilder.
    linkTo(EmpleadoController.class).
    slash("empleado").
    slash(empleado.getId()).
    withSelfRel();
empleado.add(link);
```

Así, ante la URL `http://localhost:9000/empleado/2`, obtendríamos algo como:
```json
{
    "id" : 2,
    "nombre" : "Ana García",
    "email" : "ana_garcia@gmail.com",
    "salario" : 39000.0,
    "_links":{
        "self":{
            "href":"http://localhost:9000/empleado/2"
        }
    }
}
```
Podríamos añadir otro enlace para navegar a todos los empleados con `Link link2 = WebMvcLinkBuilder.linkTo(EmpleadoController.class).slash("empleado").withRel("all");` obteniendo:
```json
{
    "id" : 2,
    "nombre" : "Ana García",
    "email" : "ana_garcia@gmail.com",
    "salario" : 39000.0,
    "_links":{
        "self":{
            "href":"http://localhost:9000/empleado/2"
        },
        "all":{
            "href":"http://localhost:9000/empleados"
        }
    }
}
```
Estas operaciones se harán típicamente en el controlador que devuelve el objeto o el DTO.
4. Podríamos crear enlaces para las relaciones del recurso con  otras clases, por ejemplo, para un empleado con su Departamento.

> **ACTIVIDAD 2:** Implementa HATEOAS para las piezas musicales. Haz que devuelvan un enlace a sí mismas, un enlace a su compositor y un enlace a todas las piezas. Comprueba el funcionamiento con POSTMAN u otra alternativa. 


## 3. Spring Data Rest

Aunque hemos visto que no es complicado crear un servicio API REST sobre un determinado repositorio, sí que es cierto que hay que escribir cierta cantidad de código para crear todos los métodos CRUD del servicio y asociarlos al repositorio correspondiente.

Spring Data Rest es un módulo de Spring que permite crear un servicio de forma transparente para nosotros con las operaciones típicas CRUD de un repositorio JPA dado, con soporte hipermedia (HATEOAS + HAL) de forma automática y sin escribir una línea de código, tan solo incorporando una anotación.

En este caso no es necesario incluir ningún servicio ni controlador en la aplicación; esto aporta sencillez, pero no permite personalizar el acceso como, por ejemplo, añadir lógica de negocio en el servidor.

Podríamos configurar su comportamiento en detalle, pero vamos a verlo en funcionamiento con sus parámetros por defecto. Para que funcione, solo añadiremos a nuestro proyecto la dependencia starter-data-rest y, de forma opcional, HAL Explorer.
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-rest</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-rest-hal-explorer</artifactId>
</dependency>
```


Solo con hacer esto nuestras respuestas ya cumplen el estándar HATEOAS. Si lo probamos sobre uno de los ejemplos anteriores, el CRUD de Empleado con asociación @ManyToOne con Departamento, se generarán nuevas rutas, formadas por los "plurales a la inglesa" de las entidades (*empleadoes*, *departamentoes*) con el formato HATEOAS. Volvamos a observar este ejemplo:
```json
{
    "_embedded" : {
        "empleadoes" : [{
            "nombre" : "pepe",
            "email" : "pepe@gmail.com",
            "salario" : 800.0,
            "enActivo" : true,
            "genero" : "MASCULINO",
            "_links" : {
                "self" : {
                    "href" : "http://localhost:9000/empleadoes/1"
                },
                "departamento" : {
                    "href" : "http://localhost:9000/empleadoes/1/departamento"
                }
            }
        }, {
            "nombre" : "ana",
//(...)
```
Podemos ver como disponemos de un enlace a él mismo y también un enlace a su departamento. Las anotaciones @RepositoryRestResource para Repositorios y @RestResource para Entidades son opcionales y permiten modificar este comportamiento por defecto, por ejemplo, para excluir ciertos repositorios y que no se comporten de esta forma y se sigan mostrando como antes.

Un parámetro que también podemos modificar es la ruta en plural que va a generar, para que lo haga correctamente, sin el plural a la inglesa.

```java
@RepositoryRestResource(path = "empleados", collectionResourceRel = "empleados")
public interface EmpleadoRepository extends JpaRepository<Empleado, Long>{}
```
Por último, comentar que si añadimos la dependencia HAL Explorer también se genera un explorador de la API del proyecto para realizar operaciones sobre la misma. Se accede a ella con `http:localhost:[puerto]/`.

> **ACTIVIDAD 3:** Añade las dependencias starter-data-rest y hal explorer al proyecto MyFavouriteComposer y realiza las siguientes tareas:
> - Corrige o personaliza las direcciones
> - Accede a HAL Explorer y comprueba su funcionamiento

## 4. OpenAPI y Swagger

Como hemos comentado, una aplicación o servicio API REST ofrece una serie de recursos para ser consumidos mediante HTTP por diferentes clientes, estos pueden ser aplicaciones cliente finales o bien otras aplicaciones de servidor. En cualquiera de los casos, serán otros programadores, no usuarios finales, los que harán uso de nuestra API. Por este motivo, una buena documentación es fundamental.

Open API es una especificación, esto es, una serie de reglas para documentar todos los aspectos relevantes de nuestra API y es el estándar de facto utilizado actualmente. Swagger es una herramienta que permite construir y consultar esa documentación de una forma sencilla.

Open API trabaja a partir de un archivo, por defecto JSON, con toda la documentación del API. Swagger, por su lado, trabaja mediante su herramienta SwaggerUI y permite un acceso en entorno gráfico de forma que no solo podremos consultar la documentación, sino que podremos probar su funcionalidad. En https://petstore.swagger.io/ podemos ver un ejemplo en funcionamiento.

La parte más tediosa de Swagger es construir el archivo JSON con toda la información de la API. Por supuesto, Spring incorpora una herramienta para ahorrarnos el trabajo: SpringDoc.

### 4.1 Incorporar Open API al proyecto

1. Añadir la dependencia SpringDoc: springdoc-openapi-starter-webmvc-ui (a partir de la versión 3, para versiones anteriores es diferente).
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```
2. Solo por añadir la dependencia anterior, en la ruta `/v3/api-docs` tendremos acceso ala documentación de nuestra api en formato JSON. Podemos cambiar esta ruta por defecto a la que deseemos en el archivo application.properties: `springdoc.api-docs.path=/api-docs`.
3. La dependencia incluye Swagger, por lo que en la ruta http://localhost/swagger-ui/index.html podremos visualizarla e interactuar con ella.

También podremos cambiar en el application.properties las conocidas como Swagger-ui properties como la ruta de la documentación en formato Swagger, o si incluimos los endpoints de Actuator en la documentación swagger.
```text
springdoc.swagger-ui.disable-swagger-default-url=true
springdoc.swagger-ui.path=/mydoc
springdoc.swagger-ui.tryItOutEnabled=true
springdoc.show-actuator=true
```
Si accedemos a la documentación generada, comprobaremos que tendrá muchos valores por defecto, como el título, descripción, etc.

4. Podemos crear una clase de configuración que incluya información genérica de nuestra API: título, descripción, versión, contacto, etc.

```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI myOpenAPI() {
        Server prodServer = new Server();
        prodServer.setUrl("http://localhost:9000");
        prodServer.setDescription("Server URL in Production environment");
        Contact contact = new Contact();
        contact.setEmail("rdf@mycompany.com");
        contact.setName("Fernando Rodríguez");
        contact.setUrl("https://www.mycompany.com");
        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title("Ejemplo de documentación API")
                .version("1.0")
                .contact(contact)
                .description("Esta API es un ejemplo del uso de Swagger")
                .termsOfService("https://www.mycompany.com/terms")
                .license(mitLicense);
        return new OpenAPI().info(info).servers(List.of(prodServer));
    }
}
```

5. Además de esta documentación general de la API, disponemos de anotaciones que permiten afinar más la documentación. A nivel de controlador `@Tag(name = "Nombre de la clase", description = "Descripción de la clase")` Lo ponemos antes de las anotaciones de `@RestController`.

A nivel de método de controlador, disponemos de:
- `@Operation` describe qué hace el método del controlador
- `@ApiResponses` describe las distintas respuestas que puede dar el método. Cada respuesta se anota con `@ApiResponse`.
- `@Parameter` describe cada parámetro que recibe el método

```java

@Tag(name = "Clase Empleado", description = "Empleados de la organización")
@RestController
@RequestMapping("/empleado")
public class EmpleadoController {

    @Autowired
    public EmpleadoService empleadoService;

    @GetMapping("/")
    public ResponseEntity<?> getList() {
        List<Empleado> listaEmpleados = empleadoService.obtenerTodos();
        if (listaEmpleados.isEmpty())
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(listaEmpleados);

    }

    @Operation(summary = "resumen de la operación (del mapping)", description = "Descripción de la operación (del mapping).", tags = {
            "etiquetas calificadoras", "get" })
    @ApiResponses({
            @ApiResponse(responseCode = "200", content = {
                    @Content(schema = @Schema(implementation = Empleado.class), mediaType = "application/json") }),
            @ApiResponse(responseCode = "404", content = { @Content(schema = @Schema()) }) })
    @GetMapping("/{id}")
    public ResponseEntity<?> getOneElement(
            @Parameter(name = "id", description = "identific. único del empleado", example = "1", required = true) @PathVariable Long id) {
        Empleado empleado = empleadoService.obtenerPorId(id);
        if (empleado != null)
            return ResponseEntity.ok(empleado);
        else
            return ResponseEntity.notFound().build();
    }

}
```

Consulta https://github.com/swagger-api/swagger-core/wiki/Swagger-2.X---OpenAPI-3.1 para ver todas las anotaciones.

> **ACTIVIDAD 4:** Implementa OpenApi y Swagger en MyFavouriteComposer. Modifica la ruta por defecto de la documentación.