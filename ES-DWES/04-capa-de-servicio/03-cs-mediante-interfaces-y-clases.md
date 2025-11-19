# 4 Profundizando en la capa de servicio

## 1. Capa de servicio mediante interfaces y clases

Si buscas ejemplos de clases de la capa de servicios en internet verás que, en muchos casos, en vez de utilizar directamente una clase con la anotación `@Service`, tal y como hemos hecho con nuestra clase `SumaService`, lo que se hace es crear una interfaz con la firma de los métodos y una clase que implementa la interfaz. La clase estaría anotada con @Service, pero en el controlador se inyecta la interfaz.

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
Puede parecer un poco confuso al principio y no ver la utilidad. La explicación es que de esta forma logramos más independencia entre las capas, como comentábamos en el primer tema. Si en un futuro quisiésemos hacer una nueva implementación de la interfaz con otra clase, no tendríamos que cambiar nada en las otras capas como el controlador, ya que tiene inyectada la interfaz y no la clase.

Al inyectar una interfaz al controlador, podría darse el caso de que tuviéramos varias clases que la implementaran. Lo habitual es, sin embargo, tener una sola. Si tenemos varias, podemos indicar que una de ellas es por defecto añadiéndole la anotiación `@Primary`. Así, será la que se inyectará por defecto. Cuando queramos, podemos inyectarla directamente, sin la interfaz, aunque queda más elegante añadirles a las clases la anotación `@Qualifier` con un calificador e indicarle dicho calificador en la inyección.
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
}
```
Nunca se debe anotar con `@Service`, `@Component` o cualquier otra anotación derivada de `@Component` una interfaz, ya que cuando Spring trate de instanciarla se producirá un error. Esas anotaciones siempre se ponen en clases.

> **ACTIVIDAD 1:**
> Rediseña el método que permitía las operaciones CRUD para que sea una interfaz (CrudOperator o como quieras). El servicio CSVUtils implementará esa interfaz, pero más adelante haremos otra implementación cuando queramos acceder a la base de datos. Los métodos deben tener una estructura similar a la siguiente `retorno (String o Void) nombreDelMétodoConLaAcción(Elemento e, Fuente f)`, siendo la fuente un archivo csv o la base de datos. Usa @Qualifier para anotar la implementación del CRUD con `csv`.

## 2. CommandLineRunner

*CommandLineRunner* es una interfaz funcional con un solo método llamado *run*. Spring Boot llama automáricamente al método de ejecución de todos los *beans* que implementen esta interfaz después de que se haya cargado el contexto de la aplicación, es decir, que su código se ejecutará en el arranque de nuestro programa.

> **¿Qué es un Bean?** Un *Bean* o *JavaBean* es un objeto Java reutilizable que sigue un conjunto de convenciones simples (constructor público sin argumentos, propiedades accesibles mediante getters y setters, y ser serializable) para facilitar su manipulación automática por herramientas y frameworks. Su nombre hace referencia a los granos de café, ya que el propio nombre de Java hace referencia al famoso café de la isla de Java, pues el café, según los creadores del lenguaje de programación, es la herramienta más importante del programador.

En muchos casos se suele incluir en el archivo que contiene el *main* de la aplicación y la anotación `@SpringBootApplication`. Como interfaz funcional que es, se puede implementar de forma sencilla mediante una función lambda. Esta será la forma que empleemos habitualmente:
```java
@SpringBootApplication
public class Main{
    public static void main(String args[]){
        SpringApplication.run(Main.class, args);
    }
    @Bean
    CommandLineRunner initData(){
        return args ->{
            System.out.println("Hola Mundo!");
        };
    }
}
```
En los argumentos del método podemos inyectar componentes, pero lo veremos más adelante. También puede ser la propia aplicación Spring Boot la que implemente la interfaz:
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
O incluso en archivos aparte, como clases que implementan la interfaz:
```java
@Component
public class MyRunner implements CommandLineRunner{
    @Override
    public void run(String... args) throws Exception{}
}
```
> **ACTIVIDAD 2:**
> Vuelve a la versión anterior de la práctica, la que usaba un manager para gestionar la información y añade un Bean que inicialice los datos (es decir, que lea los CSV y los vuelque a las listas, como ya hacías)

## 3. Archivos en formularios

Volviendo a los formularios, en ellos podemos querer anexar archivos para ser enviados al servidor. Esto lo haremos mediante la propiedad `multipart` del protocolo HTTP. Entendemos por `multipart` aquel mensaje que tiene diferentes secciones o partes, y que cada una de ellas puede tener un tipo de contenido diferente de forma que en una respuesta podríamos enviar texto plano, ficheros de texto, una imagen, etc. Cada parte vendrá delimitada por una línea con el atributo `Content-type` que indicará el tipo de contenido de esa parte. Los pasos a seguir serán:
1. Añadir a la etiqueta `<form>` del formulario de subida el atributo `enctype = "multipart/form-data`.
2. El formulario incluirá un campo para la subida de ficheros `<label>Adjuntar fichero:<input type="file" name="file"></label>`.
3. En el controlador, añadir en la firma del método que procesa el formulario un nuevo parámetro `@RequestParam MultipartFile file`, siendo file el nombre que hemos dado en el formulario al campo para la subida de ficheros. La clase MultipartFile permitirá, mediante sus métodos, procesar el fichero recibido.
4. En el método del punto anterior, añadiremos la lógica que necesitemos aplicar al fichero, probablemente un servicio:
```java
@PostMapping("/myForm/submit")
public String processForm(FormInfo formInfo, @RequestParam MultipartFile file){
    myService.processFile(file);
}
```
5. No será necesario modificar el *commandObject* del formulario ya que el fichero viene en un parámetro aparte, pero en muchos casos sí querremos almacenar la ruta donde hemos guardado el fichero. Si el *commandObject* es una clase de nuestro modelo es frecuenta añadir a esa clase un atributo nuevo de tipo String para almacenar la ruta local del fichero subido.

