# 3.4 - Edit Forms and Form Validation

## 1. Edit Forms

If we want our form to have the fields already filled in, so we can edit them and update the data, we must pass it the *commandObject* with preloaded data.

If we had this class:

```java
public class FormInfo {
    private String name;
    private Integer age;

    public String getName() { return name; }
    public Integer getAge() { return age; }
    public void setName(String name) { this.name = name; }
    public void setAge(Integer age) { this.age = age; }
}
```

And we pass it an object with preloaded data, the fields will be filled in the view if they are not empty:

```java
@GetMapping("/myForm")
public String showForm(Model model) {
    FormInfo myFormInfo = new FormInfo();
    myFormInfo.setName("Juanito Pérez");
    model.addAttribute("formInfo", myFormInfo);
    return "formView";
}
```

Keep in mind that this only works if the fields are filled using `th:field="*{attribute}"`, not with `name="attribute"`.

In addition, make sure that the **dates are properly specified** using the annotation `@DateTimeFormat(pattern = "yyyy-MM-dd")`, otherwise the form will not interpret them correctly and they will appear empty.

> **DID YOU KNOW...?**
> The annotation `@DateTimeFormat()` is the mechanism Spring uses to delegate date parsing and formatting. Internally, it relies on Java’s standard system, using classes such as `java.time.DateTimeFormatter` or `java.text.SimpleDateFormat`. This way, date format management becomes transparent to the developer.

Another common issue is the **appearance of duplicates** of the original data. To fix this, you must handle the following when editing a form:

* That the correct element is being edited.
* That duplicates (the original and the modified one) do not appear.
* That if the editing is cancelled, the original does not disappear.

What you should do is store information that allows you to recognize the original so that you can replace it later. You can use an `id` or send the name of the original to the controller’s `post` method in some way. Make sure to delete the original just before adding the edited one.

In the **GET** method, we send the object to edit and a reference to the original object — in this case, inside the Thymeleaf variable `${mode}` (the name doesn’t matter). We pass a composite String so we can easily reuse the FormView we created to add new elements:

```java
@GetMapping("/editForm/{name}")
public String editForm(Model model, @PathVariable String name) {
    FormInfo myFormInfo = listofdata.stream().filter(i -> i.getName().equals(name)).findFirst().orElse(null);
    model.addAttribute("formInfo", myFormInfo);
    model.addAttribute("mode", "/edit/" + name);
    return "FormView";
}
```

In the **VIEW**, we use dynamic URL construction by concatenating strings with Thymeleaf variables, sending the original name as a `@PathVariable`. Generally, it is better to use variables like `th:action="@{/form/submit/{mode}(mode=${mode})}"`:

```html
<form action="#" method="post" th:action="@{'/form/submit' + ${mode}}" th:object="${formInfo}">
    <label>Name: <input type="text" id="name" name="name" th:field="*{name}"></label><br><br>
    <label>Age: <input type="text" id="age" name="age" th:field="*{age}"></label><br><br>
    <input type="submit" value="SUBMIT" />
</form>
```

In the POST, we create a specific handler for edit cases, based on the one for adding:

```java
@PostMapping("/form/submit/edit/{original}")
public String formSubmit(Model model, FormInfo myForm, @PathVariable String original) {
    listofdata.removeIf(d -> d.getName().equals(original));
    listofdata.add(myForm);
    model.addAttribute("data", listofdata);
    return "listDataView";
}
```

> **TIP:** The list method `removeIf(PREDICATE)` uses functional programming to delete all elements in the list that meet the given predicate.

> **ACTIVITY:**
> In **My Favourite Composer**, add **forms to EDIT** existing composers and/or musical pieces. Note that this should allow reassigning pieces to other composers (but not duplicating them). Modify the `.csv` files accordingly. Make sure to handle null values properly when converting to and from `.csv`.

