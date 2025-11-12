These are the activities you should have done for the delivery of the unit 4 main activity.

## 01 - Service Layer

> **ACTIVITY**: Modify the data management class to make it a service.
>
> * Composers and pieces are **no longer stored in memory** in lists; instead, they are retrieved or edited each time (preparing the transition from .csv to a database).
> * Create a service to interact with CSV files and perform CRUD operations (Create, Read, Update, Delete).
>
>   * For the methods, follow a structure like: `public void create(String composerAsCSV, String csvPath);`
>   * For Read, make it return a string (or an array of strings) and make sure each of your classes has a constructor that accepts an array of strings (where each element corresponds to a field).
> * Adjust the project to ensure everything works correctly.

## 02 Error Management

> **ACTIVITY:**
> Create an "errorView" for the *MyFavouriteComposer* project that handles exceptions captured when creating a composer or a piece. The errorView should include a link back to the index and another to the form for creating the element.

> **ACTIVITY:**
> Use this redirect method with parameter passing to control errors in *MyFavouriteComposer* edit forms. You should classify errors and return to the edit form, displaying the error at the top in red.
>
> * SUGGESTION: Use a switch-case to manage error codes.

> **ACTIVITY:**
> Adapt the previous activity by adding the global variable to control the error message.

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

## 03 Classes and interfaces. Command Line Runner. Archives in forms.