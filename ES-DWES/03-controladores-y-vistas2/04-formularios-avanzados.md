# 3.4 - Formularios de edición y validación de formularios

## 1. Formularios de edición

Si queremos que nuestro formulario tenga los campos ya asignados, para así poder editarlos y realizar actualización en los datos, debemos pasarle el *commandObject* con datos ya introducidos.

Si teníamos esta clase:

```java
public class FormInfo{
    private String nombre;
    private Integer edad;

    public String getNombre(){return nombre;}
    public Integer getEdad(){return edad;}
    public void setNombre(String nombre){this.nombre = nombre;}
    public void setEdad(Integer edad){this.edad = edad;}
}
```
Y le pasamos un objeto con datos ya introducidos, los campos se rellenarán en la vista si no se encuentran vacíos:

```java
@GetMapping("/myForm")
public String showForm(Model model){
    FormInfo myFormInfo = new FormInfo();
    myFormInfo.setNombre("Juanito Pérez");
    model.addAttribute("formInfo", myFormInfo);
    return "formView";
}
```
Ten en cuenta que solo funciona si los campos están rellenados con `th:field="*{atributo}"`, no vale con `name="atributo"`.

Además de esto, asegúrate de tener las **fechas bien especificadas** con la anotación `@DateTimeFormat(pattern = "yyyy-MM-dd")` o el formulario no las interpretará bien y saldrán vacías.

>**¿SABÍAS QUE...?** 
>La anotación `@DateTimeFormat()` es el mecanismo que usa Spring para delegar el análisis y formato de las fechas. De manera interna, emplea el modo habitual de Java, usando clases como `java.time.DateTimeFormatter` o `java.text.SimpleDateFormat`. De esta forma, la gestión del formato de las fechas se vuelve transparente para el desarrollador.

Otra problemática habitual es la **aparición de duplicados** del original en los datos. Para remediarlo, tienes que gestionar lo siguiente al editar un formulario:
* Que se edite el elemento deseado.
* Que no aparezcan duplicados (el elemento original y el elemento deseado).
* Que si se cancela la edición, no desaparezca el original.

Lo que debes hacer es guardar información que te permita reconocer al original para luego suplantarlo. Puedes usar un `id` o mandar el nombre del original al controlador `post` del formulario de alguna forma. Asegúrate de borrar el original justo antes de añadir al editado.

En el **GET** enviamos el objeto a editar y una referencia al objeto original, en este caso, dentro de la variable Thymeleaf `${mode}`(el nombre es indiferente). Le pasamos un String compuesto para poder reutilizar fácilmente el FormView que hicimos para añadir nuevos elementos:

```java
@GetMapping("/editForm/{name}")
    public String editForm(Model model, @PathVariable String name){
        FormInfo myFormInfo = listofdata.stream().filter(i->i.getName().equals(name)).findFirst().orElse(null); //encontramos el elemento que se corresponde con el String item.
        model.addAttribute("formInfo", myFormInfo);
        model.addAttribute("mode", "/edit/" + name);
        return "FormView";
    }
```

En la **VISTA**. En este caso, usamos la construcción dinámica de URL a través de la concatenación de cadenas con variables de Thymeleaf, para enviarle el nombre del original como `@PathVariable`. En general, es más recomendado usar variablescomo `th:action="@{/form/submit/{mode}(mode=${mode})}"`:

```html
<form action = "#" method="post" th:action="@{'/form/submit' + ${mode}}" th:object="${formInfo}">
        <label>Name: <input type="text" id="name" name="name" th:field="*{name}"></label><br><br>
        <label>Age: <input type="text" id="age" name="age" th:field="*{age}"></label><br><br>
        <input type="submit" value="SUBMIT" />
    </form>
```
En el POST, creamos un post específico para los casos de edición, basado en el de POST de añadir:

