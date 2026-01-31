# Introduction to REST API

## 1. Introduction to REST API

Up to now, the applications we have developed include all the necessary layers in a single project, with the exception of the browser and the database. This architecture has made deployment easier and allowed us to learn the technology more easily.

Although this approach is the most recommended for small projects, it has the drawback that it does not respond to heterogeneous clients, but only to the one for which it was designed (the web browser). To solve this situation, the presentation layer is decoupled. The most widely used approaches nowadays are [**GraphQL**](https://www.youtube.com/watch?v=eIQh02xuVw4) and [**REST (Representational State Transfer)**](https://www.youtube.com/watch?v=-MTSQjw5DrM), which is the one we are going to work with.

REST is an approach proposed by Roy Fielding in his doctoral thesis, and these are its foundations:

* Communication between client and server is done through the HTTP protocol and its verbs (GET, PUT, POST, DELETE, etc.).
* It is a stateless communication. Each request–response is complete and does not need to be synchronized with other requests.
* The resources accessed by different types of clients are mapped through a URL and are called **endpoints**.
* Data is sent to the client, usually in JSON format. The client processes it as desired. The client can also send data to the server in the request, in the same format.
* It is not exclusive to Java.
* The client does not have to be a single end user; it can be another application. In fact, an application can connect to multiple REST APIs.
* They are the basis for microservices-based application architecture.

The most common HTTP verbs, which can be identified with CRUD, are:

* **POST**: Sends data in the request body to create **new** resources. (CREATE)
* **GET**: Requests a resource from the server. (READ)
* **PUT**: Sends data in the request body to edit an existing resource. (UPDATE)
* **DELETE**: Deletes a resource from the server.

> **IMPORTANT** Each HTTP verb has its Mapping annotation in Spring. That is, in addition to `@GetMapping` and `@PostMapping`, we have `@PutMapping`, `@DeleteMapping`, etc.

## 2. REST API in Spring

Spring, through its starter-web dependency, makes it easy to “RESTify” our applications. These are its characteristics:

* The change with respect to previous applications only affects the controller layer and the views.
* The `@Controller` annotation is replaced by `@RestController`, which includes a controller and a responseBody. In this way, its methods return an HTTP response body by default and not a String as before.
* Views do not make sense. Client applications are the ones that will provide them. In REST API architecture, the backend only takes care of the data.
* Spring performs the conversion from Java class to response body, so our controller method can return a class from our model or a DTO, which will be transparently converted for us into an object for the requester, usually in JSON format.

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

We have different classes to work with HTTP requests and responses:

* `HttpMessageConverter`: responsible for converting JSON classes and vice versa using Jackson libraries.
* `HttpEntity<T>` and its two subclasses `RequestEntity<T>` and `ResponseEntity<T>`: represent a complete HTTP request or response with its headers and body.

> **IMPORTANT**: In the previous example we are returning an employee in the response body, but we are not managing other parameters such as the HttpStatus response code; Spring does this, but with default values. If we use these classes, we have more detailed control.

* `HttpHeaders`: represents the headers of a request or a response.
* `RestClient`: used if we want our API or MVC application to also be a client and make requests to other remote REST APIs.
* Spring Data Rest: allows transforming a Spring Data repository into a REST API easily with hardly any additional code.
* Spring HATEOAS (Hypermedia as Engine of Application State): allows including links in the results returned in a REST response so that the client can navigate from one resource to another.

> **ACTIVITY 1:** In the MyFavouriteComposer project, create a RestController for `/composer/{id}` corresponding to the READ operation. Check in the browser how it returns the composer’s data. ***The PUT, POST, and DELETE verbs cannot be effectively tested in the browser.***

### 2.1 ResponseEntity<T>

It is a class that allows us to handle the response we give to our clients in a more convenient way. It is a leaf class of `HttpEntity<T>` that adds one more attribute for the response status code.

In the previous section we saw how, in a RestController method, we could return a class from our model and Spring would take care of converting it into the body of an HTTP response. What we did not say is that the header of that response was built by default and we had no way to customize it. If what we return is a ResponseEntity, we can configure all the parameters of that header.

The process consists of making the RestController methods return a ResponseEntity object instead of a model class. The class provides several static methods that allow us to easily build the response. The main method would be:

```java
ResponseEntity.status(n).body(resource);
```

where n is a status code and resource is the resource we want to send. For the codes we have the HttpStatus enumeration with values such as OK, CREATED, NO_CONTENT, NOT_FOUND, FORBIDDEN, BAD_REQUEST, etc. If the response body is empty (common in deletes), we replace `body(resource)` with `build()`.

```java
ResponseEntity.status(HttpStatus.CREATED).body(empleado);
ResponseEntity.status(HttpStatus.NO_CONTENT).build();
```

The response codes for each operation are:

* **GET** -> 200 (OK), 404 (NOT FOUND) if the resource is not found.
* **POST** -> 201 (CREATED), 400 (BAD REQUEST) if the received data is incorrect.
* **PUT** -> 200 (OK), 404 (NOT FOUND) if the resource is not found, and 400 (BAD REQUEST) if the received data is incorrect.
* **DELETE** -> 204 (NO CONTENT), 404 (NOT FOUND) if the resource to delete is not found.

***ResponseEntity*** provides additional methods that group the response code and status, but they are not strictly necessary; they simply allow us to write the response in an abbreviated way: `ResponseEntity.ok(objectToSend)`, `ResponseEntity.notFound().build()`, `ResponseEntity.noContent().build()`, etc.

If we want to perform an insertion directly in the repository, without an intermediate service or error handling, we can do it like this:

```java
@PostMapping("/")
public ResponseEntity<Empleado> nuevoEmpleado(@RequestBody Empleado nuevo){
    Empleado guardado = empleadoRepositorio.save(nuevo);
    return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
}
```

The `@RequestBody` annotation is essential in requests that carry associated data, since it allows injecting into the method the received data, probably in JSON, which will be treated in the method like any other Java class. Typical CRUD cases are creation and modification of resources, but not queries and deletions, where we do not receive additional data.

When the element we add to the body is an entity from our domain model, it is automatically transformed into JSON format. When what we send is a simple value, it is common to define a DTO with the structure of that response, either as a class or as a record:

```java
public record EmpleadoDto(String nombre, Integer edad){}
```

And return to the client an instance of the DTO:

```java
return ResponseEntity.ok(new EmpleadoDto("José López", 20));
```

> **IMPORTANT:** DTOs are especially valuable precisely in REST API handling, to avoid sending excessive or sensitive information. That is why **it is good practice for the controller and the client to communicate using DTOs** and not domain model entities.

We could also dispense with the DTO and build a map, using the name of each attribute as the key and its content as the value:

```java
String nombre = "José López";
Integer edad = 20;
Map<String, String> mapa = new LinkedHashMap<>();
mapa.put("nombre", nombre);
mapa.put("edad", edad.toString());
return ResponseEntity.ok(mapa);
```

### 2.2 Bidirectional relationships

When we have bidirectional relationships between entities (`@OneToMany` and `@ManyToOne`), infinite loops can occur when retrieving data from a request: an employee would have an associated category, and that category its employees, and so on.

To avoid this recursion problem we have several options. One of them is to generate DTO classes that do not contain the relationship and adapt controllers and services to work with these DTOs where necessary.

Another simpler option is to include the `@JsonIgnore` annotation in the “1” class of the “1 to N” relationship, for the attribute with the list of “n” elements. Thus, when generating the response in JSON format to send to the client, the relationship will not be sent and recursion will stop. For example:

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

> **ACTIVITY 2**: In MyFavoriteComposer, implement the CRUD operations following the REST API architecture for composers and musical pieces:
>
> * `/composer/create/{id}` with the POST verb
> * `/composer/read/{id}` with the GET verb
> * `/composer/update/{id}` with the PUT verb
> * `/composer/delete/{id}` with the DELETE verb
> * The same for `/piece`.
>   Use Postman for testing. Check the [official documentation](https://learning.postman.com/docs/getting-started/overview) and/or watch this [tutorial](https://www.youtube.com/watch?v=ypKHnRmPOUk). If you prefer, you can use other methods of testing such as [**insomnia.rest**](https://insomnia.rest/). It's up to you.

## 3. Error Handling

In all the previous examples we have performed very simple error handling without exception-based treatment. We simply built an empty response in which we assigned a response code to indicate the error, but we did not send the client any additional message about the error that occurred.

In this section we will learn how to handle errors using exceptions and by sending the user a response that, in addition to the error code, informs them with a text describing the error that occurred. Since Spring version 3.2, we have a new annotation called `@RestControllerAdvice` that allows us to centrally manage, in a single class, all the exceptions of an entire REST application.

On the other hand, since Spring 5, we also have a class called ResponseStatusException, which offers a basic but quick solution for error handling, but in an individualized way, with one call for each exception.

> **NOTE:** This whole section is analogous to what was covered in point 4.2 on error handling, but this time with REST controllers.

### 3.1 ResponseStatusException

It is a class derived from RuntimeException and has three constructors through which we can assign the status to return (HttpStatus), optionally the error message (String), and optionally the cause. When invoking the constructors, we send the client the exception that occurred, with the data just described.

A simple example of use would be the following: suppose a controller method receives an employee “id” and obtains the corresponding employee instance from the repository through a service. If the service returns null when it does not find the requested employee, we could throw an exception with ResponseStatusException:

```java
@GetMapping("/empleado/{id}")
public Empleado findById(@PathVariable Long id){
    Empleado empleado = empleadoService.obtenerPorId(id);
    if(empleado == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
    return empleado;
}
```

However, this would not be the most correct way to work, since the service method in case of error should not return null, but should throw exceptions. It could either throw RuntimeException or its own custom exceptions. The process to follow would be:

1. Define exceptions that extend RuntimeException and have a constructor that may or may not receive parameters. The body of the constructor will only call the RuntimeException constructor with the message associated with this exception.

```java
public class EmpleadoNotFoundException extends RuntimeException {
    public EmpleadoNotFoundException(Long id){
        super("Cannot find employee with ID: " + id);
    }
}
public class EmptyEmpleadosException extends RuntimeException{
    public EmptyEmpleadosException(){
        super("There are no employees in the system");
    }
}
```

2. In the service, when calling repository methods, we can invoke the exceptions in case of error:

```java
public Empleado obtenerPorId(long id){
    Empleado empleado = repositorio.findById(id).orElseThrow(() -> new EmpleadoNotFoundException(id));
    return empleado;
}
```

The other option would be to directly throw RuntimeException, without creating any exception class:

```java
public Empleado obtenerPorId(long id){
    Empleado empleado = repositorio.findById(id).orElseThrow(() -> new RuntimeException("Employee with ID not found: " + id));
    return empleado;
}
```

Recall that the findById method of JpaRepository returns an Optional and never returns null. Optional has a method `orElseThrow` that is executed if the element inside the Optional is null. Thus, the previous statement, if it does not find the employee, throws the exception, and if it finds it, returns it. It can be abbreviated (and it is also advisable and common) by putting everything directly in the return:

```java
public Empleado obtenerPorId(long id){
    return repositorio.findById(id).orElseThrow(() -> new RuntimeException("Employee with ID not found: " + id));
}
```

3. In the controller, we catch the service exceptions and proceed to invoke ResponseStatusException with the message of the exception defined in the first exception or with the message we desire:

```java
@GetMapping("/empleado/{id}")
public Empleado getOneElement(@PathVariable Long id){
    try{
        return empleadoService.obtenerPorId(id);
    }catch(EmpleadoNotFoundException ex){
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND, ex.getMessage()
        );
    }
}
```

4. In `@PostMapping` and `@PutMapping` methods, if there are errors in the input parameters that do not match the expected data types, an exception with status code 400 (BAD REQUEST) will be produced without us having to program anything. If, in addition, the sent object has validation constraints, we must precede the `@RequestBody` with `@Valid` so that the BAD REQUEST response is produced. Otherwise, error 500 would occur, which is less precise.

5. For all this to work, we must configure three more aspects.

   * In recent versions, for security reasons, the error message is not sent to the user. This is done to reduce the risk of unwanted information reaching the client. To change this behavior, in ***application.properties*** we add `server.error.include-message=always`.
   * With the DevTools dependency added, the response sent to the client includes a field called `trace` that incorporates server information that is better hidden from clients, for security reasons. We add the following line to application.properties: `server.error.include-stacktrace=never`, or remove the DevTools dependency.
   * Internally, when such an exception occurs, it accesses a `/error` path even though that URL does not really exist. Therefore, if we have security configured as seen previously, we must allow access to that path in the SecurityFilterChain bean: `.requestMatchers("/error").permitAll()`.

> **ACTIVITY 3:** In MyFavoriteComposer, handle the “Composer not found” exception with ResponseStatusException.

### 3.2 RestControllerAdvice

The way of handling exceptions that we have just seen is not centralized; that is, we have to incorporate exception handling in each method where it may occur, leading to code duplication in some cases and less controlled organization when we have many points in our code where exceptions must be handled.

As we saw earlier, a class annotated with `@ControllerAdvice` is a class that will contain all the methods to handle all the exceptions that occur in any service method and reach the controllers of our application. `@RestControllerAdvice` is a specialization of `@ControllerAdvice` that includes a `@ResponseBody` and is the one we will use.

Each method of this class must include an annotation called `@ExceptionHandler` and the name of the exception it handles with `.class`:

```java
@ExceptionHandler(EmpleadoNotFoundException.class)
public ResponseEntity<?> handleEmpleadoNotFound(Long id){
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
}
```

> **NOTE:** The `?` is a wildcard of Java generics. It indicates that it can be any type of data. It is common practice to use it in REST controllers.

Instead of creating the class from scratch, we can declare it as a subclass of ResponseEntityExceptionHandler and take advantage of all its functionality. Among all the methods this superclass has, it is very useful to override the `handleExceptionInternal` method, which allows us to customize the default body of any exception that may occur.

Thus, we can handle our specific exceptions on the one hand, and on the other, the rest of the exceptions that may occur. There are other useful methods that could be candidates to be overridden.

We can create this class anywhere in the application, although perhaps the same package where we created the exceptions (presumably `/exceptions`) would be a good place. The steps to follow are as follows:

1. Define the exceptions that we want to be considered in our application, derived from RuntimeException.

```java
public class EmptyEmpleadosException extends RuntimeException{
    public EmptyEmpleadosException(){
        super("There are no employees in the system");
    }
}
```

2. Create the class annotated with `@RestControllerAdvice`, extending `ResponseEntityExceptionHandler`. In the same file, define the `ExceptionBody` class, with the attributes we want to return to the client in the JSON response. The file would look like this:

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

3. Controller methods are now much simpler than in the case of handling exceptions individually, and even simpler than in the most basic approach, since we do not need to take into account whether an error occurs or not.

For example, a `@GetMapping` method could be as simple as this, since the default response is status code 200, OK, and the rest of the situations with status codes are passed to the exception handler:

```java
@GetMapping("/empleado")
public List<Empleado> getList(){
    return empleadoService.obtenerTodos();
}
```

In the case of `@PostMapping`, we can validate the sent data with the validation annotations included in the entity (`@Min`, `@NotEmpty`, etc.) so that it returns a 400 BAD_REQUEST error. We achieve this simply by adding the `@Valid` annotation to the sent data, that is, to the `@RequestBody`. On the other hand, we do not want a 200 response code; we want 201:

```java
@PostMapping("/empleado")
public ResponseEntity<?> newElement(@Valid @RequestBody Empleado nuevoEmpleado){
    return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.añadir(nuevoEmpleado));
}
```

In the case of `@PutMapping`, to modify an element, it is similar to PostMapping, but before modifying the object, we can add a call to `findById` of that object to verify that the element we are going to modify exists. If it does not exist, a 404 NOT_FOUND exception will occur, leaving 400 BAD_REQUEST if validations are not passed.

```java
@PutMapping("/empleado/{id}")
public Empleado editElement(@Valid @RequestBody Empleado editEmpleado, @PathVariable Long id){
    empleadoService.obtenerPorId(id); //Only serves to check that it exists. If it does not exist, an exception is thrown and controller execution ends.
    return empleadoService.editar(editEmpleado);
}
```

We could have more than one `@ControllerAdvice` class or its specialization, but it is not common. Usually, a single class groups the handling of all exceptions.

On the other hand, by default, classes annotated with `@ControllerAdvice` and derivatives will handle all exceptions that reach any method of any controller in the application, but it could be restricted so that they only handle those of a specific controller, a specific class, etc.:

```java
@ControllerAdvice("my.chosen.package")
```

> **ACTIVITY 4:** Handle MyFavoriteComposer errors using `RestControllerAdvice`.
