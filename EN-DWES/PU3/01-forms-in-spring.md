# Forms in Spring

## Form Development

Spring, together with Thymeleaf, allows very simple management of forms. The way it works is by associating the HTML form with an object called *commandObject*, which reflects the fields of that form—that is, it’s a class with one attribute per field.

This object can be an entity from our model (e.g., Product, Client, etc.) or a class created specifically for this purpose. The form management process happens in three steps:

1. Create a controller that invokes, via @GetMapping, the page containing the form, passing it the *commandObject* that will contain the form fields.

```java
@GetMapping("/myForm")
public String showForm(Model model){
    model.addAttribute("formInfo", new FormInfo());
    return "formView";
}
```

In this case, our *commandObject* is an instance of a class we created *ad hoc* for the form and is not part of our model:

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

2. In the HTML page containing the form, we associate that object using `th:object`. We also associate each field using the attribute `th:field`. The form’s submit will be sent to the controller’s @PostMapping indicated by `th:action`, where the form will be processed.

```html
<form action = "#" method="post" th:action="@{/myForm/submit}" th:object="${formInfo}">
    <input type="text" id="nombre" th:field="*{nombre}" />
    <input type="text" id="edad" th:field="*{edad}" />
    <input type="submit" value="Send" />
</form>
```

In the second line we see the controller to which the form will be redirected when submitted, and in the third line the name of the object that will contain the user-input values. Then, for each form field, we indicate the corresponding attribute of the *commandObject*. In this case, `*{nombre}` and `*{edad}` are attributes of the class *formInfo*. If the HTML tag includes the *name* attribute, `th:field` is not mandatory.

> We can observe a new way to indicate Thymeleaf values: using `*{}`. It’s used to identify form fields.

3. In the same controller’s @PostMapping, we collect the object’s data, process it, and redirect the user to another view or redirect.

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo){
    //process received data
    return "view"; //view or redirect to send the response
}
```

If we need to pass the received data to the view, we can do so in two ways: using the *Model* parameter and the *model.addAttribute()* method, or by adding the `@ModelAttribute` annotation to the parameter representing the form object; this annotation directly injects the object into the view’s data model:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo, Model model){
    //process received data
    model.addAttribute("formInfo", formInfo);
    return "view"; //view or redirect to send the response
}
```

or:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(@ModelAttribute FormInfo formInfo){
    //process received data
    return "view"; //view or redirect to send the response
}
```

As shown in the examples, the view will return to the server, in the @PostMapping, the object named *formInfo*, and with that name, we’ll handle it in the controller method. If we wanted to rename it on arrival, we could specify it in the method signature using `@ModelAttribute("formInfo") FormInfo formData`.

The `@ModelAttribute` annotation can also be used at the method level to add global elements to all Models of the controller’s requests.

```java
@ModelAttribute
public void methodName(Model model){
    model.addAttribute("msg", "Hello World");
}
```

In this example, regardless of the controller’s *request*, all Models passed to views will have the `msg` attribute with the value `Hello World`.

Normally, the data received from the form is handled by the service layer, which will be covered in the next programming unit.

> **ACTIVITY**
> Create a project from scratch containing a form with two text fields, where the user enters two integers. In the controller, sum them and return the result to a new view.

## Form Fields

So far, we’ve only used text fields for data input in the form, linked to the *commandObject*. We can use other types of form inputs.

### Text Box

```html
<label>Name:<input type="text" th:field="*{nombre}" /></label>
```

Where `*{nombre}` is an attribute of the associated object. Usually of type String, though it can take other types such as numeric or date values. For the latter, it’s advisable to add the following annotation to the object’s attribute to specify the format and avoid errors:

```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
private LocalDate fechaNacimiento;
```

When using Thymeleaf tags (`th`), default HTML values in text boxes (the *value* attribute) don’t work properly. In those cases, one option is to remove `th:field` and add the HTML *name* attribute instead, which will act as `th:field`, for example:

```html
<input type="text" name="nombre" value="default value" />
```

### Checkbox

```html
<label>I agree:<input type="checkbox" th:field="*{acepto}"></label>
```

Where `*{acepto}` is a *commandObject* attribute of type boolean. It will take the value true or false depending on whether the checkbox is checked.

### Radio Button

```html
<label><input type="radio" name="button1" value="1" th:field="*{estadoCivil}">Single</label>
<label><input type="radio" name="button1" value="2" th:field="*{estadoCivil}">Married</label> 
<label><input type="radio" name="button1" value="3" th:field="*{estadoCivil}">Other</label>
```

Where `*{estadoCivil}` is a *commandObject* attribute of type String, Long, etc., that will take the value indicated in the HTML tag’s *value* attribute. In most cases, the different radio button values will come from the server, for example, from an enumeration or a collection.

Let’s assume the following `enum` in the file `com.example.demo.Genero.java`:

```java
public enum Genero {MASCULINO, FEMENINO, OTROS};
```

This would be the structure used in the form to dynamically generate a radio button for each element in the enumeration:

```html
<div th:each="genero : ${T(com.example.demo.Genero).values()}">
    <input type="radio" name="button1" th:value="${genero}" th:text="${genero}" th:field="*{generoPersona}" />
