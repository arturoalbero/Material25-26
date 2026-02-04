# Advanced REST API Elements

## 1. File Upload

Receiving files on our server from the client was previously covered, but under the Spring MVC scheme. For REST applications, everything we discussed regarding the reception and storage service (FileStorageService) is still valid, but obviously the controller will be different, as well as the way our clients send files.

To upload files in our controller methods (@PostMapping and @PutMapping), we must indicate that what we receive is multipart data; that is, not only JSON-formatted data injectable with @RequestBody, but different types of data. For this, we will use the @RequestPart annotation.

```java
@PostMapping(value="/nuevoEmpleado", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> newElement(@RequestPart("data") Empleado nuevoEmpleado,
    @RequestPart("file") MultipartFile file){

}
```

In this example, the value parameter is the path that the controller will respond to (what until now we usually specified without value), and the optional consumes parameter indicates the type of data we will receive.

* @RequestPart("data") Empleado nuevoEmpleado: we will receive textual data in an element called "data", which we will map to an instance of a class in our domain, Empleado in this case, and by default in JSON format.
* @RequestPart("file") MultipartFile file: a file that may be an image, a PDF, etc. We can define and change the names "data" and "file", but the client application that sends the data must know them.

To put this into practice, you should look at the code examples in project 905. In that example, you can see the process of adding an image to an Empleado using a REST API.

1. First, add a field of type String to the Empleado entity to store the image name. The related DTOs, if any, should also be modified.
2. Develop a `FileStorageService` service and create the `uploadDir` folder at the root of the project. Check the attached project to see how the service would look and how the folder structure would be organized.
3. Modify the RestController so that, in POST and PUT cases, it can receive two different parameters from the client. On the one hand, the employee data in JSON format, and on the other, the file as explained in the previous section. Check the controllers in the attached project.
4. Additionally, in the RestController we also add a method to send files when they are requested. Check the controller method `serveFile`.

When performing tests from Postman, the request body will not be of type JSON but form-data, and we will include two key-value pairs. On the one hand, the key "data" with a JSON file containing the employee’s textual data, and on the other, the key "file" with the image file. The key names correspond to those defined in the `@RequestPart` parameters of the controller.

> **ACTIVITY 1:** Implement image uploads for each composer and verify that it works in Postman.

## 2. HATEOAS

This acronym stands for Hypermedia As The Engine Of Application State and essentially means that the client should be able to navigate through the web application exclusively via hyperlinks included in the received responses, without the need to create new independent requests.

An example of the HATEOAS standard could be that if a request returns a JSON file with the names of a company’s employees, that response should include not only the employee name but also a link for each one that returns the details of that employee. If, in addition, for each employee the response offers the department they belong to, it should also include a link to that department’s data. In this way, it would be possible to navigate through the entire application by jumping from link to link without having to craft new independent requests.

It can also be configured to help the client know which operations can and cannot be performed, by introducing links in the response to delete the resource, update it, etc.

On the downside, HATEOAS adds complexity to the API, affecting both the API developer and its consumers. Additional work is required to add the appropriate links in each response depending on the state of the entity. This makes the API more complex to build than one that does not implement HATEOAS. API clients also have added complexity in understanding the semantics of each link, as well as having to process the response to extract the links.

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

In the previous example, we can see that each element has a self link that points to the element itself, and other links such as "departamento" that link to relationships between the resource and other classes.

Spring provides us with three classes to incorporate these links into the representations of our resources:

* `RepresentationModel`: base class that allows our domain classes or DTOs to incorporate links.
* `Link`: class whose instances contain both the hyperlink and the relationship of the link to the resource, for example "self".
* `WebMvcLinkBuilder`: allows building instances of Link that include the mappings of our application’s controllers.

### 2.1 HAL

Sometimes the term HATEOAS is confused with HAL (Hypertext Application Language), and in reality, they are complementary. To implement HATEOAS, a language is required to represent the resources that will contain hyperlinks to navigate the application.

