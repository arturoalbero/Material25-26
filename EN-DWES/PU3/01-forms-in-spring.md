# 3.1 - Forms in Spring

> **NOTE**: Throughout the activities in this programming unit, in addition to exercises to practice concepts, there will be exercises in which you will modify the previous practice (*My Favourite Composer*) to add the functionalities we work on. This way, when you reach the graded practice, you will have **almost everything completed**.

## Form Development

Spring, together with Thymeleaf, allows very simple form management. The way it works is by associating the HTML form with an object called *commandObject*, which will mirror the fields of that form — that is, it will be a class with one attribute for each field.

This object can be an entity from our model (for example, a Product, Client, etc.) or a class created specifically for this purpose. Form management is done in three steps:

1. Create a controller that invokes, via @GetMapping, the page containing the form, passing it the *commandObject* that will hold the form fields.

```java
@GetMapping("/myForm")
public String showForm(Model model){
    model.addAttribute("formInfo", new FormInfo());
    return "formView";
}
```

In this case, our *commandObject* is an instance of a class we have created *ad hoc* for the form, and it is not part of our model:

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

2. In the HTML page containing the form, we associate that object via *th:object*. We also associate each field one by one using the *th:field* attribute. The submit action of this form will be sent to the controller’s @PostMapping specified by *th:action*, where the form will be processed.

```html
<form action = "#" method="post" th:action="@{/myForm/submit}" th:object="${formInfo}">
    <input type="text" id="nombre" th:field="*{nombre}" />
    <input type="text" id="edad" th:field="*{edad}" />
    <input type="submit" value="Enviar" />
</form>
```

In the second line, we see the controller to which the form will be redirected when submitted, and in the third line, the name of the object that will contain the values entered by the user. Then, for each form field, we indicate the attribute of the *commandObject* it corresponds to. In this case, `*{nombre}` and `*{edad}` are attributes of the class that *formInfo* represents. If the HTML tag of the element includes the *name* attribute, *th:field* is not required.

> We see a new way to indicate Thymeleaf values: using `*{}`. It is used to identify form fields.

3. In the @PostMapping of the same controller, we collect the data from the object, process it, and redirect the user to another view or redirect.

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo){
    //process received data
    return "view"; //view or redirect to where the response should go
}
```

If we need to pass the received data to the view, we can do so in two ways: via the *Model* parameter and the *model.addAttribute()* method, or by adding the `@ModelAttribute` annotation to the parameter representing the form object; this annotation directly injects the object into the view’s data model:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(FormInfo formInfo, Model model){
    //process received data
    model.addAttribute("formInfo", formInfo);
    return "view"; //view or redirect to where the response should go
}
```

or:

```java
@PostMapping("/myForm/submit")
public String showMyFormSubmit(@ModelAttribute FormInfo formInfo){
    //process received data
    return "view"; //view or redirect to where the response should go
}
```

As shown in the examples, the view will return to the server, in the @PostMapping, the object named *formInfo*, and with that name, we will handle it in the controller method. If we wanted to rename it upon arrival, we could specify it in the method signature using `@ModelAttribute("formInfo") FormInfo formData`.

The `@ModelAttribute` annotation can also be used at the method level, serving to add global elements to the Models of all controller requests.

```java
@ModelAttribute
public void methodName(Model model){
    model.addAttribute("msg", "Hello World");
}
```

In this example, regardless of the controller request, all Models passed to the views will have the attribute `msg` with the value `Hello World`.

Normally, the data received from the form is processed by the service layer, which we will see in the next programming unit.

> **ACTIVITY**
> Create a project from scratch that contains a form with two text fields where the user will enter two integers. In the controller, perform the addition and return the result to a new view.

## Form Fields

Up to now, we have only used text fields for data entry in the form, linking them to the *commandObject*. We can use other types of input fields as well.

### Text Box

```html
<label>Name:<input type="text" th:field="*{nombre}" /></label>
```

Here, `*{nombre}` is an attribute of the associated object. It is typically of type String, although it can take other types such as numeric or date. For dates, it is advisable to add the following annotation to the attribute in the object to specify the format and avoid errors:

```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
private LocalDate birthDate;
```

When we use Thymeleaf tags (th), HTML default values (*value*) in text boxes do not work properly. In such cases, one option is to remove *th:field* and add the HTML *name* attribute, which assumes the function of *th:field*, for example:

```html
<input type="text" name="nombre" value="default value" />
```

### Checkbox

```html
<label>I Accept:<input type="checkbox" th:field="*{accept}"></label>
```

Here, `*{accept}` is a boolean attribute of the *commandObject*. It will take the value *true* or *false* depending on whether the box is checked.

### RadioButton

