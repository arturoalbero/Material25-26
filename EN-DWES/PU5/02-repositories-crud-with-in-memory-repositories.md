# 5.2 Repositories. CRUD with in-memory repositories

## 1. Repositories

A repository is an additional layer of our application that allows us to manage the data stored in some collection. Generally, the service layer, or directly the controller, will include a repository and call its methods, which will perform data access. Therefore, the repository layer will act on the model and will have methods to add to the collection, modify, delete, query, etc. In other words, up to now we have been working with repositories without knowing it.

At first we will look at repositories created by ourselves and in memory, but later we will see how to work with them using databases and how Spring takes care of all the “dirty” work for us.

Given a class *Empleado*, a repository is something as simple as defining a list instantiated with an *ArrayList* of *Empleado*. The *List* interface serves as a repository since it defines the methods *get()*, *add()*, *remove()* and *set()*.

The way to fit the repository into our application is by including it in our service:

```java
@Service
public class EmpleadoService{
    private List<Empleado> repository = new ArrayList<>();

}
```

And defining the operations. The most basic ones are usually referred to by the acronym CRUD (Create, Read, Update and Delete), in addition to some others such as listing all elements of the repository, searches, etc. For example, to add an element to the repository:

```java
public void addEmpleado(Empleado empleado){
    repository.add(empleado);
}
```

And similarly for the rest of the methods we need.

## 2. CRUD with in-memory repositories

With what we have seen so far, we can already build a complete application capable of managing one of the entities in our model, with the typical operations on it. Let’s look at it step by step with a specific example.

Suppose we want to manage a repository of the employees of a company, in this case with an in-memory repository. In the next chapter we will make it persistent using a database repository. The steps to follow would be:

1. Create a new project. Dependencies: starter-web, devtools, lombok, starter-thymeleaf and starter-validation. Optionally, webjars-bootstrap and webjars-locator if we want to use Bootstrap.
2. Create the folder/package structure we need: we can choose folders such as domain, controllers and services, rather than placing all elements in a single folder.
3. Create the classes that make up the domain model. In this case it would be only the Empleado class.

We can rely on Lombok to write less code:

```java
@Data
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Empleado{
    @Min( value = 0)
    private Long id;
    @NotEmpty
    private String nombre;
    @Email(message = "Must have valid email format")
    private String email;
    private Double salario;
    private boolean enActivo;
    private Genero genero;
}
```

> **NOTE: What is the difference between using `Long` and using `long` (or `Double` and `double`) – Wrappers vs primitive types:**
> A **primitive type** stores the value directly, **cannot be `null`**, is **faster**, and has no methods. It is suitable for calculations and when performance is a priority.
>
> A **wrapper (object)** of a primitive type **can be `null`**, works in **collections and generics**, and offers useful methods. It requires more memory and is slower because of autoboxing/unboxing (the ability to convert to and from a primitive type). It is suitable when we need class methods or when using collections and/or generics.

And we also create the enumeration for gender, inside the *domain* folder, in a Genero.java file:

```java
public enum Genero {MASCULINO, FEMENINO, OTROS};
```

4. Create the service that contains the repository with the CRUD methods of the service, which finally invoke the repository methods (in this case List). We will use the method based on interfaces:

```java
public interface EmpleadoService {
    Empleado add(Empleado empleado);

    List<Empleado> getAll();

    Empleado getById(long id) ;

    Empleado edit(Empleado empleado) ;

    void delete(Long id);

}
```

And the implementation:

```java
@Service
public class EmpleadoServiceImpl implements EmpleadoService {
    private List<Empleado> repository = new ArrayList<>();

    public List<Empleado> getAll() {
        return repository;
    }

    public Empleado getById(long id) {
        for (Empleado empleado : repository)
            if (empleado.getId() == id)
                return empleado;
        return null; // could throw exception if not found
    }

    public Empleado add(Empleado empleado) {
        if (repository.contains(empleado))
            return null;
        // see equals in Empleado (same id)
        repository.add(empleado);
        return empleado; // could return nothing, or boolean, etc
    }

    public Empleado edit(Empleado empleado) {
        int pos = repository.indexOf(empleado);
        // if (pos == -1) throw new RuntimeException("Employee not found");
        if (pos == -1)
            return null;
        repository.set(pos, empleado);
        return empleado;
    }

    public void delete(Long id) {
        Empleado empleado = this.getById(id);
        if (empleado != null)
            repository.remove(empleado);
    }
}
```