```java
@PostMapping("/form/submit/edit/{original}")
    public String formSubmit(Model model, FormInfo myForm, @PathVariable String original){
        listaofdata.removeIf(d->d.getName().equals(original));
        listofdata.add(myForm);
        model.addAttribute("data", listofdata);
        return "listDataView";
    }

```
>**CONSEJO:** El método de las listas `removeIf(PREDICADO)` es un método que, a través de la programación funcional, borra todos los elementos de la lista en los cuales se cumpla el predicado que enviamos como argumento.

> **ACTIVIDAD:**
> En **My Favourite Composer**, añade sendos **formularios para EDITAR** compositores y/o piezas ya existentes. Ten en cuenta que permitiría reasignar piezas a otros compositores (pero no duplicarlas). Modifica adecuadamente los `.csv`. Asegúrate de manejar bien los nulos en la conversión a `.csv` y desde el `.csv`.

>**RECUERDA:** Para editar un objeto mediante un formulario y evitar duplicados, tienes que tener alguna forma de poder separar el objeto original del modificado para que, una vez tengas el objeto modificado preparado, puedas reemplazar completamente el original.
> - Pásale el identificador del original, ya sea a través de un campo oculto con el id `<input type="hidden" id="agide" name="id" th:field="*{id}" value="25" />` o a través de una clave primaria en la construcción del URL que te llevará al método `post`, como hemos hecho en el ejemplo.
> - Si construyes un campo id, asegúrate de que se asigne en el constructor y de que sea único. Puedes usar un objeto estático privado para contar los elementos, un [código HASH](https://www.signaturit.com/es/blog/que-es-un-hash/) o cualquier otra cosa que consideres.
>
>```java
>public class FormInfo{
>    private static int contador_id = 0;
>    private String nombre;
>    private Integer edad;
>    private Integer id;
>
>    public FormInfo(){
>        this.id = contador_id;
>        contador_id += 1;
>    }
>}
>```

## 2. Validación de formularios

Spring nos ofrece un objeto llamado *BindingResult* que, combinado con la anotación @Valid permite validar de forma automática que los valores enviados desde el formulario coinciden con los tipos de datos definidos en el objeto asociado al formulario (al que llamamos *commandObject*).

También ofrece anotaciones que podemos incorporar en la clase *commandObject* para limitar más los valores permitidos en sus atributos. En este caso las usaremos para validar los datos enviados en el formulario, pero podríamos emplearlos en cualquier clase de Java.

Estas anotaciones las proporciona Hibernate y preceden a cada atributo. Las más usadas son:

* `@NotNull`: El atributo no puede ser nulo.
* `@Min(n)`, `@Max(n)`: Especifica un valor mínimo / máximo para el atributo.
* `@NotEmpty`: No puede estar vacío (solo para String, Colecciones, Arrays...).
* `@Email`: Debe tener el formato de un email válido.
* `@Size(min = n, max = m)`: Debe tener un tamaño que cumpla los requisitos (mínimo n, máximo m).
* `@Past`: Indica una fecha en el pasaddo. También existen `@PastOrPresent` y `@Future`.
* `@AssertTrue`: Determina que el valor debe ser siempre cierto. Útil para checkbox que deben estar marcados obligatoriamente.

```java
public class FormInfo{
    @NotNull @Min(0)
    private Long id;

    @NotEmpty
    private String nombre;

    @Email
    private String email;

    @Past
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaDeNacimiento;

    private double salario;

}
```

Si no se encuentran los imports, que serían de la librería `jakarta.validation.constraints`, es porque en el pom.xml falta la dependencia:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```
Recuerda añadirla al `pom.xml`. Es posible que tengas que cerrar y volver a abrir el editor si la recarga del proyecto no funciona al guardar.

### 2.1 Validar el formulario paso a paso

Para validar el formulario paso a paso, debemos seguir las siguientes indicaciones:

1) Añadimos `@Valid` al objeto que recibe los datos del formulario (con o sin `@ModelAttribute`):
```java
@PostMapping("myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, Model model){}
```
2) Añadimos un nuevo parámetro al método, de tipo `BindingResult`, que nos valdrá para validar el formulario. **Este parámetro debe ir justo después del *commandObject* que lleva `@Valid`, si no, no funcionará correctamente**.
```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, BindingResult bindingResult, Model model){}
```
3) Añadimos la validación en sí, mediante el método `hasErrors()` de `BindingResult`:
```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, BindingResult bindingResult, Model model){
    if(bindingResult.hasErrors()) return "errorView";
    model.addAttribute("datosProcesados",formInfo.toString());
    return "formularioProcesadoView";
}
```

Si no añadimos ninguna anotación en la clase de *commandObject*, el *bindingResult* solo validará que los valores introducidos se correspondan con los tipos de la clase, es decir, si es un campo de fecha, que sea una fecha válida, si es un número entero, que no contenga letras ni decimales, etc.

Hay dos aspectos a tener en cuenta:
- Si a un atributo lo antoamos con `@Min(3)` o similares, no se produce error de validación si no se le asigna ningún valor. Para ello, hay que añadirle también `@NotNull`.
- Si en un formulario, cuando el usuario deja una caja de texto sin cubrir, queremos que *bindingResult* produzca error, debemos incluir `@NotEmpty` en lugar de `@NotNull`.

4) En la plantilla del formulario, podemos añadir código Thymeleaf para informar de los errores encontrados. El modificador `th:classappend` evalúa una expresión y, en caso de que se cumpla, añade una clase CSS a la etiqueta. Si la combinamos con #fields.hasErrors sobre un atributo *commandObject* conseguimos que, si hay un error, se cambie la apariencia de esa etiqueta HTML.

Para poder visualizarlo, en caso de error, obviamente hay que volver a mostrar la vista con los datos introducidos. Añadiremos `@ModelAttribute` a continuación de `@Valid` (`@Valid @ModelAttribute ("nombre del modelo")`) para incluir datos de *FormInfo* y, desde el controlador, llamaremos a la vista de nuevo:

```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid @ModelAttribute ("formInfo") FormInfo formInfo, BindingResult bindingResult, Model model){
    if(bindingResult.hasErrors()) return "formView";
    model.addAttribute("datosProcesados",formInfo.toString());
    return "formularioProcesadoView";
}
```

Para verlo todo más claro, vamos a ver un ejemplo en el que verificamos que el email introducido cumple el requisito de formato de email que establecemos en la clase FormInfo, que es el *commandObject* de este formulario. Si no lo cumple, aplicará al elemento el estilo *css* que le indiquemos, en este caso *cssError*.
```html
<div th:classappend="${#fields.hasErrors('email')} ? 'cssError'">
    <label>Email:<input type="text" id="email" th:field="*{email}"/></label>
