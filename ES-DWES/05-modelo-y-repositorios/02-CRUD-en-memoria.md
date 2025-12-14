# Repositorios. CRUD con repositorios en memoria

## 1. Repositorios

Un repositorio es una capa adicional de nuestra aplicación que permite gestionar los datos almacenados en alguna colección. Generalmente la capa de servicio, o directamente el controlador, incluirá un repositorio e invocará a sus métodos que harán acceso a los datos. Así pues, la capa de repositorio actuará sobre el modelo y tendrá métodos para añadir la colección, modificar, eliminar, consultar, etc. Es decir, hasta ahora hemos estado trabajando con repositorios sin saber que lo hacíamos.

En principio vamos a ver repositorios creados por nosotros mismos y en memoria, pero más adelante veremos cómo trabajarlos con bases de datos y como Spring se encarga de hacer todo el trabajo "sucio" por  nosotros.

Dada una clase *Empleado*, un repositorio es algo tan sencillo como definir una lista instanciada con un *ArrayList* de *Empleado*. La interfaz *List* cumple su función como repositorio ya que tiene definidos los métodos *get()*, *add()*, *remove()* y *set()*.

La forma de encajar el repositorio en nuestra aplicación es incluyéndolo en nuestro servicio:
```java
@Service
public class EmpleadoService{
    private List<Empleado> repositorio = new ArrayList<>();

}
```

Y, definiendo las operaciones. Las más básicas serían las referidas habitualmente con el acrónimo CRUD (Create, Read, Update y Delete), además de algunas otras como listar todos los elementos del repositorio, búsquedas, etc. Por ejemplo, para añadir un elemento al repositorio:
```java
public void addEmpleado(Empleado empleado){
    repositorio.add(empleado);
}
```

Y de forma análoga el resto de métodos que precisemos.

## 2. CRUD con repositorios en memoria

Con lo que hemos visto hasta ahora ya podemos hacer una aplicación completa que sea capaz de gestionar una entidad de nuestro modelo, con las operaciones típicas sobre el mismo. Vamos a verlo paso a paso, con un ejemplo concreto.

Supongamos que queremos gestionar un repositorio de los empleados de una empresa, en este caso con un repositorio en memoria. En el capítulo siguiente lo haremos persistente, mediante un repositorio sobre base de datos. Los pasos a seguir serían:

1. Crear un nuevo proyecto. Dependencias: starter-web, devtools, lombok, starter-thymeleaf y starter-validation. Opcionalmente, webjars-bootstrap y webjars-locator si queremos usar bootstrap.
2. Crear la estructura de carpetas/paquete que precisemnos: podemos optar por carpetas: domain, controllers y services mejor que todos los elementos en una única carpeta.
3. Crear las clases que conforman el modelo de dominio. En este caso sería solo la clase Empleado.

Podemos ayudarnos de Lombok para escribir menos código:

```java
@Data
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Empleado{
    @Min( value = 0)
    private Long id;
    @NotEmpty
    private String nombre;
    @Email(message = "Debe tener formato email válido")
    private String email;
    private Double salario;
    private boolean enActivo;
    private Genero genero;
}
```
> **NOTA: ¿Qué diferencia hay entre usar `Long` y usar `long` (o `Double` y `double`) - Wrappers vs tipos primitivos:** 
> Un **tipo primitivo**: almacena directamente el valor, **no puede ser `null`**, es más **rápido** y no tiene métodos. Es apropiado para cálculos y para cuando se prioriza el rendimineto.
>
> Por otro lado, un **wrapper (objeto)** de un tipo primitivo **puede ser `null`**, funciona en **colecciones y genéricos**, y ofrece métodos útiles. Requiere más memoria y es más lento debido al autoboxing/unboxing (capacidad de conversión y desconversión en un tipo primitivo). Es apropiado para cuando necesitamos los métodos de la clase o queremos usar colecciones y/o genéricos.

Y creamos también la enumeración para el género, dentro de la carpeta *domain*, en un archivo Genero.java:
```java
public enum Genero {MASCULINO, FEMENINO, OTROS};
```

4. Crear el servicio que contiene el repositorio con los métodos CRUD del servicio que invocan finalmente a los métodos del repositorio (en este caso de List). Emplearemos el método usando interfaces:
```java
public interface EmpleadoService {
    Empleado añadir(Empleado empleado);

    List<Empleado> obtenerTodos();

    Empleado obtenerPorId(long id) ;

    Empleado editar(Empleado empleado) ;

    void borrar(Long id);

}
```

Y la implementación:

