# Aplicaciones híbridas, librerías de código externo y seguridad en API REST

## 1. Consumo de API

Como llevamos comentando a lo largo de este tema, las API REST son aplicaciones que están a disposición de otras aplicaciones para que consuman los recursos a través del protocolo HTTP. Unos de los clientes más habituales serán aplicaciones web con JavaScript. Existen varias formas de llamar a una API REST desde JavaScript. Estas serían las cuatro más habituales:

* `XMLHttpRequest`: es un estándar clásico y el elemento básico en el que se basa AJAX y otros frameworks y librerías:
```javascript
var xhttp = new XMLHttpRequest()
xhttp.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200){
        console.log(JSON.parse(this.responseText))
    }
}
xhttp.open("GET", "http://localhost:9000/empleado", true)
xhttp.setRequestHeader("Content-type", "application/json")
xhttp.send(null)
```
* `Fetch`: Similar al anterior, pero con una notación más sencilla y basada en promesas. Es la más empleada actualmente, apoyándonos en async await para gestionar esas promesas de una forma sencilla:
```javascript
const BASE_URL = 'http://localhost:9000'
async function api_get(getURL){
    try{
        const response = await fetch(BASE_URL + getURL)
        if(!response.ok){
            const textErr = await response.text()
            throw new Error(textErr)
        }
        return await response.json()
    }catch(error){
        console.error('Error al obtener datos:', error)
        return false
    }
}
async function api_put(putURL, id, data){
    try{
        const response = await fetch(BASE_URL + putURL + id,
            {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            }
        )
        if(!response.ok){
                const textErr = await response.text()
                throw new Error(textErr)
            }
        return await response.json()
    }catch(error){
        console.error('Error al modificar datos:', error)
        return false
    }
}
```

Las otras dos formas son mediante JQuery y Axios, pero ambas librerías están cayendo en desuso, la primera porque sus funcionalidades se han ido incorporando al javascript estándar (convirtiéndola en redundante) y la segunda porque `fetch` le ha ganado en popularidad debido a su sencillez.

Puedes consultar más ejemplos en los proyectos añadidos en el curso.

### 1.1 CORS

Si probamos los ejemplos anteriores desde fuera del servidor, obtendremos un erro de seguridad de tipo CORS y no podremos ejecutarlos correctamente.

El intercambio de recursos de origen cruzado (CORS) es un mecanismo que utiliza cabeceras HTTP adicionales para permitir que un cliente obtenga permiso para acceder a recursos seleccionados desde un servidor, en un origen distinto (dominio). En el ejemplo anterior ocurre esto, ya que la petición desde JavaScript no está ubicada en localhost.

Por razones de seguridad, las aplicaciones Spring Boot restringen las solicitudes HTTP de origen cruzado iniciadas dentro de un script externo. Si ubicásemos la aplicación cliente en la carpeta `resources/static` no tendríamos ese problema.

De todas formas, para evitar este error debemos configurar el bean WebMvcConfigurer en el que podemos filtrar los orígenes permitidos a nivel verbo HTTP, cabeceras permitdas y, sobre todo, los dominios de origen permitidos: una vez que nuestra aplicación cliente esté desplegada en un servidor, debería ser ese el único origen permitido. Por simplicar, implementaremos una configuración global que permita cualquier tipo de acceso.

Obviamente esta configuración es menos segura, pero más simple. Haríamos una clase anotada con `@Configuration` con el siguiente contenido:

