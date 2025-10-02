# Práctica evaluable

## Conceptos previos

Antes de comenzar con la práctica, vamos a terminar de ver dos conceptos breves, la interfaz WebMvcConfigurer y la creación de páginas de error personalizadas.

### Interfaz WebMvcConfigurer

Esta interfaz permite configurar aspectos básicos del funcionamiento de nuestra aplicación. Más adelante la emplearemos para evitar problemas de seguridad CORS, pero también podemos indicarle mappings directos entre una ruta y la vista que se mostrará, evitando tener que desarrollar el método controlador. Solo será válido cuando no se le pase a la vista ningún dato, es decir, cuando sea una vinculación directa entre ruta y vista, sin nada más.

Para implementar esta interfaz, crearemos una clase con la anotación`@Configuration` (para que se ejecute al iniciar la aplicación) y que implemente los métodos de configuración que nos interesen, en este caso `addViewController()`:
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

La clase puede tener el nombre que quieras. En este caso, si el usuario solicita la ruta */quienesSomos*, le mostrará la vista */quienesView.html*. A efectos prácticos, esa clase sustituye al siguiente controlador:

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

No es exactamente lo mismo, ya que con `@Configuration` el mapeo de rutas a vistas queda registrado en el arranque de la aplicación como una asociación fija y sin lógica adicional, mientras que con un `@Controller`, aunque los mapeos también se registran al inicio, es posible ejecutar código cada vez que se recibe la petición y, por tanto, devolver datos dinámicos junto con la vista.

La clase que implemente `WebMvcConfigurer`, como todas las del proyecto, debe estar en el paquete raíz o subpaquete. En algunos casos verás que esta clase también está anotada con `@EnableWebMvc`, pero, con Spring Boot no es necesario.

> **CONSEJO:** Cuando solamente necesites métodos del `@Controller` que devuelvan la vista, sin lógica ni datos en el modelo, usa en su lugar la interfaz `WebMvcConfigurer`. No obstante, ten en cuenta que cualquier escenario que requiera lógica o datos dinámicos requiere un `@Controller`.

## Páginas de error personalizadas

Si se produce un error inesperado en nuestra aplicación, el navegador nos muestra una página de error por defecto. Los errores típicos suelen ser 404(página no encontrada), 500 (Error interno del servidor), 403 (acceso denegado), etc.

Si queremos que muestre páginas personalizadas con un mensaje más amigable, con enlaces de vuelta a la aplicación, etc. basta con crear una carpeta llamada /error debajo de /templates y, dentro de ella, crear archivos .html con nombre igual al número de error, es decir, *404.html*, etc.

Un ejemplo del esquema de ficheros sería el siguiente:

```
mi-proyecto/
 ├─ src/
 │   └─ main/
 │       ├─ java/
 │       │   └─ com/
 │       │       └─ ejemplo/
 │       │           └─ demo/
 │       │               ├─ DemoApplication.java      # Clase principal
 │       │               └─ controller/
 │       │                   └─ HomeController.java   # Controladores
 │       │
 │       └─ resources/
 │           ├─ static/                              # Archivos estáticos y recursos de acceso público (se pueden referenciar en la URL)
 │           │   ├─ css/
 │           │   │   └─ estilos.css
 │           │   ├─ js/
 │           │   │   └─ script.js
 │           │   └─ img/                             # imágenes
 │           │       └─ logo.png
 │           │
 │           ├─ templates/                           # Vistas Thymeleaf
 │           │   ├─ index.html
 │           │   └─ error/                           # Páginas de error personalizadas
 │           │       ├─ 404.html
 │           │       ├─ 500.html
 │           │       └─ 403.html
 │           │- data/
 |           |   └─ csv/
 |           |       └─ miArchivo.csv                # Guardamos recursos privados (acceso solo interno)
 │           └─ application.properties               # Configuración
 │
 └─ pom.xml                                          # Dependencias Maven
```

Con esto en mente, ya podemos crear nuestro proyecto del resultado de aprendizaje 2.

## Práctica Evaluable: Mis compositores favoritos

Vamos a crear una aplicación que reúna información sobre compositores históricos, como Frédéric Chopin. En esta aplicación implementaremos una página de bienvenida en la que se indicará en qué año estamos y el número de compositores registrados en la aplicación. Vamos a diseñar una base de datos, a nivel conceptual, que relacione compositores con piezas musicales, siendo la clave primaria de un compositor su nombre artístico (por ejemplo, *Wolfgang Amadeus Mozart*) y siendo referenciada en la pieza musical. De momento, ya tenemos unas cuantas piezas de *Fréderic Chopin*, así que será nuestro primer compositor. Podemos añadir unos pocos más, siendo mis recomendaciones *Wolfgang Amadeus Mozart*, *Gustav Mahler* y *Ólafur Arnalds*.

