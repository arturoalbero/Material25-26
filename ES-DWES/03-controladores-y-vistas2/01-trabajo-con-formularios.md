# 3.1 - Formularios en Spring

> **NOTA**: A lo largo de las actividades de esta unidad de programación, aparte de ejercicios para practicar conceptos, habrá ejercicios en los cuales modificarás la práctica anterior (My Favourite Composer) para añadirle las funcionalidades que vayamos trabajando. De esta forma, cuando llegues a la práctica evaluable lo tendrás **prácticamente todo completado**.

## Desarrollo de Formularios

Spring, junto con Thymeleaf, permite una gestión muy sencilla de los formularios. La forma de trabajar es asociando el formulario HTML un objeto llamado *commandObject* que será un reflejo de los campos de dicho formulario, es decir, será una clase que tendrá un atributo por cada campo.

Este objeto puede ser una entidad de nuestro modelo, es decir, corresponderse con un Productoo, Cliente, etc. o ser una clase creada expresamente para esta función. La gestión del formulario se hace en tres pasos:
1) Crear un controlador que invoca mediante @GetMapping a la página que contiene el formulario, pasándole el objeto *commandObject* que contendrá los campos del formulario.

```java
@GetMapping("/myForm")
public String showForm(Model model){
    model.addAttribute("formInfo", new FormInfo());
    return "formView";
}
```

En este caso, nuestro *commandObject* es una instancia de una clase que hemos creado *ex profeso* para el formulario, y no forma parte de nuestro modelo:

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

2) A la página HTML que tiene el formulario le asociamos ese objeto mediante th:object. También haremos uno a uno la asociación de los campos mediante el atributo th:field. El submit de este formulario se enviará al @PostMapping del controlador indicado mediante th:action, donde se procesará el formulario.

```html
<form action = "#" method="post" th:action="@{/myForm/submit}" th:object="${formInfo}">
    <input type="text" id="nombre" th:field="*{nombre}" />
    <input type="text" id="edad" th:field="*{edad}" />
    <input type="submit" value="Enviar" />
</form>
```

En la segunda línea vemos el controlador al que se redirigirá cuando se envíe el formulario y en la tercera línea el nombre del objeto que contendrá los valores introducidos por el usuario. Luego, para cada campo de formulario le indicamos el atributo del objeto *commandObject* con el que se corresponde. En este caso, `*{nombre}` y `*{edad}` son atributos de la clase que sea *formInfo*. Si la etiqueta HTML del elemento incluye el atributo *name* no sería obligatorio el *th:field*.

> Observamos una nueva forma de indicar valores de Thymeleaf: Mediante `*{}`. Se usa para identificar campos de un formulario.

3) En el @PostMapping del mismo controlador, recogeremos los datos del objeto, los procesamos y los redirigimos al usuario a otra vista o redirect.

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo){
    //tratamiento de los datos recibidos
    return "vista"; //vista o redirect a donde dirigir la respuesta
}
```

Si necesitamos pasar los datos recibidos a la vista a mostrar, podemos hacerlo de dos formas, mediante el parámetro *Model* y el método *model.addAttribute()* o bien añadiendo la anotación `@ModelAttribute` al parámetro que representa el objeto del formulario; esta anotación inyecta directamente el objeto en el modelo de datos de la vista:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo, Model model){
    //tratamiento de los datos recibidos
    model.addAttribute("formInfo", formInfo);
    return "vista"; //vista o redirect a donde dirigir la respuesta
}
```

