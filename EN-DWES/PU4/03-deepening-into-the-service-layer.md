# 4 Deepening into the Service Layer

## 1. Service Layer Using Interfaces and Classes

If you look for examples of service-layer classes on the internet, you’ll see that in many cases, instead of directly using a class annotated with `@Service`—as we did with our `SumaService` class—the usual approach is to create an interface containing the method signatures and a class that implements the interface. The class would be annotated with `@Service`, but the controller injects the interface.

```java
public interface SumaService{
    Integer suma(Integer a, Integer b);
}
```

```java
@Service
public class SumaServiceImpl implements SumaService{
    public Integer suma(Integer a, Integer b){ return a + b;}
}
```

```java
@Controller
public class SumaController{
    @Autowired
    private SumaService sumaService;
}
```

This may seem confusing at first, and its usefulness may not be obvious. The explanation is that this approach allows for greater independence between layers, as discussed in the first unit. If in the future we wanted to create a new implementation of the interface using another class, we would not have to change anything in other layers such as the controller, since it injects the interface, not the class.

When injecting an interface into the controller, there might be multiple classes implementing it. Usually, however, there is only one. If there are multiple, we can mark one of them as the default by adding the `@Primary` annotation. That one will then be injected by default. When needed, we can inject a specific implementation directly rather than the interface, although a more elegant approach is to add a `@Qualifier` annotation to the classes with a qualifier and use it in the injection.

```java
@Service
@Primary
@Qualifier ("mem")
public class EmpleadoServiceImplMem implements EmpleadoService{...}

@Service
@Qualifier("bd")
public class EmpleadoServiceImplBD implements EmpleadoService{...}

@Controller
public class EmpleadoController{
    @Autowired
    @Qualifier("mem")
    private EmpleadoService empleadoService;
```

You should never annotate an interface with `@Service`, `@Component`, or any other annotation derived from `@Component`, because Spring will attempt to instantiate it, causing an error. These annotations should always be placed on classes.

> **ACTIVITY 1:**
> Redesign the method handling CRUD operations so that it becomes an interface (CrudOperator or any name you choose). The CSVUtils service will implement this interface, and later we will create another implementation when we want to access a database. The methods should follow a structure similar to:
> `returnType (String or void) methodNameWithAction(Element e, Source f)`
> where the source is either a CSV file or the database. Use `@Qualifier` to annotate the CRUD implementation with `csv`.

## 2. CommandLineRunner

*CommandLineRunner* is a functional interface with a single method called *run*. Spring Boot automatically calls the execution method of all *beans* that implement this interface after the application context has been loaded—that is, its code will run at application startup.

> **What is a Bean?**
> A *Bean* or *JavaBean* is a reusable Java object that follows a simple set of conventions (public no-args constructor, properties accessible via getters and setters, and being serializable) to make it easy for tools and frameworks to manipulate it automatically. Its name references coffee beans, since “Java” refers to the famous coffee from the island of Java, considered—the creators say—the most essential tool for programmers.

In many cases, the interface is implemented in the file containing the application’s *main* method and the `@SpringBootApplication` annotation. Being a functional interface, it can easily be implemented using a lambda expression—this is the approach we will commonly use:

```java
@SpringBootApplication
public class Main{
    public static void main(String args[]){
        SpringApplication.run(Main.class, args);
    }
    @Bean
    CommandLineRunner initData(){
        return args ->{
            System.out.println("Hello World!");
        };
    }
}
```

We can inject components as arguments into the method, but we will cover that later. Spring Boot may also implement the interface itself:

```java
@SpringBootApplication
public class MyApp implements CommandLineRunner{
    public static void main(String [] args){
        SpringApplication.run(MyApp.class, args);
    }
    @Override
    public void run(String... args) throws Exception{
        System.out.println("Welcome to our app!");
    }
}
```

Or it can be done in separate files, such as classes implementing the interface:

```java
@Component
public class MyRunner implements CommandLineRunner{
    @Override
    public void run(String... args) throws Exception{}
}
```

> **ACTIVITY 2:**
> Return to the earlier version of the project—the one that used a manager to manage information—and add a Bean that initializes the data (i.e., reads the CSVs and loads them into the lists, as you did before).

## 3. Files in Forms

Returning to forms, sometimes we want to attach files to send to the server. This is done using the `multipart` property of the HTTP protocol. A `multipart` message contains different sections or parts, each of which may have different content types. Thus, a response may include plain text, text files, images, etc. Each part is delimited by a line containing the `Content-type` attribute, specifying the content type of that part. The steps are:

