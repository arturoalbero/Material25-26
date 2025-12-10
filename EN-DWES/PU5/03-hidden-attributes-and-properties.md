# 5.3 Hidden attributes in forms and parameters in archives

## 1. Unused Attributes in Forms

In some cases (for example, when creating a new element in a CRUD) there may be attributes that we do not want to be introduced in the form, either because they take a default value, because they are calculated in a service, etc. One example could be the employee’s registration date, which could be taken automatically from the system.

In these cases, if the view with the form has no `<input>` associated with an attribute, when submitting, that attribute will reach the controller with a null value. To solve this possible issue, we have several options:

* a) Assign the value after receiving it from the submit, not before.
* b) If it is necessary to assign it beforehand, for example in the constructor, add a `<input type="hidden">` in the view so that it remains hidden but retains the previously assigned value.
* c) Create an ad-hoc class only with the form fields (what is known as a DTO), and once received, move those attributes from the DTO to the real object. This would be the best option.

Let’s see all this in an example. Suppose we are still in the CRUD of the `Empleado` entity and that, in addition to the previous attributes, it has a new one called `fechaRegistro`.

Suppose that this last attribute is taken from the system date. The possibilities seen would look like this:

- a) In the service (or controller), assign the value after receiving it from the `submit` and not before:

```java
public Empleado añadir(Empleado empleado){
    empleado.setFechaRegistro(LocalDate.now());
    repositorio.add(empleado);
    return empleado;
}
```

- b) If the value has been previously added, add a `<input type="hidden">` in the form view so as not to lose it. Then, in the `Empleado` class, we modify the default constructor to assign the value before sending it to the form:

```java
public Empleado(){
    this.fechaRegistro=LocalDate.now();
}
```

And then in the view:

```html
<input type="hidden" th:field="*{fechaRegistro}" />
```

- c) We create an ad-hoc class only with the form fields (what is called a DTO). Since Java 14 we can use `record`, which are especially useful for creating them.

```java
public record EmpleadoDTO(Long id, String nombre, Double salario){}
```

We would pass an *EmpleadoDTO* to the new-employee form view instead of an *Empleado*. Upon receiving the DTO, we call a service method that assigns the dto fields to the employee.

```java
@PostMapping("/nuevo/submit")
public String showNewSubmit(EmpleadoDTO empleadoForm){
    Empleado e = empleadoService.buildEmpleadoFromDto(empleadoForm);
    empleadoService.add(e);
    return "redirect:/";
}
```

And the `buildEmpleadoFromDto` method would be something like this:

```java
public Empleado buildEmpleadoFromDto(EmpleadoDTO empleadoDTO){
    Empleado empleado = new Empleado();
    empleado.setId(empleadoDTO.id());
    (... all the setters)
    return empleado;
}
```

> **ACTIVITY 1**: Read about **records** on [*this web page*](https://www.makigas.es/series/records-en-java/records-de-java-que-son-y-como-usarlos) and answer the following questions:
>
> * Which methods are automatically generated in a record?
> * Why can’t setters be used?
> * What does it mean that the attributes are final?
> * What particularity do the automatically generated getters have?

> **ACTIVITY 2**: Modify the forms and their corresponding controller methods to demonstrate the three alternatives we have for managing hidden attributes. You may modify the classes to add some hidden attribute if needed:
>
> 1. Manually assigning the hidden attribute.
> 2. Using a hidden field.
> 3. Using an ad-hoc DTO (with record)

## 2. Reading File Parameters

A typical operation in our applications will be obtaining certain values of variables or constants from a configuration file: for example, the VAT percentage to apply in our invoices, global amounts or dates for the whole application, etc., or even text messages that will be displayed depending on the selected language.

These parameters may be stored in different formats: XML, JSON, etc., but it is very common to store them in a `properties` file, similar to the `application.properties` we already know. Here is an example:

```properties
porcentajeImpuesto = 0.21
bonus = 200
```

Working with this type of file is very simple:

1. Create the file with the `properties` extension and store it in the `/resources` folder or one of its subfolders.
2. Create a class that stores the parameters from the file in variables that we can then use. The class will be in the package where the rest of the classes are, typically in the `/config` subpackage (which we create ourselves), and it must meet the following requirements:
   – Annotated with `@Configuration` so it is created at the beginning of the application.
   – Annotated with `@PropertySource("classpath:/config/miarchivo.properties")`. The path is wherever you place the properties file.
   – Create getters and setters (use Lombok).
   – Have an attribute for each variable contained in the file and annotate it with `@Value("${variableNameInFile}")`

```java
@Configuration
@Getter
@Setter
@PropertySource("classpath:/config/parametros.properties")
public class Parametros{
    @Value("${porcentajeImpuesto}")
    private Double porcentajeImpuesto;
    @Value("${bonus}")
    private Integer bonus;
}
```

3. Then, simply inject the class wherever needed, generally in service classes:

```java
@Autowired
private Parametros parametros;
```

To use its values through the getters:

```java
Double salarioFinal = empleado.getSalarioBase() * (1 - parametros.getPorcentajeImpuesto()) + parametros.getBonus();
empleado.setSalarioFinal(salarioFinal);
```

It is also common to use it for sending emails as we saw in the previous topic. There we can store generic messages, usual addresses, etc.

> **ACTIVITY 3:** Redo the newsletter email-sending process you designed, storing the messages in a configuration file named `email.properties`.

> **ACTIVITY 4:** Create another configuration file in which you store messages that you will later send to the view through the controllers:
> * Error messages
> * Welcome messages

> **ACTIVITY 5:** Create another configuration file in which we store the web application version `version = 1`. Then, add in one of the classes a parameter indicating in which version of the application it was created. That parameter must also be stored in the corresponding `.csv`.

---

> **AMPLIATION ACTIVITY**: Using a `.properties` archive, create a way to have two versions of the page, one in `Castellano` (or `English`) and the other in `Valenciano`.
> - All the messages have to be represented in a `.properties` archive and have to be accessed through a `@Configuration` class.
> - When you add a composer or a musical piece, add a tag that indicates in which language version of the page was added.
> - You can modify the description or biography of the composers or musical pieces depending on the language. You can store the data using a MAP like this:
> ```java
> Map<LanguageEnum, String> descriptions; //LanguageEnum is an Enum with the languages of the webpage, like ES for Spanish, EN for English, RU for Russian, etc.
>```