ó:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(@ModelAttribute FormInfo formInfo){
    //tratamiento de los datos recibidos
    return "vista"; //vista o redirect a donde dirigir la respuesta
}
```

Tal y como está en los ejemplos, la vista devolverá al servidor en el @PostMapping el objeto con nombre *formInfo* y, con este nombre, lo trataremos en el método del controlador. Si quisiésemos renombrarlo en la llegada, podríamos especificárselo en la firma del método usando `@ModelAttribute("formInfo") FormInfo datosFormulario`.

La anotación `@ModelAttribute` se puede usar también a nivel de método, sirviendo para añadir elementos globales a los Model de todas las peticiones del controlador.

```java
@ModelAttribute
public void nombreMetodo(Model model){
    model.addAttribute("msg", "Hola Mundo");
}
```

En este ejemplo, sea cual sea el *request* del controlador, todos los Model pasados a las vistas tendrán el atributo `msg` con el valor `Hola Mundo`.

Lo normal es que los datos recibidos por el formulario sean tratados por la capa de servicio, que veremos en la próxima unidad de programación.

> **ACTIVIDAD**
> Realiza un proyecto desde cero que contenga un formulario con dos campos de texto, en los que el usuario introducirá sendos números enteros. En el controlador, realizaremos la suma de los mismos y devolveremos el resultado a una nueva vista.

## Campos en formularios

Hasta este momento solo hemos utilizado campos de texto para la entrada de datos en el formulario, para su vinculación con el *commandObject*. Podemos emplear otros tipos de entrada de formularios.

### Caja de texto

```html
<label>Nombre:<input type="text" th:field="*{nombre}" /></label>
```
Siendo `*{nombre}` un atributo del objeto asociado. En principio de tipo String, aunque puede tomar otros valores como, por ejemplo, numéricos o fechas. En el caso de estas últimas, es aconsejable añadile al atributo en el objeto la siguiente anotación para especificar el formato y evitar errores:

```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
private LocalDate fechaNacimiento;
```

Cuando incorporamos etiquetas Thymeleaf (th), no funcionan bien los valores por defecto HTML en las cajas de texto (etiqueta *value*) por lo que, para estos casos, una opción es eliminar th:field y añadir el atributo HTML *name*, asumiendo este la función de th:field, como ocurre por ejemplo en:

```html
<input type="text" name="nombre" value="valor por defecto" />
```

### Checkbox

```html
<label>Acepto:<input type="checkbox" th:field="*{acepto}"></label>
```

Siendo `*{acepto}` un atributo del *commandObject*, de tipo boolean. Tomará valores true o false dependiendo de si se marca o no el check.

### RadioButton

```html
<label><input type="radio" name="button1" value="1" th:field="*{estadoCivil}">Soltero</label>
<label><input type="radio" name="button1" value="2" th:field="*{estadoCivil}">Casado</label> 
<label><input type="radio" name="button1" value="3" th:field="*{estadoCivil}">Otro</label>
```

Siendo `*{estadoCivil}` un atributo del *commandObject*, de tipo String, Long, etc. que tomará el valor indicado en el atributo *value* de la etiqueta HTML. En la mayor parte de casos, los distintos valores de los botones de opción provendrán del servidor, por ejemplo, de una enumeración o de una colección.

Supongamos el siguiente `enum` en el archivo `com.example.demo.Genero.java`:

```java
public enum Genero {MASCULINO, FEMENINO, OTROS};
```

Esta sería la estructura a aplicar en el formulario para generar dinámicamente un botón de radio para cada uno de los elementos de la enumeración:

```html
<div th:each="genero : ${T(com.example.demo.Genero).values()}">
    <input type="radio" name="button1" th:value="${genero}" th:text="${genero}" th:field="*{generoPersona}" />
</div>
```

Siendo `*{generoPersona}` un atributo del *commandObject* de tipo de la enumeración que tomará como valor el elemento de la enumeración seleccionado. 

> Hay que destacar particularidad en la sintaxis de la enumeración en la vista, ya que debe incluir el nombre de su paquete y precederse del operador Thymeleaf `T`.

En caso de ser una lista incluida en el *Model* y no una enumeración, cambiaríamos solo la primera línea `<div th:each = "elem: ${myList}">`.

## Listas desplegadas dropdown

```html
<select size="3" th:field="*{curso}">
    <option value="1">Primero</option>
    <option value="2">Segundo</option>
    <option value="3">Prácticas de empresa</option>