5. Create the controller that receives the user requests and invokes the appropriate service. The service is injected with `@Autowired` into the controller. For creating a new employee or editing an existing employee, we will need forms (`@PostMapping`). The URLs may be the following:

```text
/list               : list all employees
/{id}               : obtain only the data of employee `id`
/new                : form to add a new employee
/edit/{id}          : form to modify employee `id`
/delete/{id}        : delete employee `id`
```

And the controller:

```java
@Controller
public class EmpleadoController {

    @Autowired
    public EmpleadoService empleadoService;

    private String txtMsg;

    @GetMapping({ "/", "/list" })
    public String showList(Model model) {
        model.addAttribute("listaEmpleados", empleadoService.getAll());
        if (txtMsg != null) {
            model.addAttribute("msg", txtMsg);
            txtMsg = null;
        }
        return "listView";
    }

    @GetMapping("/{id}")
    public String showElement(@PathVariable Long id, Model model) {
        Empleado empleado = empleadoService.getById(id);
        if (empleado == null) {
            txtMsg = "Employee not found";
            return "redirect:/";
        }
        model.addAttribute("empleado", empleado);
        return "listOneView";

    }

    @GetMapping("/new")
    public String showNew(Model model) {
        // the commandobject of the form is an empty employee instance
        model.addAttribute("empleadoForm", new Empleado());
        return "newFormView";
    }

    @PostMapping("/new/submit")
    public String showNewSubmit(@Valid Empleado empleadoForm,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            txtMsg = "Form error";
            return "redirect:/";
        }
        empleadoService.add(empleadoForm);
        txtMsg = "Operation successfully completed";
        return "redirect:/";
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable long id, Model model) {
        Empleado empleado = empleadoService.getById(id);
        if (empleado == null) {
            txtMsg = "Employee not found";
            return "redirect:/";
        }
        model.addAttribute("empleadoForm", empleado);
        return "editFormView";
    }

    @PostMapping("/edit/{id}/submit")
    public String showEditSubmit(@PathVariable Long id, @Valid Empleado empleadoForm,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            txtMsg = "Form error";
            return "redirect:/";
        }
        Empleado empleado = empleadoService.edit(empleadoForm);
        if (empleado == null)
            txtMsg = "Employee not found";
        else
            txtMsg = "Operation successfully completed";
        return "redirect:/";
    }

    @GetMapping("/delete/{id}")
    public String showDelete(@PathVariable long id) {
        empleadoService.delete(id);
        txtMsg = "Operation successfully completed";
        return "redirect:/";
    }
}
```

6. Now we need to create the client views.

<details>
<summary>

`listView.html`

</summary>

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employee CRUD</title>
  </head>
  <body>
          <h1>Employee list</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th>
                <th>Edit</th><th>Delete</th></tr>
            </thead>
            <tbody>
              <tr th:each="empleado : ${listaEmpleados}">
                <td th:text="${empleado.id}">Id</td>
                <td><a th:href="@{/{id}(id=${empleado.id})}" th:text="${empleado.nombre}">name</a></td>
                <td th:text="${empleado.email}">email@mail.com</td>
                <td><a  th:href="@{/edit/{id}(id=${empleado.id})}">Edit</a></td>        		
                <td><a th:href="@{/delete/{id}(id=${empleado.id})}">Delete</a></td>        		
              </tr>
            </tbody>
          </table>
          <p th:if="${msg!=null}">
            <span th:text="${msg}">err</span>
          </p>    
        <a th:href="@{/new}">New employee</a><br/>
  </body>
