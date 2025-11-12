# Error Management

## Error Management in Spring

Services can encounter different error situations: it could be because the received parameters do not have the expected values, because the calculations it intends to perform cannot be carried out, because the data repositories it accesses are unavailable, or for many other reasons.

When a service encounters an error, the correct approach is to throw an exception and let it be caught by the method that called the service, which is usually a controller method or another service method.

## Handling Exceptions Through a Specific View

Below is a service class with a single method that calculates the hypotenuse from its two legs. If any of the legs is negative, it throws an exception:

```java
@Service
public class MathService{
    public Double calculateHypotenuse(Double cat1, Double cat2) throws RuntimeException{
        if(cat1 <= 0 || cat2 <= 0) throw new RuntimeException("Invalid input parameters");
        return Math.hypot(cat1, cat2);
    }
}
```

We could have created a custom exception instead of throwing the generic `RuntimeException`, but for now, this approach is sufficient. Next, the controller calls the service method and catches the exception:

```java
@GetMapping("/calculateHypotenuse/{cat1}/{cat2}")
public String showHypotenuse(@PathVariable Double cat1, @PathVariable Double cat2, Model model){
    try{
        model.addAttribute("result", mathService.calculateHypotenuse(cat1, cat2));
        return "resultView";
    }catch(RuntimeException ex){
        model.addAttribute("txtError", ex.getMessage());
        return "errorView";
    }
}
```

In this case, catching the exception sends the user to an error view that informs them of the problem through the variable `txtError`. It does not have to be a separate error view; you could also add the same variable in the main view (in this case, `indexView.html`) and display it using Thymeleaf if it is not null.

> **ACTIVITY:**
> Create an "errorView" for the *MyFavouriteComposer* project that handles exceptions captured when creating a composer or a piece. The errorView should include a link back to the index and another to the form for creating the element.

## Handling Exceptions Through Redirects

Instead of having an `errorView`, we could prefer to redirect in case of any error. However, we have to change our approach if the controller returns a redirect instead of a view because in that case, you cannot pass anything via the *model*. A solution is to pass the target *mapping* as a parameter, along with an error code (or even the exception message), and let the controller method handle it. For example:

```java
try{ (...) }
catch(RuntimeException ex){
    return "redirect:/home?err=1";
}
```

And in the controller that displays the view:

```java
@GetMapping("/home")
public String showHome(@RequestParam(required = false) Integer err, Model model){
    if (err != null) model.addAttribute("txtErr", "Parameter error");
    return "indexView";
}
```

> **ACTIVITY:**
> Use this redirect method with parameter passing to control errors in *MyFavouriteComposer* edit forms. You should classify errors and return to the edit form, displaying the error at the top in red.
>
> * SUGGESTION: Use a switch-case to manage error codes.

## Tracking Errors Through "Global" Variables

One disadvantage of the option before is that the exception message is “lost” because, with a redirect, the target mapping only receives parameters, not the *model*. A solution is to have the controller store the message in a "global" variable (*technically, a controller attribute accessible by all mappings*), which the `try..catch` assigns the exception message to. Then, the mapping that returns the view can include the exception text in the *model* through this variable.

```java
@Controller
public class MathController {
    @Autowired
    private MathService mathService;
    private String txtError = null;

    @GetMapping("/calculateHypotenuse/{cat1}/{cat2}")
    public String showHypotenuse(@PathVariable Double cat1, @PathVariable Double cat2, Model model){
        try{
            model.addAttribute("result", mathService.calculateHypotenuse(cat1, cat2));
            return "resultView";
        }catch(RuntimeException ex){
            txtError = ex.getMessage();
            return "redirect:/home";
        }
    }

    @GetMapping("/home")
    public String showHome(@RequestParam(required = false) Integer err, Model model){
        if (txtError != null){ 
            model.addAttribute("txtErr", txtError);
            txtError = null; // reset the variable for future use
        }
        return "indexView";
    }
}
```

This variable can serve for any type of message we want to include (we could call it *status* or similar). To test this hypotenuse example with error control, the `indexView` must handle the `txtError` variable.

```html
<body>
    <h3>Hypotenuse Calculations</h3>
    Leg 1: <input type="text" id="leg1"/>
    Leg 2: <input type="text" id="leg2"/>
    <button onclick="calculateHypotenuse()">Calculate</button>
    <div th:if="${txtErr!=null}">
        <!-- OPTIONAL: USE BOOTSTRAP via WEBJARS for error styling -->
        <p class="alert alert-danger" role="alert" th:text="${txtErr}">error</p>
    </div>
    <script>
        function calculateHypotenuse(){
            var leg1 = document.querySelector("#leg1").value;
            var leg2 = document.querySelector("#leg2").value;
            globalThis.location.href="/calculateHypotenuse/" + leg1 + "/" + leg2;
        }
    </script>
</body>
```