> **REMEMBER:** To edit an object via a form and avoid duplicates, you must have a way to distinguish the original object from the modified one, so that once you have the modified object ready, you can completely replace the original.
>
> * Pass the original’s identifier, either through a hidden input field with the id `<input type="hidden" id="agide" name="id" th:field="*{id}" value="25" />`, or through a primary key in the URL path leading to the `post` method, as shown in the example.
> * If you create an `id` field, make sure it is assigned in the constructor and that it is unique. You can use a private static object to count the elements, a [HASH code](https://www.signaturit.com/es/blog/que-es-un-hash/), or any other method you prefer.

```java
public class FormInfo {
    private static int id_counter = 0;
    private String name;
    private Integer age;
    private Integer id;

    public FormInfo() {
        this.id = id_counter;
        id_counter += 1;
    }
}
```

## 2. Form Validation

Spring provides an object called *BindingResult* which, combined with the `@Valid` annotation, allows automatic validation of whether the values sent from the form match the data types defined in the object associated with the form (the *commandObject*).

It also provides annotations that we can include in the *commandObject* class to further restrict the values allowed in its attributes. In this case, we’ll use them to validate form data, but they can be used in any Java class.

These annotations are provided by Hibernate and precede each attribute. The most commonly used are:

* `@NotNull`: The attribute cannot be null.
* `@Min(n)`, `@Max(n)`: Specifies a minimum/maximum value for the attribute.
* `@NotEmpty`: Cannot be empty (only for Strings, Collections, Arrays...).
* `@Email`: Must have a valid email format.
* `@Size(min = n, max = m)`: Must have a size within the given limits (min n, max m).
* `@Past`: Indicates a date in the past. There are also `@PastOrPresent` and `@Future`.
* `@AssertTrue`: Determines that the value must always be true. Useful for checkboxes that must be checked.

```java
public class FormInfo {
    @NotNull @Min(0)
    private Long id;

    @NotEmpty
    private String name;

    @Email
    private String email;

    @Past
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    private double salary;
}
```

If the imports from the `jakarta.validation.constraints` library are missing, it’s because the dependency is not included in the `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Remember to add it to your `pom.xml`. You may need to close and reopen the editor if the project doesn’t reload properly after saving.

### 2.1 Step-by-Step Form Validation

To validate the form step by step, follow these steps:

1. Add `@Valid` to the object receiving the form data (with or without `@ModelAttribute`):

```java
@PostMapping("myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, Model model) {}
```

2. Add a new parameter of type `BindingResult` to the method, which will handle validation. **This parameter must come immediately after the *commandObject* with `@Valid`, otherwise it won’t work correctly.**

```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, BindingResult bindingResult, Model model) {}
```

3. Add the validation logic using the `hasErrors()` method from `BindingResult`:

```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid FormInfo formInfo, BindingResult bindingResult, Model model) {
    if (bindingResult.hasErrors()) return "errorView";
    model.addAttribute("processedData", formInfo.toString());
    return "formProcessedView";
}
```

If you don’t add any annotations to the *commandObject* class, *bindingResult* will only validate that the entered values match the expected data types — e.g., a date field must contain a valid date, an integer must not contain letters or decimals, etc.

Two important notes:

* If an attribute is annotated with `@Min(3)` or similar, no validation error occurs if no value is provided. To fix this, also add `@NotNull`.
* If we want *bindingResult* to throw an error when a text box is left empty, we should use `@NotEmpty` instead of `@NotNull`.

4. In the form template, we can add Thymeleaf code to display detected errors. The modifier `th:classappend` evaluates an expression and, if true, adds a CSS class to the tag. Combined with `#fields.hasErrors` on a *commandObject* attribute, it allows the HTML element’s appearance to change if an error is present.

To display the errors, we must re-render the view with the entered data. We’ll add `@ModelAttribute` after `@Valid` (`@Valid @ModelAttribute("modelName")`) to include *FormInfo* data and call the view again from the controller:

```java
@PostMapping("/myForm/submit")
public String myFormProcessSubmit(@Valid @ModelAttribute("formInfo") FormInfo formInfo, BindingResult bindingResult, Model model) {
    if (bindingResult.hasErrors()) return "formView";
    model.addAttribute("processedData", formInfo.toString());
    return "formProcessedView";
}
```

To make it clearer, here’s an example checking whether the entered email meets the format requirement defined in the `FormInfo` class (the form’s *commandObject*). If not, it applies the CSS style `cssError`:

```html
<div th:classappend="${#fields.hasErrors('email')} ? 'cssError'">
    <label>Email:<input type="text" id="email" th:field="*{email}"/></label>
</div>
```

To make this work, we must define the CSS style `cssError` (or use an existing one, e.g., Bootstrap’s `has-errors`) in a separate file or in the document’s `<head>`:

```html
<style> .cssError { background-color: red; } </style>
```

We can also add an error message using the Thymeleaf attribute `th:errors`. This message is defined in the class through the validation annotation:

```java
@Email(message = "Must be a valid email format")
private String email;
```

In the form, in addition to the previous code, we add a `<span>` to display the message:

```html
<div th:classappend="${#fields.hasErrors('email')} ? 'cssError'">
    <label>Email:<input type="text" id="email" th:field="*{email}"/></label>
    <span th:if="${#fields.hasErrors('email')}" th:errors="*{email}" class="cssError">*</span>
</div>
```

We could repeat this process for all form fields. Note that these error texts written in the class can also be read from an external file.

> **ACTIVITY:** Implement **form validation** in the add and edit forms for musical pieces and composers. Validate that the dates are valid, that names are not empty (except where allowed), and that the provided data is within acceptable limits. Also add error messages and CSS error classes. Modify the model classes with the appropriate annotations.