```java
@Service
public class EmpleadoServiceImpl implements EmpleadoService {
    private List<Empleado> repositorio = new ArrayList<>();

    public List<Empleado> obtenerTodos() {
        return repositorio;
    }

    public Empleado obtenerPorId(long id) {
        for (Empleado empleado : repositorio)
            if (empleado.getId() == id)
                return empleado;
        return null; // podría lanzar excepción si no encontrado
    }

    public Empleado añadir(Empleado empleado) {
        if (repositorio.contains(empleado))
            return null;
        // ver equals Empleado (mismo id)
        repositorio.add(empleado);
        return empleado; // podría no devolver nada, o boolean, etc

    }

    public Empleado editar(Empleado empleado) {
        int pos = repositorio.indexOf(empleado);
        // if (pos == -1) throw new RuntimeException ("Empleado no encontrado");
        if (pos == -1)
            return null;
        repositorio.set(pos, empleado);
        return empleado;
    }

    public void borrar(Long id) {
        Empleado empleado = this.obtenerPorId(id);
        if (empleado != null)
            repositorio.remove(empleado);
    }
}
```

5. Crear el controlador que recibe las peticiones del usuario e invoca al servicio adecuado. El servicio está inyectado con `@Autowired` en el controlador. Para el alta de un nuevo empleado o para editar un empleado existente necesitaremos formularios(`@PostMapping`). Las URL podrán ser las siguientes:
```text
/list               : listar todos los empleados
/{id}               : obtener los datos solo del empleado `id`
/nuevo              : formulario para añadir un nuevo empleado
/editar/{id}        : formulario para modificar empleado `id`
/borrar/{id}        : eliminar el empleado `id`
```
Y el controlador:
```java
@Controller
public class EmpleadoController {

    @Autowired
    public EmpleadoService empleadoService;

    private String txtMsg;

    @GetMapping({ "/", "/list" })
    public String showList(Model model) {
        model.addAttribute("listaEmpleados", empleadoService.obtenerTodos());
        if (txtMsg != null) {
            model.addAttribute("msg", txtMsg);
            txtMsg = null;
        }
        return "listView";
    }

    @GetMapping("/{id}")
    public String showElement(@PathVariable Long id, Model model) {
        Empleado empleado = empleadoService.obtenerPorId(id);
        if (empleado == null) {
            txtMsg = "Empleado no encontrado";
            return "redirect:/";
        }
        model.addAttribute("empleado", empleado);
        return "listOneView";

    }

    @GetMapping("/nuevo")
    public String showNew(Model model) {
        // el commandobject del formulario es una instancia de empleado vacia
        model.addAttribute("empleadoForm", new Empleado());
        return "newFormView";
    }

    @PostMapping("/nuevo/submit")
    public String showNewSubmit(@Valid Empleado empleadoForm,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            txtMsg = "Error en formulario";
            return "redirect:/";
        }
        empleadoService.añadir(empleadoForm);
        txtMsg = "Operación realizada con éxito";
        return "redirect:/";
    }

    @GetMapping("/editar/{id}")
    public String showEditForm(@PathVariable long id, Model model) {
        Empleado empleado = empleadoService.obtenerPorId(id);
        if (empleado == null) {
            txtMsg = "Empleado no encontrado";
            return "redirect:/";
        }
        model.addAttribute("empleadoForm", empleado);
        return "editFormView";
    }

    @PostMapping("/editar/{id}/submit")
    public String showEditSubmit(@PathVariable Long id, @Valid Empleado empleadoForm,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            txtMsg = "Error en formulario";
            return "redirect:/";
        }
        Empleado empleado = empleadoService.editar(empleadoForm);
        if (empleado == null)
            txtMsg = "Empleado no encontrado";
        else
            txtMsg = "Operación realizada con éxito";
        return "redirect:/";
    }

    @GetMapping("/borrar/{id}")
    public String showDelete(@PathVariable long id) {
        empleadoService.borrar(id);
        txtMsg = "Operación realizada con éxito";
        return "redirect:/";
    }
}
```
6. Ahora hay que crear vistas del cliente.
<details>
<summary>

