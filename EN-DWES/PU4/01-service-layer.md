# The Service Layer

## 1. Functions of the Service Layer

The service layer is responsible for the business logic, the rules and calculations that the application must perform in each case.

Typically, the methods of a service class are invoked from a controller, and it is the controller that passes the values provided by the client to the service as parameters in order to perform the necessary calculations. It is also common for the service to need access to data repositories to obtain additional information required to execute the business rules. Finally, the methods in the service layer return the result to the controller, which then sends it back to the client.

```mermaid
flowchart LR
c[Client] --makes request--> con[Controller]
con --forwards request--> ser[Service Layer]
ser --accesses data--> da[Data Repositories -DB, etc.-]
da --returns data--> ser
ser --performs calculations--> con
con --returns result--> c
```

## 2. Implementing a Service Class

Service classes are annotated with `@Service`, and instead of creating instances in the controller with a constructor as we have done until now, Spring injects the service into the controller using the `@Autowired` annotation, thus reducing **code coupling**.

Regarding the location of services, we can create a package called `services` and store them all there, or, if we have opted for a more domain-oriented organization, they can go in the same folder as the controllers for the same area (*Client*, *Product*, etc.). Spring places no restrictions on this structure, but they must be subpackages of the root package, just like the controllers.

Below is an example of a controller and a service that receives two numbers in the URL and returns a view with their sum.

```java
@Service
public class SumaService {
    public Integer suma(Integer a, Integer b){
        return a + b;
    }
}
```

```java
@Controller
public class SumaController{

    @Autowired
    private SumaService sumaService;

    @GetMapping("/suma/{nX}/{nY}")
    public String showSuma(@PathVariable Integer nX, @PathVariable Integer nY, Model model){
        Integer result = sumaService.suma(nX, nY);
        model.addAttribute("resultado", result);
        return "resultSumaView";
    }
}
```

We can notice that by adding `@Autowired`, we are no longer manually calling the service constructor.

The goals of the service layer are:

* To separate business logic from data presentation. Any change in how data is received or displayed (for example, switching to a REST API) will not affect this part of the application.
* More structured code, with smaller methods and classes.
* Easier unit testing: we can test different services without needing to simulate the entire user interaction process.

Additionally, using services through Spring has several advantages over manually managing data as we have done until now. Spring will handle the access, instantiation, and destruction of services. This helps prevent coupling-related errors.

## 3. Coupling and How to Solve It

Coupling is the dependency between classes and can be solved using a component-based approach.

```java
class Motor{
    int id;
    int potencia;
    Motor(int id, int potencia){
        this.id = id;
        this.potencia = potencia;
    }
}
// CAR CLASS WITH COUPLING
class Coche{
    String modelo;
    Motor motor;
    Coche (String modelo, int i, int p){
        this.modelo = modelo;
        this.motor = new Motor(i, p);
    }
}
// CAR CLASS WITH DEPENDENCY INJECTION (LESS COUPLING)
class Coche{
    String modelo;
    Motor motor;
    Coche (String modelo, Motor motor){
        this.modelo = modelo;
        this.motor = motor;
    }
}
```

Spring implements **Inversion of Control (IoC)** and **Dependency Injection (DI)** to reduce coupling. The class does not create its dependencies; Spring provides them.

> **ACTIVITY**: Modify the data management class to make it a service.
>
> * Composers and pieces are **no longer stored in memory** in lists; instead, they are retrieved or edited each time (preparing the transition from .csv to a database).
> * Create a service to interact with CSV files and perform CRUD operations (Create, Read, Update, Delete).
>
>   * For the methods, follow a structure like: `public void create(String composerAsCSV, String csvPath);`
>   * For Read, make it return a string (or an array of strings) and make sure each of your classes has a constructor that accepts an array of strings (where each element corresponds to a field).
> * Adjust the project to ensure everything works correctly.