```html
<label><input type="radio" name="button1" value="1" th:field="*{maritalStatus}">Single</label>
<label><input type="radio" name="button1" value="2" th:field="*{maritalStatus}">Married</label> 
<label><input type="radio" name="button1" value="3" th:field="*{maritalStatus}">Other</label>
```

Here, `*{maritalStatus}` is an attribute of the *commandObject*, of type String, Long, etc., that will take the value indicated in the *value* attribute of the HTML tag. In most cases, the different values of the radio buttons will come from the server, for example, from an enumeration or a collection.

Suppose the following `enum` in the file `com.example.demo.Genero.java`:

```java
public enum Gender {MALE, FEMALE, OTHER};
```

This would be the structure to apply in the form to dynamically generate a radio button for each element of the enumeration:

```html
<div th:each="gender : ${T(com.example.demo.Gender).values()}">
    <input type="radio" name="button1" th:value="${gender}" th:text="${gender}" th:field="*{personGender}" />
</div>
```

Here, `*{personGender}` is an attribute of the *commandObject* of the enumeration type, which will take the value of the selected enumeration element.

> Note the particularity in the enumeration syntax in the view: it must include its package name and be preceded by the Thymeleaf operator `T`.

If it were a list included in the *Model* instead of an enumeration, we would only change the first line to `<div th:each = "elem: ${myList}">`.

## Dropdown Lists

```html
<select size="3" th:field="*{course}">
    <option value="1">First</option>
    <option value="2">Second</option>
    <option value="3">Company Internship</option>
</select>
```

Here, `*{course}` is an attribute of the *commandObject* of type String, Long, etc. It will take the value indicated in the HTML tag’s *value* attribute. A *size* greater than one determines whether it is a dropdown or a displayed list. As with radio buttons, it can be filled with dynamic values from the server.

```html
<select th:field="*{birthProvince}">
    <option value="0">Select an option</option><!--default option -->
    <option th:each="prov:${provinceList}" th:value="${prov.id}" th:text="${prov.name}"></option>
</select>
```

We can also use enumerations, returning to the previous gender example:

```html
<select th:field="*{personGender}">
    <option value="">Select a value</option> <!--optional-->
    <option th:each="gender : ${T(com.example.demo.Gender).values()}" th:value="${gender}" th:text="${gender}"></option>
</select>
```

> Similarly to what was mentioned in the case of text boxes, when we use Thymeleaf tags, HTML default values in lists (the `selected` attribute in the `option`) do not work properly. In these cases, one option is to remove *th:field* and add the HTML attribute *name*, which assumes the role of *th:field*:
>
> ```html
> <select name="course">
>    <option value="1" selected>First</option>
>    <option value="2">Second</option>
>    <option value="3">Company Internship</option>
> </select>
> ```

---

> **ACTIVITY:**
> Create a **form to add new composers**. (We will validate the dates later.)
>
> * In the composer, distinguish between real name (*name*) and stage name. We will use the stage name as the key. *Franz Liszt* is the real name, but *Liszt* is the stage name. *Johannes Chrysostomus Wolfgangus Theophilus Mozart* is the real name, but *Wolfgang Amadeus Mozart* is the stage name. If no stage or real name is specified, assume both values are the same and act accordingly (copying the value).
>
> Therefore, use the `Composer` class as the *commandObject*. Store the new composer in the `.csv`.

> **ACTIVITY:**
> Create a form that allows you to enter a musical piece and assign it a composer, based on the practice from the previous unit.
>
> * Therefore, use the `MusicalPiece` class as the *commandObject*, or a specific class that, in addition to the musical piece, includes the composer.
> * The composer to select must have been previously entered.
> * The composer to select should appear in a dropdown list.
> * The instrumentation should be created using an enumerator with the categories PIANO, SOLO, CHAMBER, ORCHESTRA, VOCAL, STAGE, OTHER.
>
>   * SOLO pieces are for a single instrument other than piano.
>   * A chamber piece involves several performers but is not orchestral.
>   * “Vocal” pieces include those for voices only (choral or not), and “Stage Piece” refers to operatic works (voice and orchestra).
> * Store the new musical piece in the `.csv`.
> * For each musical piece, add a list of alternative names. For example, Beethoven’s *Piano Sonata No. 14 in C-sharp minor, Op. 27 No. 2 Quasi una fantasia* is also known as *Sonata No. 14 in C-sharp minor*, *Clair de lune*, or *Moonlight Sonata*.

> **ACTIVITY:**
> Add **forms to EDIT** existing composers and/or pieces. Keep in mind that it should allow reassigning pieces to other composers (but not duplicating them). Modify the `.csv` files accordingly.

> **ACTIVITY:**
> Verify that, with the forms we have created, the “My Favourite Composers” webpage works correctly as specified in the previous programming unit’s practice statement.
