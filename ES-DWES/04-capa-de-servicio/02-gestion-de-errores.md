# Gestión de errores

## Gestión de errores en Spring

Los servicios pueden incurrir en distintas situaciones de error: puede ser porque los parámetros recibidos no tengan los valores esperados, porque los cálculos que pretende realizar no se puedan lleva a cabo, porque cuando accede a repositorios de datos, estos datos no estén disponibles, o bien por muchas otras razones.

Cuando un servicio se encuentra en una situación de error, lo más correcto es que se lance una excepción y que esta sea capturada por el método que llamó al servicio, que generalmente será un método de controlador o bien otro método de servicio.

## Manejo de excepciones a través de una vista específica

A continuación, se muestra una clase de servicio, con un solo método, que calcula el valor de la hipotenusa a partir de sus dos catetos. En el caso de que alguno de los catetos sea negativo lanza una excepción:
```java
@Service
public class MathService{
    public Double calcularHipotenusa (Double cat1, Double cat2) throws RuntimeException{
        if(cat1 <= 0 || cat2 <= 0) throw new RuntimeException("Error en parámetros de entrada");
        return Math.hypoth(cat1, cat2);
    }
}
```

Podríamos haber creado una excepción propia en vez de lanzar la genérica `RuntimeException` pero, por ahora, el planteamiento visto es suficiente. A continuación, desde el controlador, se llamará al método de servicio capturando la excepción.
```java
@GetMapping("/calcularHipotenusa/{cat1}/{cat2}")
public String showHipot(@PathVariable Double cat1, @PathVariable Double cat2, Model model){
    try{
        model.addAttribute("resultado", mathService.calcularHipotenusa(cat1, cat2));
        return "resultadoView";
    }catch(RuntimeException ex){
        model.addAttribute("txtError", ex.getMessage());
        return "errorView";
    }
}
```
En este caso, al capturar la excepción, envía al usuario una vista de error que informará al usuario del problema ocurrido a través de esa variable "txtError". No tiene por qué ser una vista propia para los errores, sino que en la vista inicial (en este caso, `indexView.html`) podemos añadir esa misma variable y, con Thymeleaf, mostrarla en caso de que no sea nula.

> **ACTIVIDAD:**
> Crea una vista "errorView" para el proyecto *MyFavouriteComposer* que responda a las excepciones capturadas al crear un compositor o una pieza. En la vista errorView, debe aparecer un enlace que nos lleve de nuevo al índice y otro al formulario de crear el elemento.

## Manejo de excepciones mediante redirecciones

Este planteamieno no funciona si la respuesta devuelta por el controlador no es una vista, sino que hace un redirect a otro *mapping*, ya que en este caso no podemos pasar nada por el  *model*. Una solución para esta situación sería pasarle el *mapping*, mediante parámetro, con un código de error (o incluso el propio texto de la excepción) y que sea el método del controlador el que lo procese. En la excepción haríamos.

```java
try{ (...) }
catch(RuntimeException ex){
    return "redirect:/home?err=1";
}
```

Y en el controlador que muestra la vista:

```java
@GetMapping("/home")
public String showHome(@RequestParam (required = false) Integer err, Model model){
    if (err !=null) model.addAttribute("txtErr", "Error en parámetros");
    return "indexView";
}
```

> **ACTIVIDAD:**
> Utiliza este método de redirección y paso de parámetros para controlar los errores de *MyFavouriteComposer* en los formularios de edición. Debes catalogar los errores y devolver al formulario de edición, indicando arriba del formulario, en rojo, el error que ha ocurrido.
> - SUGERENCIA: Utiliza un switch-case para gestionar los códigos de errores.

## Seguimiento de errores a través de variables "globales"

Un inconveniente de esta opción es que "perdemos" el mensaje de la excepción generada, ya que al usar *redirect*, al *mapping* destino solo le llegan los parámetros, pero no el *model*. Una solución a este problema sería que el controlador tuviese una variable "global" (*técnicamente, es una atributo del controlador global a todos los métodos del mismo)* accesible por todos los *mapping* y que el `try..catch` le asigne el mensaje de la excepción a esa variable: así el *mapping* que devuelve la vista, puede incorporar al *model* el texto de la excepción a través de esa variable global.

```java
@Controller
public class MathController {
    @Autowired
    private MathService mathService;
    private String txtError = null;

    @GetMapping("/calcularHipotenusa/{cat1}/{cat2}")
    public String showHipot(@PathVariable Double cat1, @PathVariable Double cat2, Model model){
    try{
        model.addAttribute("resultado", mathService.calcularHipotenusa(cat1, cat2));
        return "resultadoView";
    }catch(RuntimeException ex){
        txtError = ex.getMessage();
        return "redirect:/home";
    }
    @GetMapping("/home")
    public String showHome(@RequestParam (required = false) Integer err, Model model){
        if (txtError !=null){ 
            model.addAttribute("txtErr", txtError);
            txtError = null; // vaciamos la variable para poder usar de nuevo y que no salte el error
        }
        return "indexView";
    }
}
```