</select>
```

Siendo `*{curso}` un atributo del *commandObject* de tipo String, Long, etc. Tomará el valor indicado en el atributo *value* de la etiqueta HTML. El atributo *size* mayor que uno determina que sea una lista desplegable o desplegada. Como en el caso de los botones de radio podemos llenarla con valores dinámicos tomados del servidor.

```html
<select th:field="*{provinciaNacimiento}">
    <option value="0">Selecciona una opción</option><!--opción por defecto -->
    <option th:each="provin:${listaProvincias}" th:value="${provin.id}" th:text="${provin.nombre}"></option>
</select>
```

También podemos hacerlo con enumeradores, retomando el ejemplo anterior del género:
```html
<select th:field="*{generoPersona}">
    <option value="">Seleccione un valor</option> <!--opcional-->
    <option th:each="genero : ${T(com.example.demo.Genero).values()}" th:value="${genero}" th:text="${genero}"></option>
</select>
```

> Análogamente a lo comentado en el caso de las cajas de texto, cuando incorporamos etiquetas Thymeleaf, no funcionan bien los valores por defecto HTML en las listas (etiqueta `selected` en el `option`) por lo que, para estos casos, una opción es eliminar *th:field* y añadir el atribtuto HTML *name*, asumiendo éste la función de *th:field*:
> ```html
> <select name="curso">
>    <option value="1" selected>Primero</option>
>    <option value="2">Segundo</option>
>    <option value="3">Prácticas de empresa</option>
> </select>
> ```

----

> **ACTIVIDAD:**
> Crea un **formulario para añadir nuevos compositores**. (Más adelante validaremos las fechas)
>    * En el compositor, diferencia entre nombre real (nombre) y nombre artístico. Usaremos el nombre artístico como clave. *Franz Liszt* es el nombre real, pero *Liszt* el artístico. *Johannes Chrysostomus Wolfgangus Theophilus Mozart* es el nombre real, pero *Wolfgang Amadeus Mozart* el artístico. Si no se especifica un nombre artístico o real, se asume que los dos valores coinciden y se actúa en consecuencia (copiando el valor).
>
> Emplea, por lo tanto, la clase `Compositor` como *commandObject*. Almacena el nuevo compositor en el `.csv`.

> **ACTIVIDAD:**
> Crea un formulario que te permita introducir una pieza musical, asignándole un compositor, basándote en la práctica de la unidad anterior.
>
> * Emplea, por lo tanto, la clase `Pieza Musical` como *commandObject*, o bien una clase específica que, además de la pieza musical, incluya al compositor.
> * El compositor a seleccionar debe haber sido introducido previamente.
> * El compositor a seleccionar debe aparecer en una lista desplegada (dropdown).
> * La instrumentación se debe crear mediante un enumerador con las categorías PIANO, SOLO, CÁMARA, ORQUESTA, VOCAL, ESCENA, OTRO. 
>   * Las piezas de tipo SOLO son por un instrumento solo que no sea piano.
>   * Una pieza de cámara es aquella que involucra a varios instrumentistas, pero no llega a ser de orquesta. 
>   * Llamamos "Vocal" a las piezas con solo voces (corales o no) y "Pieza de Escena" a las piezas de tipo operístico (voz y orquesta). 
> * Almacena la nueva pieza musical en el `.csv`.
> * En cada pieza musical, añade una lista de nombres alternativos. Por ejemplo, la *sonata para piano nº 14 en do sostenido menor, Op. 27 nº2 Quasi a fantasia* de Beethoven se conoce también como *Sonata nº 14 en do sostenido menor* o *Claro de luna* o *Moonlight Sonata*. 

> **ACTIVIDAD:**
> Comprueba que, con los formularios que hemos creado, la página web de "Mis compositores favoritos" funciona correctamente tal y como se especificaba en el enunciado de la práctica de la unidad de programación anterior.




