# My Favourite Composers: Assessable Assignment

## Prior Concepts

Before starting the assignment, we'll finish covering two brief concepts: the **`WebMvcConfigurer` interface** and the **creation of custom error pages**.

### The `WebMvcConfigurer` Interface

This interface allows you to configure basic aspects of how our application works. Later, we'll use it to avoid CORS security issues, but we can also use it to define direct mappings between a path and the view to be displayed, avoiding the need to develop a controller method. This is only valid when no data is passed to the view—that is, when it's a direct binding between a path and a view, with nothing else.

To implement this interface, we'll create a class with the **`@Configuration` annotation** (so it runs when the application starts) and implement the configuration methods we're interested in, in this case, `addViewController()`:

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer{
    @Override
    public void addViewControllers(ViewControllerRegistry registry){
        registry.addViewController("/quienesSomos").setViewName("quienesView");
        registry.addViewController("/dondeEstamos").setViewName("dondeView");
    }
}
```

The class can have any name you like. In this case, if the user requests the path */quienesSomos*, it will display the view */quienesView.html*. For practical purposes, this class replaces the following controller:

```java
@Controller
public class ControladorSustituido{
    @GetMapping("/quienesSomos")
    public String quienesSomos(){
        return "quienesView";
    }
    @GetMapping("/dondeEstamos")
    public String dondeEstamos(){
        return "dondeView";
    }
}
```

It's not exactly the same, as with **`@Configuration`**, the mapping of paths to views is registered when the application starts as a fixed association with no additional logic. In contrast, with an **`@Controller`**, although the mappings are also registered at startup, code can be executed every time a request is received, and therefore, dynamic data can be returned along with the view.

The class that implements `WebMvcConfigurer`, like all others in the project, must be in the root package or a subpackage. In some cases, you'll see this class also annotated with `@EnableWebMvc`, but this isn't necessary with Spring Boot.

> **TIP:** When you only need `@Controller` methods that return the view, without logic or data in the model, use the **`WebMvcConfigurer` interface** instead. However, keep in mind that any scenario requiring logic or dynamic data requires an `@Controller`.

## Custom Error Pages

If an unexpected error occurs in our application, the browser shows a default error page. Typical errors include **404** (page not found), **500** (Internal Server Error), **403** (access denied), etc.

If we want to display **custom pages** with a friendlier message, with links back to the application, etc., we just need to create a folder called **/error** under **/templates** and, inside it, create **.html files** named after the error number, i.e., *404.html*, etc.

An example of the file structure would be:

```
my-project/
 ├─ src/
 │   └─ main/
 │       ├─ java/
 │       │   └─ com/
 │       │       └─ example/
 │       │           └─ demo/
 │       │               ├─ DemoApplication.java      # Main class
 │       │               └─ controller/
 │       │                   └─ HomeController.java   # Controllers
 │       │
 │       └─ resources/
 │           ├─ static/                              # Static files and public access resources (can be referenced in the URL)
 │           │   ├─ css/
 │           │   │   └─ styles.css
 │           │   ├─ js/
 │           │   │   └─ script.js
 │           │   └─ img/                             # images
 │           │       └─ logo.png
 │           │
 │           ├─ templates/                           # Thymeleaf views
 │           │   ├─ index.html
 │           │   └─ error/                           # Custom error pages
 │           │       ├─ 404.html
 │           │       ├─ 500.html
 │           │       └─ 403.html
 │           │- data/
 |           |   └─ csv/
 |           |       └─ myFile.csv                   # We store private resources (internal access only)
 │           └─ application.properties               # Configuration
 │
 └─ pom.xml                                          # Maven dependencies