Esa variable puede servir para cualquier tipo de mensaje que queramos incorporar (podemos llamarla *status* o similar). Para probar este ejemplo del cálculo de la hipotenusa con control de errores, la vista `indexView` debe gestionar esta variable *txtError*.


```html
<body>
    <h3>Cálculos de hipotenusa</h3>
    Cateto 1: <input type ="text" id="cateto1"/>
    Cateto 2: <input type ="text" id="cateto2"/>
    <button onclick="calcularHipotenusa()">Calcular</button>
    <div th:if="${txtErr!=null}">
        <!-- OPCIONAL: USAMOS BOOTSTRAP con WEBJARS para mostrar clases de error -->
        <p class="alert alert-danger" role="alert" th:text="${txtErr}">error</p>
    </div>
    <script>
        function calcularHipotenusa(){
            var cateto1 = document.querySelector("#cateto1").value;
            var cateto2 = document.querySelector("#cateto2").value;
            globalThis.location.href="/calcularHipotenusa/" + cateto1 + "/" + cateto2;
        }
    </script>
</body>
```

>**ACTIVIDAD:**
> Adapta la actividad anterior añadiendo la variable global para controlar el mensaje de error.

>**ACTIVIDAD:**
> Elige qué forma de validar los errores quieres para tu proyecto. Puedes combinar las dos maneras o decantarte solamente por una en favor de la otra. En cualquier caso, valora los pros y los contras de los enfoques que plantees y justifica por qué seleccionas uno frente a los otros.

### Problemas de usar una variable “global” en el controlador

Aunque el enfoque de la variable global es sencillo y útil para proyectos pequeños, puede ser fuente de problemas en proyectos más grandes. Los controladores Spring MVC son singletons por defecto. Eso significa que una única instancia del controlador atiende muchas peticiones concurrentes. Si se guarda el mensaje de error en un campo (`private String txtError`), **esa misma variable se comparte entre todas las peticiones y usuarios**. Dos usuarios A y B pueden provocar errores casi simultáneamente. Si la petición A escribe `txtError = "A falló"` y antes de que se lea B escribe `txtError = "B falló"`, el usuario A podría ver el error de B. Resultado: mensajes incorrectos, fallos intermitentes difíciles de depurar.

Además, se trata de una solución poco escalable. En entornos con múltiples instancias del servicio (clústeres), la variable local en memoria no se sincroniza entre instancias. Por último, es difícil de testear y mantener, ya que un estado mutable compartido hace tests menos deterministas y el comportamiento es más frágil.

## Gestión de errores `@ControllerAdvice` y `@ExceptionHandler`

`@ControllerAdvice` es una anotación del *Spring Framework* que se utiliza para definir un manejador global de excepciones, permitiendo gestionar errores en toda la aplicación desde un único punto centralizado. **`@ControllerAdvice` permite centralizar el manejo de errores de todos los controladores en una sola clase**, evitando tener que repetir try-catch en cada método. Dentro de esta clase, usamos métodos con `@ExceptionHandler` para indicar qué hacer cuando se produce una excepción concreta (por ejemplo, mostrar una vista de error y enviar un mensaje al usuario).

De esta manera, si un servicio lanza una excepción, no es necesario capturarla en el controlador correspondiente: el método marcado con `@ExceptionHandler` se ejecutará automáticamente. Esto mejora la organización del código y facilita mantener y modificar el manejo de errores. La anotación `@ExceptionHandler` recibe como parámetro la clase de la excepción que queremos manejar.

Para verlo más claro, observemos el siguiente ejemplo:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    // Para excepciones de negocio
    @ExceptionHandler({RuntimeException.class})
    public String handleRuntimeException(RuntimeException ex, Model model) {
        model.addAttribute("txtErr", ex.getMessage());
        return "errorView";
    }

    // Para excepciones específicas
    @ExceptionHandler(ComposerNotFoundException.class)
    public String handleNotFound(ComposerNotFoundException ex, Model model) {
        model.addAttribute("txtErr", "No se encontró el compositor: " + ex.getId());
        return "errorView";
    }
}
```

Existen otras formas de manejar errores, pero de momento no vamos a trabajarlas.

> **ACTIVIDAD**
> Crea un `@ControllerAdvice` para gestionar los errores de manera global en el proyecto *MyFavouriteComposer*