> **ACTIVIDAD 3:** Crea en la práctica MyFavouriteComposer un formulario para poder añadir imágenes a un compositor.

## 4. Almacenar ficheros en el servidor

Lo habitual es querer guardar los archivos que suban los usarios en un servidor de almacenamiento. En el mundo real, se suele usar un servidor externo pero, en un contexto de pruebas, podemos usar el propio servidor por simplificar.

Tenemos que modificar el controlador, pero necesitamos un servicio que implemente las operaciones sobre el fichero. El servicio debería tener un atributo que representara la ruta donde almacenaríamos los archivos y tres métodos: uno para guardar el archivo, otro para recuperarlo y otro para borrarlo.

La carpeta en la que almacenamos los archivos debe crearse previamente (en el ejemplo, es `uploadDir`) y estar situada en la ruta raíz del proyecto cuando lo ejecutamos desde el IDE y en la misma carpeta que el `jar` cuando la aplicación esté desplegada.

```java
@Service
public class FileStorageService{
    private final Path rootLocation = Path.get("uploadDir");

    public String store(Multipart file) throws RuntimeException{
        if(file.isEmpty()) throw new RuntimeException ("Fichero vacío");
        String filename = StringUtils.cleanPath(file.getOriginalFilename());

        if(filename.contains("..")) throw new RuntimeException("Fichero incorrecto");+
        String extension = StringUtils.getFilenameExtension(filename);
        String storedFilename = System.currentTimeMillis() + "." + extension; //en principio, cada segundo de la vida es único, como únicos deben ser los nombres de ficheros...

        try(InputStream inputStream = file.getInputStream()){
            Files.copy(inputStream, this.rootLocation.resolve(storedFilename), StandardCopyOption,REPLACE_EXISTING);
            return storedFilename;
        }catch(IOException ioe){
            throw new RuntimeException("Error en escritura");
        }
    }

    public void delete(String filename) throws RuntimeException{
        try{
            Path file = rootLocation.resolve(filename);
            if(!File.exists(file)) throw new RuntimeException ("No existe el fichero");
            Files.delete(file);
        }catch(IOException ioe){
            throw new RuntimeException("Error en borrado");
        }
    }

    public Resource loadAsResource(String filename) throws RuntimeException{
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if(resource.exists() || resource.isReadable()) return resource;
            else throw new RuntimeException("Error IO");
        }catch(Exception e){throw new RuntimeException("Error IO");}
    }
}
```
>**NOTA:** El código, perteneciente al libro de referencia "Desarrollo Web en Entorno Servidor" de Fernando Rodríguez Diéguez, presenta un tipo de estructura común en la programación moderna. Se emplean bloques `if` que sirven de cortafuegos, en este caso finalizando el método al lanzar una excepción (aunque también se usan a veces con `return`). Aunque no es una forma académica, es relativamente frecuente y, además, puede ayudar a hacer el código más legible evitando bloques `if` anidados.

