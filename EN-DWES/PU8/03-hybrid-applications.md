# Hybrid applications

## 1. API consumption

As we have been discussing throughout this topic, REST APIs are applications that are made available to other applications so they can consume resources through the HTTP protocol. Some of the most common clients are web applications with JavaScript. There are several ways to call a REST API from JavaScript. These are the four most common:

* `XMLHttpRequest`: it is a classic standard and the basic element on which AJAX and other frameworks and libraries are based:

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

* `Fetch`: Similar to the previous one, but with simpler notation and based on promises. It is the most widely used nowadays, relying on async/await to manage those promises in a simple way:

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

The other two ways are through jQuery and Axios, but both libraries are falling into disuse: the former because its functionalities have been incorporated into standard JavaScript (making it redundant), and the latter because `fetch` has gained popularity due to its simplicity.

You can check more examples in the projects included in the course.

### 1.1 CORS

If we try the previous examples from outside the server, we will get a CORS-type security error and we will not be able to execute them correctly.

Cross-Origin Resource Sharing (CORS) is a mechanism that uses additional HTTP headers to allow a client to obtain permission to access selected resources from a server at a different origin (domain). In the previous example this happens because the request from JavaScript is not located on localhost.

For security reasons, Spring Boot applications restrict cross-origin HTTP requests initiated within an external script. If we placed the client application in the `resources/static` folder, we would not have this problem.

In any case, to avoid this error we must configure the WebMvcConfigurer bean, where we can filter allowed origins by HTTP verb, allowed headers, and, above all, allowed origin domains: once our client application is deployed on a server, that should be the only allowed origin. For simplicity, we will implement a global configuration that allows any type of access.

Obviously, this configuration is less secure, but simpler. We would create a class annotated with `@Configuration` with the following content:

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