> **ACTIVITY:**
> Adapt the previous activity by adding the global variable to control the error message.

### Problems Using a “Global” Variable in the Controller

Although the global variable approach is simple and useful for small projects, it can cause problems in larger projects. Spring MVC controllers are singletons by default. That means a single controller instance handles many concurrent requests. If the error message is stored in a field (`private String txtError`), **this variable is shared across all requests and users**. Two users, A and B, may trigger errors almost simultaneously. If request A sets `txtError = "A failed"` and before it is read, B sets `txtError = "B failed"`, user A could see B’s error. Result: incorrect messages and intermittent failures that are hard to debug.

Also, this is not scalable. In environments with multiple service instances (clusters), the local memory variable is not synchronized across instances. Finally, it is hard to test and maintain, since shared mutable state makes tests less deterministic and the behavior more fragile. 

## Error Management with `@ControllerAdvice` and `@ExceptionHandler`

`@ControllerAdvice` is a Spring Framework annotation used to define a global exception handler, allowing you to manage errors across the entire application from a single, centralized point. **`@ControllerAdvice` allows centralizing error handling for all controllers in a single class**, avoiding repeated try-catch blocks in each method. Inside this class, we use methods annotated with `@ExceptionHandler` to define what happens when a specific exception occurs (for example, showing an error view and sending a message to the user).

This way, if a service throws an exception, it is not necessary to catch it in the corresponding controller: the method marked with `@ExceptionHandler` executes automatically. This improves code organization and makes maintaining and modifying error handling easier. The `@ExceptionHandler` annotation receives as a parameter the exception class to handle.

For clarity, here’s an example:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    // For business exceptions
    @ExceptionHandler({RuntimeException.class})
    public String handleRuntimeException(RuntimeException ex, Model model) {
        model.addAttribute("txtErr", ex.getMessage());
        return "errorView";
    }

    // For specific exceptions
    // you can group several exceptions inside {}
    @ExceptionHandler(CustomException.class)
    public String handleNotFound(CustomException ex, Model model) {
        model.addAttribute("txtErr", "Exception: " + ex.getMessage());
        return "errorView";
    }
}
```
> In Spring MVC, you can’t have two `@ExceptionHandler` methods in the same class that handle the same exception type — Spring will throw an ambiguity error at startup or will just pick one handler arbitrarily (depending on the Spring version). 

In order to create a `CustomException`, you must define a new class that extends from an existing `Exception` derived class (it may be `Exception`, `RuntimeException`, etc.). It may be useful to group all the custom exceptions in a package or, if you decide to group controllers by area (Client, User), making a subpackage inside the proper package.
```java
 public class CustomException extends Exception{
    public CustomException(String msg){
        super(msg);
    }
}
```
However, it is a better practice in most of Spring Boot projects to extend from RuntimeException instead of Exception. If you use an `Exception` derived exception, as they are **checked**, you must add the `throw` to the signature method:
```java 
public String myMethod() throws CustomException{
    throw new CustomException("ex");
}
```
On the other hand, if you use a `RuntimeException` derived exception, as they are **unchecked**, you don't have to add any `throw` to the signature method.

```java 
public String myMethod(){
    throw new CustomRuntimeException("ex");
}
```
> **REMEMBER**
> - **Checked Exceptions:** Derived from `Exception`. The compiler forces you to declare and handle them.
> - **Unchecked Exceptions:** Derived from `RuntimeException`. The compiler doesn't force you to declare or handle them.
> All exceptions are derived from `Throwable` thus they all can be thrown.

Other ways to handle errors exist, but we will not cover them for now.

> **ACTIVITY**
> Create a `@ControllerAdvice` to manage errors globally in the *MyFavouriteComposer* project.
> - Create a handler for common exceptions
> - Create as custom exceptions as needed to specific cases
> - Create a specific handler for each exception
> - Test manually the different exceptions you make. You can use this approach if you want (later we will use unit tests):
> ```java
>@GetMapping("/errorThrower")
>    public String errorThrowerController(@RequestParam (required = false) String param) {
>        if(true) throw new RuntimeException("I'm throwing an error");
>        return "indexView";
>    }
>
>    @GetMapping("/customErrorThrower")
>    public String customErrorThrowerController(@RequestParam (required = false) String param) throws CustomException {
>        if(true) throw new CustomException("I'm throwing a custom error");
>        return "indexView";
>    }
>```

> **ACTIVITY:**
> Decide which error handling approach you want to use for your project. You can combine both methods or choose only one. In any case, consider the pros and cons and justify why you select one over the other.