HAL is one of these languages; that is, a specific format for representing resources with links, but any other language could be used to implement HATEOAS.

### 2.2 Adding HATEOAS to the Project

For our REST API application responses to include link-based navigation, we must follow these steps:

1. Add the starter-hateoas dependency to the pom.xml:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-hateoas</artifactId>
</dependency>
```

2. The domain model classes or DTOs we want to adapt must extend the RepresentationModel class to be able to use the methods that help us create resource links. We inherit an add() method that we will use to add links to the resource representation without having to add new attributes to the class.

```java
public class Empleado extends RepresentationModel <Empleado> {}
```

3. We create the links we want to add to the representation using the Link class. The following example would create a static link, which is not what we want:

```java
Link link = Link.of("http://localhost:9000/empleado/1");
Empleado empleado.add(link);
```

To create dynamic links (that is, not *hardcoded*), we can use WebMvcLinkBuilder, which simplifies this task. The following example creates the "self" link for an employee:

```java
Empleado empleado = empleadoService.obtenerPorId(id);
Link link = WebMvcLinkBuilder.
    linkTo(EmpleadoController.class).
    slash("empleado").
    slash(empleado.getId()).
    withSelfRel();
empleado.add(link);
```

Thus, for the URL `http://localhost:9000/empleado/2`, we would get something like:

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

We could add another link to navigate to all employees with `Link link2 = WebMvcLinkBuilder.linkTo(EmpleadoController.class).slash("empleado").withRel("all");`, obtaining:

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

These operations are typically performed in the controller that returns the object or DTO.
4. We could create links for the relationships between the resource and other classes, for example, for an employee with their Department.

> **ACTIVITY 2:** Implement HATEOAS for musical pieces. Make them return a link to themselves, a link to their composer, and a link to all pieces. Verify the behavior with Postman or another alternative.

## 3. Spring Data Rest

Although we have seen that it is not difficult to create a REST API service over a given repository, it is true that a certain amount of code must be written to create all the CRUD methods of the service and associate them with the corresponding repository.

Spring Data Rest is a Spring module that allows creating a service transparently for us with the typical CRUD operations of a given JPA repository, with hypermedia support (HATEOAS + HAL) automatically and without writing a single line of code, simply by adding an annotation.

In this case, it is not necessary to include any service or controller in the application; this provides simplicity, but does not allow customization of access, such as adding business logic on the server.

We could configure its behavior in detail, but we will see it in action with its default parameters. For it to work, we will simply add the starter-data-rest dependency to our project and, optionally, HAL Explorer.

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

Just by doing this, our responses already comply with the HATEOAS standard. If we test it on one of the previous examples, the Empleado CRUD with a @ManyToOne association with Departamento, new routes will be generated, formed by the "English-style plurals" of the entities (*empleadoes*, *departamentoes*) with the HATEOAS format. Let’s look again at this example:

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

We can see that we have a link to itself and also a link to its department. The annotations @RepositoryRestResource for repositories and @RestResource for entities are optional and allow modifying this default behavior, for example, to exclude certain repositories so that they do not behave this way and continue to be shown as before.

Another parameter we can modify is the plural route that will be generated, so that it is done correctly, without the English-style plural.

```java
@RepositoryRestResource(path = "empleados", collectionResourceRel = "empleados")
public interface EmpleadoRepository extends JpaRepository<Empleado, Long>{}
```

Finally, note that if we add the HAL Explorer dependency, an API explorer for the project is also generated to perform operations on it. It can be accessed at `http:localhost:[port]/`.

> **ACTIVITY 3:** Add the starter-data-rest and HAL Explorer dependencies to the MyFavouriteComposer project and perform the following tasks:
>
> * Fix or customize the routes
> * Access HAL Explorer and verify its behavior

## 4. OpenAPI and Swagger