> **ACTIVITY 1:** Create a small JavaScript client that consumes the MyFavouriteComposer API. Configure it to avoid CORS conflicts. You can use Express as a web server, as explained in these [**notes**](https://nachoiborraies.github.io/nodejs/md/es/03b), or any other technology you have worked with in other modules of the course (but that uses JavaScript).

## 2. Hybrid applications

A hybrid web application is one that combines its own components (such as those we have been developing) with resources and services from other websites or external applications. This paradigm offers multiple advantages:

* **Rapid integration of external functionalities:** taking advantage of third-party APIs allows our application to offer advanced functionalities (such as online payments, maps, data analysis, etc.) without having to develop them from scratch.
* **Real-time data updates:** by consuming external APIs, our application can access real-time data, such as weather services, exchange rates, or news. This is especially useful in applications that depend on continuously updated information.
* **Scalability and flexibility:** we can expand the functionalities of our application with additional services as new needs arise, without modifying the basic architecture, simply by adding new APIs.
* **Less maintenance and load on our server:** by delegating specific functionalities to external services, our own backend can remain simpler and lighter, reducing maintenance load. This can improve performance and efficiency.
* **Use of specialized resources:** we can use services that provide advanced functionalities through specialized APIs, allowing the application to benefit from advanced technologies without needing deep technical expertise in them.

### 2.1 RestClient

Communication with these external services is mainly done through HTTP requests to the APIs of these sites, in the opposite way to what was discussed about REST APIs. With REST APIs, the resources of our server application were made available to other developers, whether clients such as browsers or mobile devices, or other server-side applications. Now it will be our application that consumes resources from other applications, and for this we have a component called RestClient. Obviously, the resources we consume must follow the REST standard, but they do not necessarily have to be developed with SPRING; for our application that will be irrelevant.

RestClient is an interface that represents the main entry point for making web requests. It is a novelty of Spring 6.1 and replaces Spring 5’s WebClient, which in turn replaced the previous RestTemplate. WebClient followed reactive programming principles and belonged to the spring-webflux library, so it was necessary to add the starter-webflux dependency, which is not required for the current RestClient.

We have several ways to use RestClient:

* The static `.create()` method of WebClient.

```java
RestClient restClient = WebClient.create();
```

* The static `.create(String uri)` method of RestClient:

```java
String baseUri = "https//jsonplaceholder.typicode.com";
RestClient restClient = RestClient.create(baseUri);
```

* The `.builder()` method:

```java
RestClient restClient = RestClient.builder().
    baseUrl("https://jsonplaceholder.typicode.com").
    defaultHeader(HttpHeaders.AUTHORIZATION, encodeBasic("username", "password")).
    build();
```

> [https://jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) is a very useful fake API service for testing. It allows you to query a list of tasks via the "/todos" path, query a specific task via "/todos/{id}", add a new task via "/todos/" with POST, etc.

Then, on that instance we can call its get, post, etc. methods that invoke the corresponding HTTP verbs:

```java
String result = restClient.get().
                    uri("/todos/3").
                    retrieve().
                    body(String.class);
System.out.println(result);
```

If we want to obtain not only the body, but a complete response with headers and status codes, we can add the `toEntity` method to the request:

```java
ResponseEntity<String> result = restClient.get().
                    uri("/todos/3").
                    retrieve().
                    toEntity(String.class);

System.out.println("Status" + result.getStatusCode());
System.out.println("Headers" + result.getHeaders());
System.out.println("Contents" + result.body());
```

RestClient can also convert JSON responses to objects.

```java
Todo todo = restClient.get()
    .uri("/todos/{id}", id)
    .accept(APPLICATION_JSON)
    .retrieve()
    .body(Todo.class);
```

When what is returned is a generic class, for example `List`, we can use the abstract class `ParameterizedTypeReference` so that it infers the real type for us. In the following example, we would obtain a `List` of `Todo`.

```java
List<Todo> todos = restClient.get()
    .uri("/todos/")
    .accept(APPLICATION_JSON)
    .retrieve()
    .body(new ParameterizedTypeReference<>(){});
```

If we want to do a POST or PUT, the request is analogous:

```java
//create the todo
ResponseEntity<Void> response = restClient.post()
    .uri("/todos/")
    .accept(APPLICATION_JSON)
    .body(todo)
    .retrieve()
    .toBodilessEntity();
```

And for deletion:

```java
ResponseEntity<Void> response = restClient.delete()
    .uri("/todos/1")
    .retrieve().toBodilessEntity();
```

When an error occurs (4xx or 5xx codes), RestClient throws a subclass of RestClientException, although this behavior can be modified by us by adding `onStatus`:

```java
String result = restClient.get()
    .uri("/wrong-url")
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (request, response)->{
        throw new MyCustomRuntimeException(response.getStatusCode(), response.getHeaders());

    }).body(String.class);
```

You can see a complete example with RestClient in the included projects.

> **ACTIVITY 2:** Build a hybrid web application with Spring MVC, using Thymeleaf. The website has a view in which an amount can be entered (an input=text) and two dropdown lists with 4 types of currency (Euro, Pound sterling, Yen, and US Dollar), one for the source currency and another for the destination currency, as well as a submit button. When the form is submitted, the exchange rate for the source/destination currency will be queried and another view will display the resulting amount after applying the exchange to the entered amount.
>
> To obtain the exchange rate, the external API [https://api.frankfurter.dev/](https://api.frankfurter.dev/) will be used, with a URL that must have a format like this: `http://api.frankfurter.dev/v1/latest?from=XXX&to=YYY`. The possible source (XXX) and destination (YYY) currencies will be: EUR, GBP, JPY, USD, for example `http://api.frankfurter.dev/v1/latest?from=EUR&to=GBP`.
>
> The class returned by the API has a structure like this:
>
> ```java
> @Getter
> @Setter
> public class CambioData{
>    private float amount;
>    private String base;
>    private String date;
>    private HashMap<String, Float> rates;
> }
> ```
>
> The key of the map being the destination currency and the value the exchange rate.

### 2.2 Public external resources

There are multiple public services that we can access, for free, with valuable and up-to-date information.

To access these sites there are various possibilities regarding the authentication of our application on the external server:

* **No authentication:** This is the simplest case, in which no authentication is required; we directly execute the request.
* **API keys:** one of the most common options; a key is requested once from the API provider, obtaining a token or unique key, which must be attached to all requests made from that moment on.
* **Authentication tokens:** In this case, we must authenticate in each session with the provider, and the provider will generate a token valid only for that session, which must be sent with each request.
* **OAuth:** Similar to the previous one, but with a protocol that provides a higher level of security.

Check out different public APIs at [https://github.com/public-apis/public-apis](https://github.com/public-apis/public-apis).

> **EXTENSION ACTIVITY:** Load the music of MyFavouriteComposer using an external API, such as [https://openwhyd.github.io/openwhyd/API](https://openwhyd.github.io/openwhyd/API). You can use others such as Deezer or Spotify, but they require authentication. Make each composer display a list of their musical pieces. You can use the Spring MVC application to reuse the views.

## 3. External code libraries

The use of external code developed by third parties will allow us to incorporate advanced functionalities and save development time. These libraries, also known as dependencies, are included in the pom.xml file. So far, we have been using official libraries, but libraries of any kind can be used.

The use of code libraries presents the following advantages:

* **Savings in development time and resources**.
* **Use of advanced functions** without having the knowledge or experience in the field of the library, for example, artificial intelligence algorithms, data processing, etc.
* **Quality and security**: Being public code, it is usually secure, well tested, and well documented, with regular updates for bugs and security vulnerabilities.
* **Standardization**: Using well-known libraries helps keep the code within widely accepted standards, making it more understandable and easier to maintain.

As disadvantages:

* **Third-party dependency**: By using an external library, we depend on the team that developed it for updates and fixes.
* **Size and performance**: Sometimes, adding external libraries can increase the size of the project, slow down application performance, or even cause conflicts between different libraries.

Although we are not going to work with them during the course, the reference book presents a section on Big Data libraries and how to use them. You have the project among the attached projects.

> **ACTIVITY 3:** Investigate the `Big Data Libraries` project from the attached projects.
>
> * What libraries does it use?
> * What is the purpose of the .csv file included in the data folder?
> * Analyze what the `DiabetesPredictionService` service does, method by method.
> * Analyze the views and controllers.
>   All the information is available in the book, but try to solve it on your own before consulting anything.