</html>
```

</details>

<details>
<summary>

`listOneView.html`

</summary>

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employee CRUD</title>
  </head>
  <body>
            <h1>Employee data</h1>
             <table>
            <tbody>
              <tr><td>Id</td>	<td th:text="${empleado.id}">Id</td></tr>
              <tr><td>Name</td><td th:text="${empleado.nombre}">name</td></tr>
              <tr><td>Email</td><td th:text="${empleado.email}">email@mail.com</td></tr>
              <tr><td>Salary</td> <td th:text="${empleado.salario}">0</td></tr>
              <tr><td>Active</td><td th:text="${empleado.enActivo}">bool</td></tr>
              <tr><td>Gender</td><td th:text="${empleado.genero}">gender</td></tr>
              <tr><td><a th:href="@{/edit/{id}(id=${empleado.id})}">Edit</a></td>
                  <td><a th:href="@{/delete/{id}(id=${empleado.id})}">Delete</a>
                      <a  th:href="@{/}">Home</a></td></tr>
            </tbody>
        </table>
        </div>
      </div>
  </body>
</html>
```

</details>
<details>
<summary>

`editFormView.html`

</summary>

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employee CRUD</title>
    <style>.cssError{ background-color:red; }</style>
  </head>
  <body>
    <h1>Edit employee</h1>
    <form method="post" action="#" 
            th:action="@{/edit/{id}/submit(id=${empleadoForm.id})}" 
            th:object="${empleadoForm}">
            <input type="hidden" id="id" th:field="*{id}" /> </label>
            <label>Name:<input type="text" id="nombre" th:field="*{nombre}" /></label><br/>
            <label>Email:<input type="text" id="email" th:field="*{email}"/></label><br/>
            <label>Salary:<input type="text" id="salario" th:field="*{salario}" /></label><br/>
            <label>Active:<input type="checkbox" id="enActivo"  th:field="*{enActivo}" ></label><br/>
            Gender:<br/>          
            <div th:each="gen : ${T(com.example.myapp.domain.Genero).values()}">
                <input type="radio" name="button1" th:value="${gen}" th:text="${gen}" th:field="*{genero}" />
            </div>
            <input  type="submit" value="Submit" />    
            <a  th:href="@{/}">Home</a>
    </form>
  </body>
</html>
```

</details>
<details>
<summary>

`newFormView.html`

</summary>

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employee CRUD</title>
  </head>
  <body>
    <h1>New employee</h1>
    <form method="post" action="#" th:action="@{/new/submit}"
            th:object="${empleadoForm}">
            <label>Id:<input type="text" id="id" th:field="*{id}" /> </label><br/>
            <label>Name:<input type="text" id="nombre" th:field="*{nombre}" /></label><br/>
            <label>Email:<input type="text" id="email" th:field="*{email}"/></label><br/>
            <label>Salary:<input type="text" id="salario" th:field="*{salario}" /></label><br/>
            <label>Active:<input type="checkbox" id="enActivo"  th:field="*{enActivo}" ></label><br/>
            Gender:<br/>          
            <div th:each="gen : ${T(com.example.myapp.domain.Genero).values()}">
                <input type="radio" name="button1" th:value="${gen}" th:text="${gen}" th:field="*{genero}" />
            </div>
            <input  type="submit" value="Submit" />
    </form>
    <br/>
    <a  th:href="@{/}">Home</a><br/>
  </body>
</html>
```

</details>

We can create a *commandLineRunner* to initially add some data so that it does not start with an empty list. We would add this in the application class (the one that contains the main and the `@SpringBootApplication` annotation):

```java
@SpringBootApplication
public class Main {

	public static void main(String[] args) {
		SpringApplication.run(Main.class, args);
	}

	@Bean
	CommandLineRunner initData(EmpleadoService empleadoService) {
		return args -> {
			empleadoService.add(	new Empleado(1L, "José López", "jlp@mail.com", 25000d, true, Genero.MASCULINO));
			empleadoService.add(new Empleado(2L, "Ana García", "anag@mail.com", 20000d, false,Genero.FEMENINO));

		};
	}

}
```

> **ACTIVITY 1** Carry out work analogous to the previous example in the new version of My Favourite Composer. Keep in mind that it is similar to what you already did in the previous version, but with a slightly different approach.
> - Organize the entities using repositories
> - Create the CRUD methods and any others you consider necessary to work with the repositories in their corresponding services.
> - Adapt the views you already had, or create new ones, to support those methods. Use clear and concise URI naming. Use `@PathVariable`.
> - Initialize the data from the .csv file using CommandLineRunner.
> You can adapt the practice already done to this format, or do it again.