</div>
```

Para que este ejemplo funcione, tendremos que definir en un archivo aparte o en el *head* el estilo cssError (o emplear un estilo de errores externo, por ejemplo, `has-errors` de BootStrap):
```html
<style> .cssError{background-color:red;}</style>
```

También podemos añadir un mensaje de error con el atributo Thymeleaf `th:errors`. Este mensaje se define en la clase, con la anotación de validación.
```java
@Email(message = "Debe tener formato email válido")
private String email;
```

En el formulario, además del código anterior para el formato, añadiríamos un `<span>` para que mostrase el mensaje:

```html
<div th:classappend="${#fields.hasErrors('email')} ? 'cssError'">
    <label>Email:<input type="text" id="email" th:field="*{email}"/></label>
    <span th:if="${#fields.hasErrors('email')}" th:errors="*{email}" class="cssError">*</span>
</div>
```
Podríamos repetir este proceso para todos los campos del formulario. Hay que señalar que estos textos de error escritos en la clase también podrían leerse desde fichero.

> **ACTIVIDAD**: Implementa la **validación de formularios** en los formularios de añadir y editar piezas musicales y compositores. Valida que las fechas sean fechas correctas, que los nombres no estén vacíos (salvo aquellos que puedan estarlo) y que los datos incluidos estén dentro de lo aceptado. Añade también mensajes de error y clases css de error. Modifica las clases del model con las anotaciones pertinentes.