1. Add the attribute `enctype="multipart/form-data"` to the `<form>` tag used for file upload. You can read more about `enctype` in [this link](https://aulab.es/articulos-guias-avanzadas/15/la-etiqueta-del-formulario).
2. The form must include a file upload field:
   `<label>Attach file:<input type="file" name="file"></label>`.
3. In the controller, add a new parameter to the method processing the form:
   `@RequestParam MultipartFile file`, where *file* matches the form field name. The MultipartFile class provides methods to process the received file.
4. In that method, add the logic you want to apply to the file, usually calling a service:

```java
@PostMapping("/myForm/submit")
public String processForm(FormInfo formInfo, @RequestParam MultipartFile file){
    myService.processFile(file);
}
```

5. It is not necessary to modify the form’s *commandObject* since the file is received as a separate parameter. However, in many cases we will want to store the location where the file is saved. If the commandObject is a model class, it is common to add a new String attribute to store the file’s local path.

> **ACTIVITY 3:**
> In the MyFavouriteComposer project, create a form allowing images to be added to a composer.

## 4. Storing Files on the Server

Usually, we want to store user-uploaded files on a storage server. In real-world systems, this is typically done on an external server; however, for testing purposes, we can use the application server itself for simplicity.

We need to modify the controller, but we also need a service implementing the operations on the file. The service should contain an attribute representing the path where files will be stored and three methods: one to store the file, one to retrieve it, and one to delete it.

The folder where we store the files must be created beforehand (in this example, it's `uploadDir`) and located in the project’s root when running from the IDE and in the same folder as the generated `jar` when deployed.

```java
@Service
public class FileStorageService{
    private final Path rootLocation = Path.get("uploadDir");

    public String store(Multipart file) throws RuntimeException{
        if(file.isEmpty()) throw new RuntimeException ("Empty file");
        String filename = StringUtils.cleanPath(file.getOriginalFilename());

        if(filename.contains("..")) throw new RuntimeException("Invalid file");
        String extension = StringUtils.getFilenameExtension(filename);
        String storedFilename = System.currentTimeMillis() + "." + extension; //en principio, cada segundo de la vida es único, como únicos deben ser los nombres de ficheros...

        try(InputStream inputStream = file.getInputStream()){
            Files.copy(inputStream, this.rootLocation.resolve(storedFilename), StandardCopyOption.REPLACE_EXISTING);
            return storedFilename;
        }catch(IOException ioe){
            throw new RuntimeException("Write error");
        }
    }

    public void delete(String filename) throws RuntimeException{
        try{
            Path file = rootLocation.resolve(filename);
            if(!Files.exists(file)) throw new RuntimeException ("File does not exist");
            Files.delete(file);
        }catch(IOException ioe){
            throw new RuntimeException("Delete error");
        }
    }

    public Resource loadAsResource(String filename) throws RuntimeException{
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if(resource.exists() || resource.isReadable()) return resource;
            else throw new RuntimeException("IO Error");
        }catch(Exception e){throw new RuntimeException("IO Error");}
    }
}
```

> **NOTE:**
> The code, from the reference book *“Desarrollo Web en Entorno Servidor”* by Fernando Rodríguez Diéguez, shows a common structure in modern programming. It uses `if` blocks as guard clauses, in this case terminating the method by throwing an exception (although sometimes they return instead). While not strictly academic, it is quite common and can make the code more readable by avoiding nested `if` blocks.

If we want to display a stored file in a view—for example, an image—we can include a tag like:
`<img th:src="'/files/' + ${image}" width="64px">`,
where `${image}` is a variable containing the stored file name. In the controller, we must handle that path and return the image to the browser:

```java
@GetMapping("/files/{filename:.+}")
public ResponseEntity<Resource> serveFile(@PathVariable String filename){
    Resource file = fileStorageService.loadAsResource(filename);
    return ResponseEntity.ok().body(file);
}
```
> **DO YOU KNOW...** The pattern filename:.+ in Spring is used within a `@RequestMapping` or `@GetMapping` annotation to capture a path variable named filename that can include any character, including dots, allowing for file extensions to be part of the path.
>
> This is particularly useful for serving files with specific names and extensions, such as result_20200225.csv or archivo demo.pdf.

We can limit the size of files allowed to be uploaded by adding the following properties to *application.properties*:

```bash
spring.servlet.multipart.max-file-size=256KB
spring.servlet.multipart.max-request-size=256KB
```

If the file size exceeds the limit, a `java.lang.IllegalStateException` will occur and must be handled.

> **ACTIVITY 4:**
> Extend the previous activity to allow images to be stored on the server. Modify the necessary classes so that everything works correctly.

> **ACTIVITY 5:**
> This section introduces several elements we have not covered yet, but they are simple to use. Look them up in the official documentation of [Java](https://docs.oracle.com/en/java/) and [Spring Framework](https://docs.spring.io/spring-framework/docs/current/javadoc-api/index.html). Use official documentation without AI assistance if possible (you may use a translator).
>
> * Classes `Path` and `Files` from `java.nio.file`
> * Classes from `springframework`:
>
>   * Resource
>   * UrlResource
>   * StringUtils
> * The class `InputStream`
>   With that information, add comments to the example code so that you can understand it in future reviews.

## 5. Sending Emails and Asynchronous Execution

It is very common for applications to need to send emails, both to external users and to administrators when certain events occur. Typical examples include contact forms, order confirmations, etc.

One option would be to install a mail server, but this is quite complex; instead, a simpler approach is to use Gmail as an email forwarder—meaning that instead of sending the email ourselves, we tell Gmail to send it for us.

The only requirement is to have a Google account with two-step verification enabled and an application password. [More information is available in Google's help documentation](https://support.google.com/accounts/answer/185833?hl=es).

The process is very simple: we call a function, passing the recipient, subject, message body, and optionally attachments. Usually, we create a service class that includes this function, which can then be invoked from anywhere in the application.

### 5.1 Sending Emails with Gmail Step by Step

1. Add the *starter-mail* dependency in *pom.xml*:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

2. Configure *application.properties*:

```yml
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username= #[GMAIL address with two-step verification]
spring.mail.password= #[application password, not account password]
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```

3. Create the service with the method that performs the sending:

```java
@Service
public class EmailService{
    @Autowired
    private JavaMailSender sender;

    public boolean enviarEmail(String destination, String subject, String textMessage){
        try{
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message);
            helper.setTo(destination);
            helper.setText(textMessage, true); //The second parameter allows you to use html in the message.
            helper.setSubject(subject);
            sender.send(message);
            return true;
        }catch(MessagingException e){
            e.printStackTrace();
            return false;
        }
    }
}
```

4. We can call this method from anywhere in the application by injecting *EmailService* and calling the method. The message body supports HTML tags.

```java
@Autowired
private EmailService emailService;
String cuerpoMensaje = "<h1>Message body</h1>";
String destinatario ="myemail@email.com";
String asunto = "Message subject";
boolean envioEmail = emailService.enviarEmail(destinatario, asunto, cuerpoMensaje);
if(envioEmail)...
```

We can modify the service method to send to multiple recipients: `helper.setTo` accepts either a single `String` or a `String[]`.

5. We can also send one or more attachments by passing the filename (or an array of filenames) as a parameter, adding `true` as the second parameter of *MimeMessageHelper*, and attaching the files using `addAttachment`:

```java
public boolean sendEmail(String destination, String subject, String textMessaje, String attachment){
    try{
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(destination);
            helper.setText(textMessage, true);
            helper.setSubject(subject);
            File adjunto = new File(attachment);
            helper.addAttachment(adjunto.getName(), adjunto);
            sender.send(message);
            return true;
        }catch(MessagingException e){
            e.printStackTrace();
            return false;
        }
}
```

For multiple attachments, `attachment` would be a `String[]` and iterated like this:

```java
for(String att : attachments){
    File adjunto = new File(att);
    helper.addAttachment(adjunto.getName(), adjunto);
}
```

> **ACTIVITY 6:** As you did in *activity 5*, look for information in the official sources about:
> - From [Jakarta EE](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/index.html), `MimeMessage` and `MessagingException`.
> - From Spring, `MimeMessageHelper` and `JavaMailSender`.
> Comment the code exemples as you need.

### 5.2 Asynchronous Execution

As written, email sending may take several seconds. If we don't want the client's browser to wait for the sending to complete, we can send the email asynchronously. This way, execution immediately returns to the next line of code without delay. In this case, we cannot confirm to the client whether the email was successfully sent.

To make an asynchronous call:

* Add `@EnableAsync` to the main class (in addition to `@SpringBootApplication`).
* Add `@Async` to the email-sending method. This method must return `void` since execution will not wait for it to complete.

```java
@Async
public void sendEmail(String destination, String subject, String textMessage)
```

> **ACTIVITY 7:**
> Allow users with an email address to subscribe to a composer. Create a button on the composer’s page that leads to a view `suscribirseAlCompositorView` where the user enters their username and email. This information must be saved in a subscribers `.csv` file, ensuring no email is duplicated.
>
> Whenever the composer profile is modified (an edit), subscribers must be notified. If a new image was also added to the composer, that image must be included in the message content.
>
> The email must also contain a link to the view `anularSuscripciónAlCompositorView`, where **a button** allows the user to unsubscribe (i.e., their line in the `.csv` is removed).
>
> Make the email sending asynchronous.