### Records or Lombok?

As we know, Records are part of the Java language that allow us to create immutable classes while saving a lot of code. Lombok, on the other hand, is a module that does not belong to the standard language, and it does practically the same thing with one important difference: Lombok classes are not immutable.

In general, it is more idiomatic to use Records than Lombok. During this unit, however, we will work with Lombok to practice. But as a general rule, give priority to using records over Lombok and reserve Lombok for the following cases:

– You need mutability in the classes.
– You need customized common methods (constructors, equals, etc.).
– When you need to use inheritance.
– To work with JPA/Hibernate.

> **ACTIVITY 2** Create the DTOs (Data Transfer Objects) for the forms using records and the domain model entities using Lombok.

## Filters in the view

The process seen so far allows us to perform a full CRUD on the *Empleado* entity, but generally we will need filters so that when consulting employees, we can filter by some attribute and obtain a subset of them.

### Text filter

This is a typical filter where the user is shown a text box in which they enter a text and, when sending it to the server, it filters the elements that match totally or partially in a certain attribute. In general, uppercase and lowercase are not distinguished in these filters:

```html
<form method="post" action="#" th:action="@{/findByName}" th:object="${findForm}">
    <label>Search by name:
      <input type="text" th:field="*{nombre}" /></label>
    <input type="submit" value="Search" />
  </form>
```

We must send an Empleado as *commandObject* to the form, but in reality we could send a much simpler class (a DTO) with only a String to receive the text to search for in the name.

```java
model.addAttribute("findForm", new Empleado());
```

**Controller**:

```java
@PostMapping("/findByName")
    public String showFindByNameSubmit(Empleado empleadoForm, Model model) {
        model.addAttribute("listaEmpleados",
                empleadoService.searchByName(empleadoForm.getNombre()));
        model.addAttribute("findForm", empleadoForm);
        return "listView";
    }
```

**Service**:

```java
public List<Empleado> searchByName(String nameText) {
        nameText = nameText.toLowerCase();
        List<Empleado> found = new ArrayList<>();
        for (Empleado empleado : repository)
            if (empleado.getNombre().toLowerCase().contains(nameText))
                found.add(empleado);
        return found;
    }
```

### Filter by list element

Another common way to filter attributes that have a closed set of values is through a list in which the user can select a specific value and show only the elements that contain that value in the attribute.

```html
Select gender:
  <select id="genero" onChange="changeGenero();">
  <option value="">All</option>             
  <option
    th:each="gen : ${T(com.example.myapp.domain.Genero).values()}"  
    th:value="${gen}" th:text="${gen}"
    th:selected="${gen} == ${generoSeleccionado} ? true : false">
  </option>
</select>
<script>
  function changeGenero(){
     const select = document.getElementById("genero");
     if (select.value == "") window.location.href = "/";
     else window.location.href = "/findByGenero/"+select.value;
  }
</script>
```

The line `th:selected="${generoSeleccionado} ? true : false"` is not mandatory, but it is advisable so that when showing the filtered results, the option sent appears selected in the dropdown and not the first option or the default option. As a result, we must send that `generoSeleccionado` variable in the *model*.

**Controller**:

```java
@GetMapping("/findByGenero/{genero}")
    public String showFindByGen(@PathVariable Genero genero, Model model) {
        model.addAttribute("listaEmpleados", empleadoService.searchByGenero(genero));
        model.addAttribute("findForm", new Empleado());
        model.addAttribute("generoSeleccionado", genero);
        return "listView";
    }
```

**Service**:

```java
 public List<Empleado> searchByGenero(Genero genero) {
        List<Empleado> found = new ArrayList<>();
        for (Empleado empleado : repository)
            if (empleado.getGenero() == genero)
                found.add(empleado);
        return found;
    }
```

These two filters are independent; filters are not combined by default, and one or the other is applied. Their combined functionality would have to be programmed.

> **ACTIVITY 3:** Reprogram the filters you had (by name, by nationality, by genre for the pieces) to adapt them to the established format.
> - At least one text filter and one filter by list element.