```java
@Configuration
public class CorsConfig{
    @Bean
    public WebMvcConfigurer corsConfigurer(){
        return new WebMvcConfigurer(){
            @Override
            public void addCorsMappings(CorsRegistry registry){
                registry.addMapping("/**").
                    allowedOrigins("*").
                    allowedMethods("*").
                    allowedHeaders("*");
            }
        };
    }
}
```
> **ACTIVIDAD 1:** Crea un cliente pequeño en javascript que consuma la API de MyFavouriteComposer. Configúralo para evitar conflictos de CORS. Puedes usar como servidor web Express, tal y como se explica en estos [**apuntes**](https://nachoiborraies.github.io/nodejs/md/es/03b), o cualquier otra tecnología que hayas trabajado en otros módulos del curso (pero que usen javascript).

## 2. Aplicaciones híbridas

Una aplicación web híbrida es aquella que combina componentes propios (como los que hemos ido desarrollando) con recursos y servicios de otros sitios web o aplicaciones externas. Este paradigma ofrece múltiples ventajas:

* **Integración rápida de funcionalidades externas:** aprovechar API de terceros permite que nuestra aplicación ofrezca funcionalidades avanzadas(como pagos en línea, mapas, análisis de datos, etc.) sin necesidad de desarrollarlas desde cero.
* **Actualización de datos en tiempo real:** al consumir API externas, nuestra aplicación puede acceder a datos en tiempo real, como servicios metereológicos, tasas de cambio o noticias. Esto es especialmente útil en aplicaciones que dependen de información actualizada de manera continua.
* **Escalabilidad y flexibilidad:** podemos ampliar las funcionalidades de nuestra aplicación con servicios adicionales a medida que surgen nuevas necesidades, sin modificar la arquitectura básica, simplemente añadiendo las nuevas API.
* **Menos mantenimiento y carga en nuestro servidor:** al delegar funcionalidades específicas a servicios externos, el backed propio puede mantenerse más simple y ligero, reduciendo la carga de mantenimiento. Esto puede mejorar el rendimiento y la eficiencia.
* **Aprovechamiento de recursos especializados:** podemos usar servicios que proporcionan funcionalidades avanzadas mediante API especializadas, lo cual permite que la aplicación se beneficie de tecnologías avanzadas sin necesidad de tener experiencia técnica profunda en ellas.

### 2.1 RestClient

La comunicación con estos servicios externos se hace principalmente mediante solicitudes HTTP hacia las API de estos sitios, de forma inversa a lo comentado sobre API REST. Con API REST los recursos de nuestra aplicación servidor se ponían a disposición de otros desarrolladores, bien clientes como navegadores o dispositivos móviles, bien otras aplicaciones de entorno servidor. Ahora será nuestra aplicación la que consuma recursos de otros aplicativos y, para ello, disponemos de un componente llamado RestClient. Obviamente los recursos que consumimos deberán seguir el estándar REST, pero no necesariamente estarán desarrolladas con SPRING, para nuestra aplicación eso será indiferente.

RestClient es una interfaz que representa el punto de entrada principal para hacer peticiones web. Es una novedad de Spring 6.1 y sustituye a WebClient de Spring 5, que a su vez sustituía a la anterior RestTemplate. WebClient seguía los principios de programación reactiva y pertenecía a la librería spring-webflux, por lo que había que añadir la dependencia starter-webflux, no siendo necesaria para la actual RestClient.

Tenemos varias formas de usar RestClient:
* El método estático .create() de WebClient.
```java
RestClient restClient = WebClient.create();
```
* El método static .create(String uri) de RestClient:
```java
String baseUri = "https//jsonplaceholder.typicode.com";
RestClient restClient = RestClient.create(baseUri);
```
* El método `.builder()`:
```java
RestClient restClient = RestClient.builder().
    baseUrl("https://jsonplaceholder.typicode.com").
    defaultHeader(HttpHeaders.AUTHORIZATION, encodeBasic("username", "password")).
    build();
```
> https://jsonplaceholder.typicode.com es un servicio de API fake muy útil para pruebas. Permite consultar una lista de tareas mediante la ruta "/todos", consultar una tarea concreata mediante "/todos/{id}", añadir una nueva tarea mediante "/todos/" con post, etc.

Luego, sobre esa instancia podemos llamar a sus métodos get, post, etc. que invocan los correspondientes verbos HTTP:
```java
String result = restClient.get().
                    uri("/todos/3").
                    retrieve().
                    body(String.class);
System.out.println(result);
```
Si queremos obtener no solo el body, sino una respuesta completa, con cabeceras y códigos de estado, podemos añadir el método toEntity a la petición:
```java
ResponseEntity<String> result = restClient.get().
                    uri("/todos/3").
                    retrieve().
                    toEntity(String.class);

System.out.println("Status" + result.getStatusCode());
System.out.println("Headers" + result.getHeaders());
System.out.println("Contents" + result.body());
```
RestClient puede convertir también las respuestas JSON a objetos.
```java
Todo todo = restClient.get()
    .uri("/todos/{id}", id)
    .accept(APPLICATION_JSON)
    .retrieve()
    .body(Todo.class);
```
Cuando lo que devuelve es una clase genérica, por ejemplo, `List`, podemos usar la clase abstracta `ParameterizedTypeReference` para que él infiera el tipo real por nosotros. En el siguiente ejemplo, obtendríamos un `List` de `Todo`.
```java
List<Todo> todos = restClient.get()
    .uri("/todos/")
    .accept(APPLICATION_JSON)
    .retrieve()
    .body(new ParameterizedTypeReference<>(){});
```
Si queremos hacer un POST o PUT, la petición es análoga:
```java
//creamos el todo
ResponseEntity<Void> response = restClient.post()
    .uri("/todos/")
    .accept(APPLICATION_JSON)
    .body(todo)
    .retrieve()
    .toBodilessEntity();
```
Y para borrado:

```java
ResponseEntity<Void> response = restClient.delete()
    .uri("/todos/1")
    .retrieve().toBodilessEntity();
```

Cuando se produce un error (códigos 4xx o 5xx), RestClient lanza una subclase de RestClientException, aunque este comportamiento puede ser modificado por nosotros añadiendo onStatus:
```java
String result = restClient.get()
    .uri("/wrong-url")
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (request, response)->{
        throw new MyCustomRuntimeException(response.getStatusCode(), response.getHeaders());

    }).body(String.class);
```

Puedes ver en los proyectos incluidos un ejemplo completo con RestClient.

> **ACTIVIDAD 2:** Construye una aplicación web híbrida con Spring MVC, usando Thymeleaf. La web tiene una vista en la cual se puede introducir un importe (un input=text) y dos listas desplegables con 4 tipos de moneda(Euro, Libra esterlina, Yen y Dolar estadounidense), una para las monedas de origen y otra para las monedas de destino, además de un botón de enviar. Cuando se envíe el formulario, se consultará la cotización de la moneda origen/destino y se mostrará en otra vista el importe resultante de aplicar el cambio sobre el importe introducido.
>
> Para obtener la cotización se empleará la API externa: https://api.frankfurter.dev/, con una URL que deberá tener un formato así: `http://api.frankfurter.dev/v1/latest?from=XXX&to=YYY`. Las posibles monedas de origen (XXX) y destino serán: EUR, GBP, JPY, USD, por ejemplo `http://api.frankfurter.dev/v1/latest?from=EUR&to=GBP`.
>
> La clase que devuelve la API tiene una estructura así:
> ```java
> @Getter
> @Setter
> public class CambioData{
>    private float amount;
>    private String base;
>    private String date;
>    private HashMap<String, Float> rates;
>}
>```
> Siendo la clave del mapa la moneda de destino y el valor la tasa de cambio.

### 2.2 Recursos externos públicos

Existen múltiples servicios públicos que podemos acceder, de forma gratuita, con información valiosa y actualizada.

Para el acceso a dichos sitios existen diversas posibilidades en cuanto a la autentificación de nuestra aplicación en el servidor externo:
* **Sin autentificación:** Este es el caso más sencillo, en el que no se solicita autentificación alguna, directamente ejecutamos la petición.
* **Claves API:** es uno de los más habituales, se solicita una sola vez una clave al proveedor de la API, obteniendo un token o clave única, donde debemos adjuntar todas las peticiones que hagamos a partir de ese momento.
* **Tokens de autenticación:** En este caso, debemos autentificarnos en cada sesión en el proveedor y el proveedor generará un token válido solo para esa sesión, que deberá enviarse con cada solicitud.
* **OAuth:** Es similar al anterior, pero con un protocolo que proporciona un nivel de seguridad más alto.

Consulta distintas API pública en https://github.com/public-apis/public-apis.

> **ACTIVIDAD DE AMPlIACIÓN:** Carga la música de MyFavouriteComposer utilizando una API externa, como por ejemplo https://openwhyd.github.io/openwhyd/API. Puedes utilizar otras como Deezer o Spotify, pero requieren autentificación. Haz que en cada compositor salga una lista de piezas musicales suyas. Puedes emplear la aplicación Spring MVC para reutilizar las vistas.

## 3. Librerías de código externo

El uso de código externo desarrollado por terceros va a permitir incorporar funcionalidades avanzadas y ahorrar tiempo de desarrollo. Estas librerías, también conocidas como dependencias, se incorporan en el archivo pom.xml. Hasta ahora, hemos estado usando librerías oficiales, pero se pueden usar de cualquier tipo.

El uso de librerías de código presenta las siguientes ventajas:

* **Ahorro en tiempo y recursos de desarrollo**.
* **Uso de funciones avanzadas** sin disponer de los conocimientos ni experiencia en el ámbito de la librería, por ejemplo, algoritmos de inteligencia artificial, procesamiento de datos, etc.
* **Calidad y seguridad**: Al ser un código público suele ser seguro, muy probado y bien documentado, con actualizaciones regulares de errores y brechas de seguridad.
* **Estandarización**: Usar librerías reconocidas ayuda a que el código se mantenga en estándares ampliamente aceptados, más comprensible y fácil de mantener.

Como inconvenientes:

* **Depedencia de terceros**: Al usar una librería externa, dependemos del equipo que la ha desarrollado, para actualizaciones y correcciones.
* **Peso y rendimiento**: En ocasiones, añadir librerías externas puede aumentar el tamaño del proyecto, ralentizar el rendimiento de la aplicación o incluso presentar conflictos entre distintas librerías.

Aunque no vamos a trabajarlas durante el curso, en el libro de referencia se presenta un apartado sobre librerías de Big Data y cómo usarla. Tienes el proyecto entre los proyectos adjuntos.
> **ACTIVIDAD 3:** Investiga el proyecto de `Librerías de Big Data` de los proyectos adjuntos. 
> * ¿Qué librerías emplea?
> * ¿Para qué sirve el archivo .csv incluido en la carpeta data?
> * Analiza lo que hace el servicio `DiabetesPredictionService`, método a método.
> * Analiza las vistas y los controladores.
> Toda la información está disponible en el libro, pero intenta resolverlo por tus propios medios antes de consultar nada. 