De cada compositor almacenamos, además de su nombre, una breve biografía, su fecha de nacimiento, su fecha de fallecimiento (en caso de que siga vivo, será *null*), su nacionalidad, su lugar de nacimiento y su lugar de fallecimiento (en caso de que siga vivo, será *null*). Podemos incluir una lista con sus composiciones (MusicalPieces) y otra lista con sus fotos (con usar una cadena de texto para enlaces al contenido estático es suficiente). Primero programaremos los datos dentro del programa en Java para facilitar el testeo, pero luego los almacenaremos en ficheros .csv (lo ideal sería en una base de datos, pero eso no lo hemos trabajado todavía).

- **Crea el modelo de datos:** Implementa las clases Composer y MusicalPiece, así como una clase `Manager` tipo [singleton - usa el Lazy Initialization approach, que es el más sencillo -](https://www.w3schools.blog/java-singleton-design-pattern) en la cual se almacena la información en una lista de compositores (o una lista de compositores y otra de piezas). La clase singleton sirve para la persistencia de los datos, de forma estática, en toda la aplicación aunque cambiáramos de controller.
- **composerView:** Debemos añadir una vista que nos muestre a un compositor, sus datos y una lista de enlaces con sus piezas musicales registradas en la aplicación (los enlaces nos llevarán al vídeo en youtube o el recurso que queramos). La vista debe responder a la URL `/composer/{name}`. Hay que gestionar el tratamiento de caracteres especiales y de espacios de alguna forma. También hay que crear una vista especial para cuando el {name} no exista en nuestros compositores.
- **searchComposerView:** Debemos implementar una vista que tenga un `<input>` que nos permita buscar a un compositor por su nombre. De momento, usa el nombre completo para facilitar la programación. Crea un botón que nos lleve a la composerView con los parámetros adecuados en la URL.
- **Añade otro `<input>`, esta vez para buscar compositores por su nacionalidad**. En este caso, la vista que nos devolverá será una lista de enlaces a los compositores que cumplan con el requisito (puedes llamarla *listComposersView*). Los enlaces llevarán a la vista *composerView* con los parámetros adecuados. Haz que los compositores estén organizados por fecha de nacimiento, usando un método de ordenación en la lista resultante.
    - Este apartado lo puedes modificar usando casillas para cambiar añadir condiciones a la búsqueda. Igual quieres añadir el requisito "está vivo" para probar.
- **Implementa una cabecera común**, usando fragments, para todas las páginas. Añade ahí el bootstrap que necesitas, a poder ser usando webjars.
    - Usa bootstrap, css normal, tailwind o cualquier otro *embellecedor* para darle un aspecto agradable a la web.
- **composerCompareView:** Crea una vista que tenga dos entradas de tipo select (menú desplegable), en las cuales aparezcan todos los compositores registrados. Una vez seleccionados los dos compositores, podremos clicar en un botón que nos lleve a otra vista **whoIsOlderView** que nos diga "El compositor X es más antiguo que el compositor Y". Haz el cálculo comparando las fechas de nacimiento.
- **IndexView:** Crea una vista por defecto de bienvenida con un enlace a *searchComposerView* y otro a *composerCompareView*. Mapea esta vista usando `@Configuration` en las URL `/`, `/home` y `/index`.
- **Páginas de Error**: Crea las diferentes páginas de error (al menos 404 y 500), con su mensaje correspondiente y un enlace que te lleve a **IndewView**.   
- **Almacena los compositores y las piezas musicales en dos archivos .csv** distintos que leerás desde el programa en java. Recuerda que puedes hacer que la primera fila se corresponda con los atributos de la clase y las siguientes con cada uno de los objetos. Los recursos se guardan de forma interna, en la carpeta `/resources/data/csv/`.
- Separa claramente los paquetes para controladores, para configuración y para el modelo de datos (Manager, MusicalPiece y Composer). Sigue una estructura adecuada para el proyecto de Spring.
- No te olvides de añadir las dependencias necesarias cuando uses Spring Boot Initializr.
- No te olvides de documentar el código usando javadoc. Puedes emplear las herramientas integradas en el IDE para ayudarte con la documentación, pero revisa siempre que sea correcto lo que pones.
- El proyecto se ha planteado usando `@PathVariable` pero puedes modificarlo (o hacer una versión alternativa) usando `@RequestParam` como **ACTIVIDAD DE AMPLIACIÓN**.
