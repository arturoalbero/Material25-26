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

> **ACTIVITY (1):**
> Create an "errorView" for the *MyFavouriteComposer* project that handles exceptions captured when creating a composer or a piece. The errorView should include a link back to the index and another to the form for creating the element.

> **ACTIVITY (2):**
> Use this redirect method with parameter passing to control errors in *MyFavouriteComposer* edit forms. You should classify errors and return to the edit form, displaying the error at the top in red.
>
> * SUGGESTION: Use a switch-case to manage error codes.

> **ACTIVITY (3):**
> Adapt the previous activity by adding the global variable to control the error message.

> **ACTIVITY (4)**
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

> **ACTIVITY (5):**
> Decide which error handling approach you want to use for your project. You can combine both methods or choose only one. In any case, consider the pros and cons and justify why you select one over the other.

## 03 Deepening-into-the-service-layer

> **ACTIVITY 1:**
> Redesign the method handling CRUD operations so that it becomes an interface (CrudOperator or any name you choose). The CSVUtils service will implement this interface, and later we will create another implementation when we want to access a database. The methods should follow a structure similar to:
> `returnType (String or void) methodNameWithAction(Element e, Source f)`
> where the source is either a CSV file or the database. Use `@Qualifier` to annotate the CRUD implementation with `csv`.

> **ACTIVITY 2:**
> Return to the earlier version of the project—the one that used a manager to manage information—and add a Bean that initializes the data (i.e., reads the CSVs and loads them into the lists, as you did before).

> **ACTIVITY 3:**
> In the MyFavouriteComposer project, create a form allowing images to be added to a composer.

> **ACTIVITY 4:**
> Extend the previous activity to allow images to be stored on the server. Modify the necessary classes so that everything works correctly.

> **ACTIVITY 5:**
> This section introduces several elements we have not covered yet, but they are simple to use. Look them up in the official documentation of Java and Spring Framework. Use official documentation without AI assistance if possible (you may use a translator).
>
> * Classes `Path` and `Files` from `java.nio.file`
> * Classes from `springframework`:
>
>   * Resource
>   * UrlResource
>   * StringUtils
> * The class `InputStream`
>   With that information, add comments to the example code so that you can understand it in future reviews.

> **ACTIVITY 6:** As you did in *activity 5*, look for information in the official sources about:
> - From [Jakarta EE](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/index.html), `MimeMessage` and `MessagingException`.
> - From Spring, `MimeMessageHelper` and `JavaMailSender`.
> Comment the code exemples as you need.

> **ACTIVITY 7:**
> Allow users with an email address to subscribe to a composer. Create a button on the composer’s page that leads to a view `suscribirseAlCompositorView` where the user enters their username and email. This information must be saved in a subscribers `.csv` file, ensuring no email is duplicated.
>
> Whenever the composer profile is modified (an edit), subscribers must be notified. If a new image was also added to the composer, that image must be included in the message content.
>
> The email must also contain a link to the view `anularSuscripciónAlCompositorView`, where **a button** allows the user to unsubscribe (i.e., their line in the `.csv` is removed).
>
> Make the email sending asynchronous.