As we have discussed, a REST API application or service offers a series of resources to be consumed via HTTP by different clients; these can be end-user client applications or other server applications. In any case, it will be other programmers, not end users, who will make use of our API. For this reason, good documentation is essential.

OpenAPI is a specification, that is, a set of rules to document all the relevant aspects of our API, and it is the de facto standard currently used. Swagger is a tool that allows building and consulting that documentation in a simple way.

OpenAPI works from a file, by default JSON, with all the API documentation. Swagger, on the other hand, works through its SwaggerUI tool and allows access in a graphical environment so that we can not only consult the documentation, but also test its functionality. At [https://petstore.swagger.io/](https://petstore.swagger.io/) we can see a working example.

The most tedious part of Swagger is building the JSON file with all the API information. Of course, Spring incorporates a tool to save us this work: SpringDoc.

### 4.1 Adding OpenAPI to the Project

1. Add the SpringDoc dependency: springdoc-openapi-starter-webmvc-ui (from version 3 onwards; for earlier versions it is different).

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

2. Just by adding the previous dependency, at the `/v3/api-docs` path we will have access to our API documentation in JSON format. We can change this default path to whatever we want in the application.properties file: `springdoc.api-docs.path=/api-docs`.
3. The dependency includes Swagger, so at the path [http://localhost/swagger-ui/index.html](http://localhost/swagger-ui/index.html) we will be able to view and interact with it.

We can also change in application.properties the so-called Swagger-ui properties, such as the route of the documentation in Swagger format, or whether we include Actuator endpoints in the Swagger documentation.

```text
springdoc.swagger-ui.disable-swagger-default-url=true
springdoc.swagger-ui.path=/mydoc
springdoc.swagger-ui.tryItOutEnabled=true
springdoc.show-actuator=true
```

If we access the generated documentation, we will see that it contains many default values, such as the title, description, etc.

4. We can create a configuration class that includes generic information about our API: title, description, version, contact, etc.

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
                .title("API Documentation Example")
                .version("1.0")
                .contact(contact)
                .description("This API is an example of Swagger usage")
                .termsOfService("https://www.mycompany.com/terms")
                .license(mitLicense);
        return new OpenAPI().info(info).servers(List.of(prodServer));
    }
}
```

5. In addition to this general API documentation, we have annotations that allow further refinement of the documentation. At the controller level: `@Tag(name = "Class Name", description = "Class description")`. We place it before the `@RestController` annotations.

At the controller method level, we have:

* `@Operation` describes what the controller method does
* `@ApiResponses` describes the different responses that the method can return. Each response is annotated with `@ApiResponse`.
* `@Parameter` describes each parameter that the method receives

```java

@Tag(name = "Empleado Class", description = "Organization employees")
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

    @Operation(summary = "operation summary (of the mapping)", description = "Operation description (of the mapping).", tags = {
            "qualifying tags", "get" })
    @ApiResponses({
            @ApiResponse(responseCode = "200", content = {
                    @Content(schema = @Schema(implementation = Empleado.class), mediaType = "application/json") }),
            @ApiResponse(responseCode = "404", content = { @Content(schema = @Schema()) }) })
    @GetMapping("/{id}")
    public ResponseEntity<?> getOneElement(
            @Parameter(name = "id", description = "unique employee identifier", example = "1", required = true) @PathVariable Long id) {
        Empleado empleado = empleadoService.obtenerPorId(id);
        if (empleado != null)
            return ResponseEntity.ok(empleado);
        else
            return ResponseEntity.notFound().build();
    }

}
```

See [https://github.com/swagger-api/swagger-core/wiki/Swagger-2.X---OpenAPI-3.1](https://github.com/swagger-api/swagger-core/wiki/Swagger-2.X---OpenAPI-3.1) to view all annotations.

> **ACTIVITY 4:** Implement OpenAPI and Swagger in MyFavouriteComposer. Modify the default documentation path.