</div>
```

Where `*{generoPersona}` is a *commandObject* attribute of the enumeration type that will take as its value the selected enumeration element.

> Note the particular syntax for the enumeration in the view, which must include its package name and be preceded by the Thymeleaf operator `T`.

If it were a list included in the *Model* instead of an enumeration, we would only change the first line to `<div th:each = "elem: ${myList}">`.

## Dropdown Lists

```html
<select size="3" th:field="*{curso}">
    <option value="1">First</option>
    <option value="2">Second</option>
    <option value="3">Internship</option>
</select>
```

Where `*{curso}` is a *commandObject* attribute of type String, Long, etc. It will take the value indicated in the HTML tag’s *value* attribute. A *size* greater than one determines whether it’s a dropdown or an expanded list. As with radio buttons, it can be dynamically filled with values from the server.

```html
<select th:field="*{provinciaNacimiento}">
    <option value="0">Select an option</option><!--default option -->
    <option th:each="provin:${listaProvincias}" th:value="${provin.id}" th:text="${provin.nombre}"></option>
</select>
```

We can also do this with enumerations, using the previous gender example:

```html
<select th:field="*{generoPersona}">
    <option value="">Select a value</option> <!--optional-->
    <option th:each="genero : ${T(com.example.demo.Genero).values()}" th:value="${genero}" th:text="${genero}"></option>
</select>
```

> Similarly to what was mentioned in the text box case, when using Thymeleaf tags, default HTML values in lists (the `selected` attribute in `option`) don’t work properly. In those cases, one option is to remove *th:field* and add the HTML *name* attribute instead, assuming the role of *th:field*:
>
> ```html
> <select name="curso">
>    <option value="1" selected>First</option>
>    <option value="2">Second</option>
>    <option value="3">Internship</option>
> </select>
> ```

> **ACTIVITY:**
> Create a form that allows you to enter a composer, based on the practice from the previous unit.
>
> * Therefore, use the `Compositor` class as the *commandObject*.
> * Store the new composer in the `.csv` file.

> **ACTIVITY:**
> Create a form that allows you to enter a musical piece, assigning it a composer, based on the practice from the previous unit.
>
> * Therefore, use the `MusicalPiece` class as the *commandObject*, or a specific class that includes both the musical piece and the composer.
> * The composer to be selected must have been previously entered.
> * The composer to be selected must appear in a dropdown list.
> * The instrumentation should be created using an enumerator with the categories PIANO, SOLO, CHAMBER, ORCHESTRA, VOCAL, STAGE, OTHER.
>
>   * SOLO pieces are for a single instrument other than piano.
>   * A chamber piece involves several musicians but not a full orchestra.
>   * “Vocal” refers to pieces with only voices (choral or not), and “Stage Piece” refers to operatic works (voice and orchestra).
> * Store the new musical piece in the `.csv` file.

> **ACTIVITY:**
> Verify that, with the forms we’ve created, the “My Favorite Composers” website works correctly as specified in the statement from the previous programming unit.