`listView.html`
</summary>

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Empleado CRUD</title>
  </head>
  <body>
          <h1>Listado de empleados</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Email</th>
                <th>Editar</th><th>Borrar</th></tr>
            </thead>
            <tbody>
              <tr th:each="empleado : ${listaEmpleados}">
                <td th:text="${empleado.id}">Id</td>
                <td><a th:href="@{/{id}(id=${empleado.id})}" th:text="${empleado.nombre}">nombre</a></td>
                <td th:text="${empleado.email}">email@mail.com</td>
                <td><a  th:href="@{/editar/{id}(id=${empleado.id})}">Editar</a></td>        		
                <td><a th:href="@{/borrar/{id}(id=${empleado.id})}">Borrar</a></td>        		
              </tr>
            </tbody>
          </table>
          <p th:if="${msg!=null}">
            <span th:text="${msg}">err</span>
          </p>    
        <a th:href="@{/nuevo}">Nuevo empleado</a><br/>
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
<html lang="es" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Empleado CRUD</title>
  </head>
  <body>
            <h1>Datos de empleado</h1>
             <table>
            <tbody>
              <tr><td>Id</td>	<td th:text="${empleado.id}">Id</td></tr>
              <tr><td>Nombre</td><td th:text="${empleado.nombre}">nombre</td></tr>
              <tr><td>email</td><td th:text="${empleado.email}">email@mail.com</td></tr>
              <tr><td>Salario</td> <td th:text="${empleado.salario}">0</td></tr>
              <tr><td>En Activo</td><td th:text="${empleado.enActivo}">bool</td></tr>
              <tr><td>Genero</td><td th:text="${empleado.genero}">genero</td></tr>
              <tr><td><a th:href="@{/editar/{id}(id=${empleado.id})}">Editar</a></td>
                  <td><a th:href="@{/borrar/{id}(id=${empleado.id})}">Borrar</a>
                      <a  th:href="@{/}">Inicio</a></td></tr>
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
<html lang="es" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Empleado CRUD</title>
    <style>.cssError{ background-color:red; }</style>
  </head>
  <body>
    <h1>Editar empleado</h1>
    <form method="post" action="#" 
            th:action="@{/editar/{id}/submit(id=${empleadoForm.id})}" 
            th:object="${empleadoForm}">
            <input type="hidden" id="id" th:field="*{id}" /> </label>
            <label>Nombre:<input type="text" id="nombre" th:field="*{nombre}" /></label><br/>
            <label>Email:<input type="text" id="email" th:field="*{email}"/></label><br/>
            <label>Salario:<input type="text" id="salario" th:field="*{salario}" /></label><br/>
            <label>En Activo:<input type="checkbox" id="enActivo"  th:field="*{enActivo}" ></label><br/>
            Genero:<br/>          
            <div th:each="gen : ${T(com.example.myapp.domain.Genero).values()}">
                <input type="radio" name="button1" th:value="${gen}" th:text="${gen}" th:field="*{genero}" />
            </div>
            <input  type="submit" value="Enviar" />    
            <a  th:href="@{/}">Inicio</a>
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
<html lang="es" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Empleado CRUD</title>
  </head>
  <body>
    <h1>Nuevo empleado</h1>
    <form method="post" action="#" th:action="@{/nuevo/submit}"
            th:object="${empleadoForm}">
            <label>Id:<input type="text" id="id" th:field="*{id}" /> </label><br/>
            <label>Nombre:<input type="text" id="nombre" th:field="*{nombre}" /></label><br/>
            <label>Email:<input type="text" id="email" th:field="*{email}"/></label><br/>
            <label>Salario:<input type="text" id="salario" th:field="*{salario}" /></label><br/>
            <label>En Activo:<input type="checkbox" id="enActivo"  th:field="*{enActivo}" ></label><br/>
            Genero:<br/>          
            <div th:each="gen : ${T(com.example.myapp.domain.Genero).values()}">
                <input type="radio" name="button1" th:value="${gen}" th:text="${gen}" th:field="*{genero}" />
            </div>
            <input  type="submit" value="Enviar" />
    </form>
    <br/>
    <a  th:href="@{/}">Inicio</a><br/>
  </body>
</html>
```
</details>

Podemos crear un *commandLineRunner* para añadir inicialmente algún dato y que no arranque con la lista vacía. Añadiríamos en la clase aplicación (la que contiene el main y la anotación `@SpringBootApplication`):

```java
@SpringBootApplication
public class Main {

	public static void main(String[] args) {
		SpringApplication.run(Main.class, args);
	}