```

## Other resources

As you can see in the diagram before, we can add a folder in the folder `resources` to store private data. The private data is data accesible by our application in an internal level. In contrast, the static data stored in the `static` folder is accesible by everyone having the URL of the resource. We can use as many private resources as needed.

In order to access the resource, click in the file to copy the relative path and open a data stream to read it, like the following one:

```java
    public static List<String []> readCSV(String path){
        List<String []> list = null; //we need to initialize it to null because the Scanner may fail
        try(Scanner io = new Scanner(new File(path))){
            list = new ArrayList<>();
            while(io.hasNextLine())
                list.add(io.nextLine().split(";")); //the ";" is the separator of the csv
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
        return list;
    }

```
This code reads a file using `Scanner` in a try-catch-with-resources formula. Then, it creates a List of each array of strings you extract from a csv file separated by `;`. Like this one:

```csv
Wolfgang Amadeus Mozart;Viena;1791
Gustav Mahler;Viena;1913
```

So, the first array will be something like `{"Wolfgang Amadeus Mozart", "Viena", "1791"}`. Then, you can call this method (or a similar one) like this in the `@Controller`:

```java
@GetMapping("/")
    public String mainView(Model model){

        model.addAttribute("list", 
            CSVUtil.readCSV("src/main/resources/data/composer.csv"));
        return "indexView";
    }
```

As you can see, we have to specify the relative path of the file we are accessing. In order to process this file, your html `indexView.html` in your  `/templates` folder should be something like this:

```html
<p th:each="composer : ${list}">
    <span th:each="item : ${composer}">
        <span th:text="${item}">*</span>-
    </span>
</p>
```

If you use classes or records (and you should use them), you can access to each attribute of the element using the `.` separator. However, you will need an extra method to parse the array of strings into an object.

## Use of the singleton pattern for data persistency

One simple way to achieve data persistency in your application, but not the most spring-like approach, is to use of the singleton pattern.

In the singleton pattern, we create a singleton class that stores all the information we want to share between all the classes. A singleton class is a class of which only one instance can be alive at a time. In order to do so, we have several ways to implement it but the easier approach is the "lazy initialization".

A lazy initialization is an initialization that occurs at the very last moment, when the instance is needed. In order to do so, we make the constructor of the class private and it is called by the getter of the instance. Following the example of before, we could create a singleton class like this:

```java
public class MiSingleton {
    //THE INSTANCE OF THE CLASS. NOTICE THE STATIC, very important
    private static MiSingleton instance = null;

    //---//
    //THE DATA WE NEED TO SHARE
    private List<String []> dataList;

    //THE GETTER OF THE INSTANCE. NOTICE THE STATIC, very important
    public static MiSingleton getInstance(){
        if(instance == null){
            instance = new MiSingleton();
        }
        return instance;
    }
//THE PRIVATE CONSTRUCTOR
    private MiSingleton(){
        initialize();
    }
//AN AUXILIAR METHOD WE WILL USE TO THE INITIALIZATION OF THE DATA.
/* 
IN THE ASSESMENT, FIRST YOU WILL HARD CODE HERE THE COMPOSERS AND LATER YOU WILL REPLACE THAT CODE FOR A MORE ELEGANT WAY TO INITIALIZE THE DATA THROUGH FILES AND PARSING
*/
    private void initialize(){
        dataList = CSVUtil.readCSV("src/main/resources/data/composer.csv");
    }

//GETTER OF THE DATA WE NEED TO SHARE AMONG THE CLASSES
    public List<String[]> getDataList() {
        return this.dataList;
    }

}
```

So, in the controller, we will first retrieve the instance of the singleton and then get the data we need, like this:

```java
    @GetMapping("/")
    public String mainView(Model model){
        MiSingleton instance = MiSingleton.getInstance();
        model.addAttribute("list", 
            instance.getDataList());
        return "indexView";
    }
```


Thanks to the Singleton pattern, the data is initialized only once during the application's lifecycle, ensuring that all components share the same data instance. Spring has its own ways to manage data persistency, but are a bit more advanced.

> **NOTE:** This approach is not Thread-safe, which means that in a concurrent environment, you could have more than one instance due to the interaction of different threads with the method `getInstance()`. In order to prevent this, you can add the keyword `synchronized` to the method:
>```java
>public static synchronized MiSingleton getInstance() {
>    if (instance == null) {
>        instance = new MiSingleton();
>    }
>    return instance;
>}
>```
>

With this in mind, we can now create our project for learning outcome 2.

## Assessable Assignment: My Favorite Composers

We're going to create an application that gathers information about historical composers, such as Frédéric Chopin. In this application, we'll implement a **welcome page** that indicates the current year and the number of composers registered in the application. We're going to design a database, conceptually, that relates composers with musical pieces, where the composer's primary key is their artistic name (for example, *Wolfgang Amadeus Mozart*), and this is referenced in the musical piece. For now, we already have a few pieces by *Fréderic Chopin*, so he'll be our first composer. We can add a few more, with my recommendations being *Wolfgang Amadeus Mozart*, *Gustav Mahler*, and *Ólafur Arnalds*.

For each composer, we store, in addition to their name, a brief biography, their date of birth, their date of death (if they are still alive, this will be *null*), their nationality, their place of birth, and their place of death (if they are still alive, this will be *null*). We can include a list of their compositions (MusicalPieces) and another list of their photos (using a text string for links to static content is sufficient). We'll first program the data within the Java program to facilitate testing, but later we'll store them in **.csv files** (ideally, it would be in a database, but we haven't worked on that yet).

  - **Create the data model:** Implement the **`Composer`** and **`MusicalPiece`** classes. 
  - - **As and advanced feature (optional)**, you can implement a **`Manager`** class of the **singleton** type (use the Lazy Initialization approach, which is the simplest) in which the information is stored in a list of composers (or a list of composers and another of pieces). The singleton class serves for the static persistence of data throughout the application, even if we change controllers. It is not the only way to make data persistent.
  - **`composerView`:** We must add a view that shows a composer, their data, and a list of links to their musical pieces registered in the application (the links will lead to the YouTube video or resource we want). The view must respond to the URL `/composer/{name}`. The handling of special characters and spaces must be managed somehow. A special view must also be created for when the **`{name}`** doesn't exist among our composers.
  - **`searchComposerView`:** We must implement a view that has an **`<input>`** that allows us to search for a composer by their name. For now, use the full name to simplify programming. Create a button that takes us to the `composerView` with the appropriate parameters in the URL.
  - **Add another `<input>`, this time to search for composers by their nationality**. In this case, the view returned will be a list of links to the composers that meet the requirement (you can call it *listComposersView*). The links will lead to the *composerView* with the appropriate parameters. Have the composers organized by date of birth, using a sorting method on the resulting list.
      - You can modify this section by using checkboxes to add conditions to the search. You might want to add the requirement "is alive" to test.
  - **Implement a common header**, using **fragments**, for all pages. Add the necessary **bootstrap** there, preferably using **webjars**.
      - **As and advanced feature (optional)**, use bootstrap, normal CSS, tailwind, or any other *beautifier* to give the website a pleasing look.
  - **`composerCompareView`:** Create a view that has two **select** type entries (dropdown menu), where all registered composers appear. Once both composers are selected, we can click a button that takes us to another view **`whoIsOlderView`** which tells us "Composer X is older than Composer Y". Perform the calculation by comparing the dates of birth.
  - **`IndexView`:** Create a default welcome view with a link to *searchComposerView* and another to *composerCompareView*. Map this view using **`@Configuration`** to the URLs `/`, `/home`, and `/index`.
  - **Error Pages**: Create the different error pages (at least **404** and **500**), with their corresponding message and a link that takes you to **`IndexView`**.
  - **Store the composers and musical pieces in two separate .csv files** that you will read from the Java program. Remember that you can make the first row correspond to the class attributes and the following rows to each of the objects (it is not mandatory, but makes the .csv much more readable). Resources are stored internally, in the `/resources/data/csv/` folder. For now, you will create the .csv files manually.
  - Clearly separate the packages for **controllers**, for **configuration**, as well as the **data model** (`Manager`, `MusicalPiece`, and `Composer`). Follow an appropriate structure for the Spring project.
  - Don't forget to add the necessary **dependencies** when using Spring Boot Initializr. If you add them later to the pom.xml, the dependencies normally are automatically downloader when the file is saved. Add, at least one, for instance ***bootstrap*** using ***webjars***.
  - Don't forget to **document the code using javadoc**. You can use the integrated tools in the IDE to help you with the documentation, but always review that what you write is correct.
  - The project was planned using **`@PathVariable`**, but, **As and advanced feature (optional)**, you can modify it (or make an alternative version) using **`@RequestParam`** as an **ENRICHMENT ACTIVITY**. Document the process.