Si en alguna vista queremos mostrar un fichero guardado en el servidor, por ejemplo, una imagen, añadiríamos una etiqueta como esta `<img th:src="'/files/' + ${imagen}" width="64px">`, siendo `${imagen}` una varaible que contendrá el nombre con la que esté guardada la imagen. Finalmente, en el controlador, tendremos que recepcionar esa ruta y devolver al navegador la imagen:
```java
@GetMapping("/files/{filename:.+}")
public ResponseEntity<Resource> serveFile(@PathVariable String filename){
    Resource file = fileStorageService.loadAsResource(filename);
    return ResponseEntity.ok().body(file);
}
```
Podemos limitar el tamaño de los archivos que permitimos subir al servidor mediante estas dos propiedades en el archivo *application.properties*:
```bash
spring.servlet.multipart.max-file-size=256KB
spring.servlet.multipart.max-request-size=256KB
```
Si se sobrepasa el tamaño de los archivos, se producirá una `java.lang.IllegalStateException` que debemos tratar.

>**ACTIVIDAD 4:** Completa la actividad anterior permitiendo que las imágenes se almacenen en el servidor. Modifica las clases como necesites para que todo funcione correctamente.

>**ACTIVIDAD 5:** En este apartado aparecen, de golpe, varios elementos que no hemos tratado pero que son sencillos de emplear. Busca información en la [documentación oficial de Java](https://docs.oracle.com/en/java/) y la documentación oficial de [Spring Framework](https://docs.spring.io/spring-framework/docs/current/javadoc-api/index.html). Usa la documentación oficial sin asistencia de ninguna Inteligencia Artificial a ser posible (aunque puedes usar traductor).
> - Las clases `Path`, `Files`, perteneciente al paquete `java.nio.file`
> - Las clases pertenecientes a `springframework`:
>   - Resource
>   - UrlResource
>   - StringUtils
> - La clase `InputStream`.
> Con esa información, comenta el código del ejemplo para entenderlo en futuras consultas.

## 5. Envío de emails y ejecución asíncrona
Será bastante habitual que nuestras aplicaciones necesiten enviar emails, tanto a los usuarios externos como a los administradores de la aplicación cuando se produzcan ciertos eventos. Ejemplos típicos pueden ser formularios de contacto, la recepción de un pedido, etc.

Una opción para enviar emails sería la instalación de un servidor de correo, pero sería bastante compleja; tenemos una opción más sencilla que consiste en usar GMAIL como reenviador de emails, es decir, en vez de enviar nosotros el email, le diremos a Gmail que lo haga por nosotros.

Como requisito solo precisamos tener una cuenta de Google con la verificación en dos pasos activada y que disponga de una contraseña de aplicaciones. Tienes más información en [este enlace sobre el proceso](https://support.google.com/accounts/answer/185833?hl=es). 

El proceso es muy sencillo, ya que simplemente debemos invocar una función a la que le pasamos como parámetro el destinatario, asunto del mensaje, cuerpo del mensaje y, opcionalmente, archivos adjuntos. Lo habitual será crear una clase de servicio que incluya esta función, y que podrá ser invocada desde cualquier punto de la aplicación.

### 5.1 Enviar emails con Gmail paso a paso.
1. Añadir la dependencia *starter-mail* en el pom.xml:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```
2. Configuración del *application.properties*
```yml
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username= #[correo de GMAIL con verificación en dos pasos]
spring.mail.password= #[contraseña de aplicaciones, no pass de usuario]
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeour=5000
```

3. Crear el servicio con método que realiza el envío.

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
            helper.setText(textMessage, true);
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

4. Podemos llamar a este método desde cualquier punto de la aplicación, inyectando el servicio *EmailService* y llamando al método anterior. El cuerpo del mensaje admite etiquetas HTML que se reflejarán en el email recibido.

```java
@Autowired
private EmailService emailService;
String cuerpoMensaje = "<h1>Cuerpo del mensaje</h1>";
String destinatario ="miemail@email.com";
String asunto = "Asunto del mensaje";
boolean envioEmail = emailService.enviarEmail(destinatario, asunto, cuerpoMensaje);
if(envioEmail)...
```
Podemos modificar el método de servicio para enviar a varios destinatarios, ya que el método *helper.setTo* puede recibir un `String` para un destinatario o bien un `String[]` para varios.

5. Podemos también enviar uno o más ficheros adjuntos, para ello, pasaremos como parámetro al método el nombre del archivo (o un array con los nombres de los archivos) a enviar y añadiremos un segundo parámetro al objeto *MimeMessageHelper* con valor *true*. Finalmente, adjuntaremos el o los archivos mediante el método addAttachement.

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

Para varios, simplemente el `attachment` sería un String[] y lo recorreríamos así:

```java
for(String att : attachments){
    File adjunto = new File(att);
    helper.addAttachment(adjunto.getName(), adjunto);
}
```

### 5.2 Ejecución asíncrona

Tal y como lo hemos planteado, el envío del correo puede tardar unos segundos. Si no queremos que el navegador del cliente se quede a la espera de que el envío sea efectivo, podemos hacer un envío asíncrono. De esta forma, se devolverá el control a la línea de código posterior al envío de correo de forma inmediata, sin espera alguna. En este caso, no podremos confirmarle al cliente si el correo se ha enviado correctamente o no. Para hacer una llamada asíncrona, deberemos hacer las siguientes modificaciones en nuestro código:
- Añadir a la clase main, además de `@SpringBootApplication`, la anotación `@EnableAsync`.
- Añadir al método que hace el envío del email la anotación `@Async`. Este método deberá devolver void ya que no se esperará a su finalización y, por tanto, no puede devolver nada.

```java
@Async
public void sendEmail(String destination, String subject, String textMessage)
```

>**ACTIVIDAD 6:** Permite que usuarios con email se puedan suscribir a un compositor. Crea un botón en la página del compositor que envíe a una vista `suscribirseAlCompositorView` en la que se le pida al interesado su nombre de usuario y su email, que se guardará en un `.csv` de subscriptores, teniendo en cuenta que no haya ningún email repetido. 
>
> Cada vez que se haga un cambio en el perfil del compositor (una edición), los suscriptores serán notificados. Si, además, se ha añadido alguna imagen nueva al compositor, esa imagen será enviada como parte del contenido del mensaje.
>
> En el email, además, habrá un enlace a la vista `anularSuscripciónAlCompositorView` en el cual **habrá un botón** que permita que el usuario se borre de la suscripción (es decir, que su línea en el `.csv` sea borrada). 
>
> Haz que el envío del email se haga con una función asíncrona.