	@Bean
	CommandLineRunner initData(EmpleadoService empleadoService) {
		return args -> {
			empleadoService.añadir(	new Empleado(1L, "José López", "jlp@mail.com", 25000d, true, Genero.MASCULINO));
			empleadoService.añadir(new Empleado(2L, "Ana García", "anag@mail.com", 20000d, false,Genero.FEMENINO));

		};
	}

}
```

> **ACTIVIDAD 1** Realiza un trabajo análogo al ejemplo anterior en la nueva versión de My Favourite Composer. Ten en cuenta que es algo similar a lo que ya hiciste en la versión anterior, pero con un enfoque ligeramente diferente.
> - Organiza las entidades usando repositorios
> - Crea los métodos CRUD y aquellos que consideres necesarios para trabajar con los repositorios en sus correspondientes servicios.
> - Adapta las vistas que ya tenías, o crea nuevas, para satisfacer esos métodos. Emplea para las URI una nomenclatura clara y concisa. Usa `@PathVariable`.
> - Inicializa los datos desde el archivo .csv usando el CommandLineRunner.
> Puedes adaptar la práctica ya hecha al formato, o hacerla de nuevo.

### ¿Uso de Records o Lombok?

Como sabemos, los Records son una parte del lenguaje Java que nos permite crear clases inmutables ahorrando mucho código. Por otro lado, Lombok es un módulo que no pertenece al lenguaje estándar, y hace prácticamente lo mismo con una salvedad importante: las clases en Lombok no son inmutables.

En general, es más idiomático usar Record que usar Lombok. Durante este tema, sin embargo, trabajaremos con Lombok para practicar. Pero como norma general, dale prioridad al uso de records por encima del de Lombok y reserva Lombok para los siguientes casos:

- Necesitas mutabilidad en las clases.
- Necesitas métodos comunes personalizados (constructores, equals, etc).
- Cuando necesitas usar herencia.
- Para trabajar con JPA/Hibernate.

> **ACTIVIDAD 2** Crea los DTO (Data Transfer Objects) de los formularios usando records y las entidades del modelo de dominio usando Lombok.

## Filtros en la vista

El proceso visto hasta ahora permite realizar un CRUD completo sobre la entidad *Empleado*, pero generalmente necesitaremos filtros para que, cuando consultamos los empleados, podamos filtrar por algún atributo y obtener un subconjunto de los mismos.

### Filtro por texto

Este es un filtro típico en el que al usuario se le presenta una caja de texto en la que el usuario introduce un texto y, al enviarlo al servidor, filtrará los elementos que coincidan total o parcialmente en un determinado atributo. En general, no se distinguen mayúsculas y minúsculas en estos filtros:

```html
<form method="post" action="#" th:action="@{/findByName}" th:object="${findForm}">
    <label>Buscar por nombre:
      <input type="text" th:field="*{nombre}" /></label>
    <input type="submit" value="Buscar" />
  </form>
```

Debemos enviar al formulario un Empleado como *commandObject* pero, en realidad, podríamos enviarle una clase mucho más sencilla (un DTO) solo con un String para recibir el texto a buscar en el nombre.
```java
model.addAttribute("findForm", new Empleado());
```

**Controlador**:

```java
@PostMapping("/findByName")
    public String showFindByNameSubmit(Empleado empleadoForm, Model model) {
        model.addAttribute("listaEmpleados",
                empleadoService.buscarPorNombre(empleadoForm.getNombre()));
        model.addAttribute("findForm", empleadoForm);
        return "listView";
    }
```

**Servicio**:

```java
public List<Empleado> buscarPorNombre(String textoNombre) {
        textoNombre = textoNombre.toLowerCase();
        List<Empleado> encontrados = new ArrayList<>();
        for (Empleado empleado : repositorio)
            if (empleado.getNombre().toLowerCase().contains(textoNombre))
                encontrados.add(empleado);
        return encontrados;
    }
```

### Filtro por elemento de lista

Otra forma habitual de filtrar para aquellos atributos que tengan un conjunto cerrado de valores será a través de una lista en la que el usuario pueda seleccionar un valor concreto y muestren solo los elementos que contienen ese valor en el atributo.

```html
Seleccionar género:
  <select id="genero" onChange="changeGenero();">
  <option value="">Todos</option>             
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

La línea `th:selected="${generoSeleccionado} ? true : false"` no sería obligatoria, pero es aconsejable para que, cuando muestre los resultados filtrados, en el desplegable aparezca seleccionada la opción que se envió, y no la primera opción u opción por defecto. Como consecuencia, en el *model* habrá que enviarle esa variable `generoSeleccionado`.

**Controlador**:

```java
@GetMapping("/findByGenero/{genero}")
    public String showFindByGen(@PathVariable Genero genero, Model model) {
        model.addAttribute("listaEmpleados", empleadoService.buscarPorGenero(genero));
        model.addAttribute("findForm", new Empleado());
        model.addAttribute("generoSeleccionado", genero);
        return "listView";
    }
```

**Servicio**:

```java
 public List<Empleado> buscarPorGenero(Genero genero) {
        List<Empleado> encontrados = new ArrayList<>();
        for (Empleado empleado : repositorio)
            if (empleado.getGenero() == genero)
                encontrados.add(empleado);
        return encontrados;
    }
```

Estos dos filtros son independientes, no se suman los filtros por defecto, o se aplica uno u otro. Habría que programar su funcionalidad conjunta.

> **ACTIVIDAD 3:** Reprograma los filtros que tenías (por nombre, por nacionalidad, por género para las piezas) para adaptarse al formato establecido.