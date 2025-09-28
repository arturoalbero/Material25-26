# Etiquetas Thymeleaf básicas

## 1. Etiquetas de operaciones básicas

### 1.1. Sustitución de texto

La operación más básica es la que nos permite mostrar en una etiqueta un valor procedente del servidor. Para ello, añadimos la etiqueta `th:text` y la variable procendente del servidor entre `${...}`. En el caso de que el texto pasado sea una fecha (LocalDate, LocalDateTime) podemos darle formato de la siguiente forma usando `#temporals.format(,)`:

```html
<p th:text="${#temporals.format(fecha, 'dd-MM-yyyy HH:mm')}">2024-12-31</p>
```

Recuerda que si usamos el caracter `"` para introducir la instrucción de plantilla, para introducir una cadena dentro debemos emplear el caracter `'`. Esto es así en la mayoría de lenguajes que trabajan en el lado del servidor (como PHP).

### 1.2. Condiciones

Podemos establecer mediante una condición que una parte de nuestro HTML se muestre o no. Para ello, usamos las etiquetas `th:if` y `th:unless`, que equivale a la parte `else`, aunque técnicamente es un *si no* `if not` y se puede usar de forma autónoma. Es compatible con los mismos operadores de comparación que Java (`> >= < <= == !=`).

```html
<div th:if="${result>10}">Resultado mayor que 10</div>
<div th:unless="${result>10}">Resultado menor o igual que 10</div>
```

ó:

```html
<div th:if="${result>10}">
    <span th=text="${result}">*</span> es mayor que 10
</div>
<div th:unless="${result>10}">
    <span th=text="${result}">*</span> es menor o igual que 10
</div>
```

> **RECUERDA:** La etiqueta <span> es un elemento en línea, lo que significa que fluye dentro del texto existente sin crear un salto de línea.
>
> Una distinción crucial en HTML es la diferencia entre elementos en línea y elementos de nivel de bloque. Vamos a aclarar:
>
> * **Elementos en línea:** Estos elementos como `<span>`, `<a>`, y `<fuerte>` residen dentro del flujo natural de un párrafo o una oración. Solo ocupan el espacio necesario para su contenido.
> * **Elementos de nivel de bloque:** Elementos como `<div>`, `<h1>`, y `<p>` comienzan una nueva línea y ocupan todo el ancho de su contenedor padre.
>
> [***fuente***](https://elementor.com/blog/es/etiqueta-html-span-uso-atributos-css-consejos-trucos-y-ejemplos/)


Otra forma de implementar una comparación es mediante el operador `${}? '':''`, funcionando como el operador ternario (`${condicion}?'Verdadero':'Falso'`).

```html
<span th:text="${result>10} ? 'Resultado mayor que 10': 'Resultado menor o igual que 10'" >*</span>
```

Los operadores lógicos en Thymeleaf no son como en Java, sino que se introducen mediante texto ( `and`, `or`, `not`).

```html
<p th:if="${edad > 18 and registrado == true}"> Login correcto</p>
<p th:if="${edad < 18 or registrado != true}"> Usuario no válido</p>
```

### 1.3. Iteraciones

Para iterar sobre una colección, utilizaremos `th:each`. Funciona como el operador for(:) en Java:

```html
<p th:each="producto:${listaProductos}">
    <span th:text="${producto}">default</span>
</p>
```

En este ejemplo, listaProductos puede ser cyakqyuer colección  de algún tipo básico (como String). Si se tratara de un tipo con atributos, como un objeto o un registro, podemos acceder a ellos siempre que tengan getters con formato estándar (`getId()`. `getNombre()`, etc.).

```html
<table><tr th:each="empleado:${ListaEmpleados}">
    <td th:text="${empleado.id}"> id </td>
    <td th:text="${empleado.nombre}"> nombre </td>
</tr></table>
```

También podemos añadir una variable contador para llevar la cuenta. Añadimos para ello un iterador que cuenta con dos atributos: index (empieza en 0) y count (empieza en 1):

```html
<table><tr th:each="empleado, iterador:${ListaEmpleados}">
    <td th:text="${iterador.count}"> contador </td>
    <td th:text="${empleado.id}"> id </td>
    <td th:text="${empleado.nombre}"> nombre </td>
</tr></table>
```

## 2. Fragmentos y bloques

Los fragmentos son bloques de código que podemos guardar en un archivo para poder reutilizarlos en diferentes páginas, para evitar así duplicidad de código. Un uso típico es el `<head>`, los pies de página o menús generales de la aplicación que se repiten en varias páginas de nuestra web.

Cada fragmento se identifica con el atributo `th:fragment="nombre del fragmento"` pudiendo incluir varios fragmentos en un solo archivo. Si el fragmento va a contener código de la cabecera se incluirá en la parte `<head>` de ese archivo y, si va a contener código del cuerpo, en la parte `<body>`.

```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head th:fragment="cabecera">
    <meta charset="UTF-8" />
    <title>Título de todas las páginas </title>
    <link th:href="@{/css/styles.css}" rel="stylesheet">
</head>
<body>
    <footer th:fragment="pie">
        <a href="https://www.mycompany.com">&copy;My Company</a>
    </footer>
</body>
</html>
```

La ubicación por defecto de estos archivos será la carpeta `/templates` y, si vamos a crear muchos archivos de fragmentos, sería adecuado crear una subcarpeta para tal efecto.

En este ejemplo, además, vemos como la etiqueta <link> usa th:href="@{/css/styles.css}". Esto sirve para que Thymeleaf transforme @{...} en una URL relativa al contexto de la aplicación (ejemplo: /miapp/css/styles.css). Lo explicaremos en detalle más adelante.

Una vez creados los fragmentos, en cada página que queramos usarlos podemos usar la orden `th:replace` para sustituir la etiqueta o `th:insert` para insertar el contenido dentro, sin sustituir la etiqueta. A diferencia de las expresiones de variable, que usaban la nomenclatura `${}`, las expresiones de fragmento emplean la nomenclatura `~{}`. En un teclado español, el símbolo `~` se consigue pulsando `Alt Gr + Ñ`. Al usar tanto el reemplazo como el bloque, debemos indicar el archivo donde se encuentra el fragmento primero y luego, separado por `::`, el nombre del fragmento:

```html
<head th:replace="~{/fragmentos.html::cabecera}"></head>
```

ó, si usamos la etiqueta insert:

```html
<head th:insert="~{/fragmentos.html::cabecera}"></head>
```

La diferencia será que, en el segundo caso, tendremos la etiqueta <head> duplicada. Por eso, para este tipo de insertos en lugar de framengos se utilizan **bloques** con etiquetas <th:block>.

```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <th:block th:fragment="cabecera">
        <meta charset="UTF-8" />
        <title>Título de todas las páginas </title>
        <link th:href="@{/css/styles.css}" rel="stylesheet">
    </th:block>
</head>

</html>
```

Al insertar, escribiremos lo siguiente:
```html
<head>
    <th:block th:insert="~fragmentos.html::cabecera}"></th:block>
</head>
```
La etiqueta `<th:block>` no se traslada al documento final, solo sirve para agrupar el contenido del fragmento. Cabe destacar que **`<th:block>` es la única etiqueta específica de Thymeleaf.** El resto de elementos son atributos th: sobre HTML válido.

Por supuesto, los fragmentos pueden incluir dentro de ellos otras etiquetas Thymeleaf, como en el siguiente ejemplo:

```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <th:block th:fragment="cabecera">
        <meta charset="UTF-8" />
        <title th:text="${titulo}>*</title>
        <link th:href="@{/css/styles.css}" rel="stylesheet">
    </th:block>
</head>

</html>
```

## 3. Tratamiento de nulos

Si el elemento que recibimos del servidor para una etiqueta es un objeto nulo, al acceder a sus atributos se produciría una excepción. Para evitar eso, Thymeleaf tiene varios mecanismos. El primero es mediante el operador `?` a continuación del objeto del cual queremos verificar la existencia de nulos. En caso de ser nulo, mostrará la etiqueta vacía.

```html
<td th:text="${empleado?.nombre}">nombre</td>
```

En caso de que necesitemos que la etiqueta tome un valor si el objeto es nulo, podemos usar el operador `?:`, que es similar al operador ternario, pero añadiendo solo la parte del *else* que incluirá el contenido a mostrar en caso de nulos:

```html
<td th:text="${empleado.nombre}?:'sin nombre'">*</td>
```
A esta versión del operador ternario se la conoce como operador *Elvis*.

> **NOTA:** Cuando no necesitamos un valor por defecto en el HTML, es común emplear el caracter *, pero no obligatorio. Podría ir cualquier cosa.

## 4. Thymeleaf y CSS

### 4.1 Etiquetas th:style y th:classappend

Thymeleaf ofrece la posibilidad de incorporar o modificar dinámicamente atributos y clases CSS. Para ello, disponemos de etiquetas como th:style (añade a la etiqueta HTML una ***propiedad*** CSS) o th:classappend (añade a la etiqueta HTML una ***clase*** CSS). En muchos casos, se incorpora dentro de una estructura condicional:

```html
<table th:style="${numero>0} ? 'display:block' : ' display:none' ">
    (...)
</table>
```

En este ejemplo, si el número pasado a la plantilla es mayor que 0 se añade el estilo *display=block* y, si no, no se mostrará la tabla.

```html
<span th:classappend="${numero>50}?'hihgNumber' : 'lowNumber' " th:text="${numero}">*</span>
```

En este ejemplo, si el número pasado a la plantilla es mayor que 50 añade la clase creada por nosotros *highNumber*. En caso contrario, añade *lowNumber*.

### 4.2 Diferencia entre th:src, th:href y src, href

*th:href* y *th:src* sirven para que Thymeleaf transforme @{...} en una URL relativa al contexto de la aplicación, mientras que *href* y *src* buscan la dirección explícita desde el servidor.

* Para rutas relativas al proyecto (CSS, JS, imágenes, controladores de Spring): th:href, th:src...
* Para rutas externas absolutas (CDNs, enlaces a otras webs): href, src...

En **Spring Boot + Thymeleaf** funciona de la siguiente forma. Si el archivo CSS está en `src/main/resources/static/css/styles.css`, la carpeta `static` es la **raíz de los recursos estáticos**. Todo lo que se pone ahí se sirve directamente al navegador.

Thymeleaf funciona dentro de `templates/` y procesa los archivos de tal manera que al trabajar sobre este código:

```html
<link th:href="@{/css/styles.css}" rel="stylesheet">
```

Thymeleaf procesa `@{/css/styles.css}` y genera la URL correcta relativa al **context path** de la aplicación web. Por ejemplo

  * Si la aplicación corre en `/` → `/css/styles.css`.
  * Si la aplicación corre en `/miapp` → `/miapp/css/styles.css`.
Spring Boot servirá el archivo desde `static/css/styles.css`.

No usamos directamente `href="/css/styles.css"` porque, si la app tiene **context path** distinto a `/`, el navegador no encontrará el archivo.
* `th:href` ajusta automáticamente la ruta según dónde esté desplegada la app.

---

> **ACTIVIDAD:**
> Construye un nuevo proyecto, pero toma como referencia el proyecto de Frédéric Chopin. Añade contenido dinámico pasándole la información a las plantillas mediante un model y representándolo con etiquetas Thymeleaf. La página de inicio puede tener el año actual, por ejemplo @2025, tomado de la fecha del sistema del servidor. Para ello puedes usar el método estático `LocalDate.now()`.
>
> A la hora de rediseñar la página, deberemos hacer cosas como, por ejemplo, en la página del repertorio añadir las piezas a una lista (puedes crear una clase o un record PiezaMusical con la información necesaria (título, compositor, año de estreno, instrumentación)) para pasárselo al servidor. Más adelante, este tipo de información la tendremos almacenada en el servidor de bases de datos.
>
> Procura adaptar, en la medida de lo posible, todas las vistas.
>
> Recuerda añadir en `application.properties` la propiedad `spring.thymeleaf.cache=false` y el atributo `xlms` de la etiqueta html.
>
> Utiliza th:href y th:src en lugar de los atributos HTML href y src respectivamente.

<details>
<summary><b>Actividades anteriores<b></summary>

> **Actividad:**
> Toma el proyecto anterior y desarrolla una clase de tipo `@Controller` que contenga diferentes @GetMapping con las rutas que quieras que devuelvan las vistas solicitadas.
>
> a) ¿Tienes que cambiar la ubicación de las vistas? ¿Por qué?
> b) ¿Tienes que cambiar el código HTML del menú de navegación de las páginas?
> c) ¿Tienen que llamarse igual las rutas del GetMapping y las vistas?
>
> La página index será servida para las URL: /index, /home o, simplemente, /. Como las rutas y las vistas no tienen por qué llamarse igual, renombra las vistas con el sufijo "View" (por ejemplo, indexView.html). Así podemos distinguir bien por el propio nombre lo que es una vista y lo que es una ruta o URL gestionada por el controlador.


<details>
<summary>El enunciado del proyecto anterior era este:</summary>

> Crea un segundo proyecto a partir de https://start.spring.io con las mismas características que el anterior. En este caso, consistirá en una web estática sobre Frédeic Chopin.
>
> - index.html con una biografía general (puedes extraer información de la [Wikipedia](https://es.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Chopin) y resumirla). Interesan los datos referentes a su nacimiento y fallecimiento, así como los lugares donde ejerció su actividad profesional. Habla de su mujer George Sand y de su paso por Mallorca, así de como cualquier dato que consideres importante o curioso.
>- repertorio.html con la lista de piezas más relevantes del compositor. Añade enlaces a las partituras seleccionadas que estén en [imslp.org](https://imslp.org/wiki/Category:Chopin,_Fr%C3%A9d%C3%A9ric), así como vídeos de interpretaciones en youtube o en el propio imslp para cada una.
>- galeria-imagenes.html con fotos y cuadros relevantes. Puedes extraerlas de la Wikipedia.
>- enlaces-externos.html con enlaces relevantes para la página web. Puedes añadir los de su página de Wikipedia e imslp.org, así como de algún artículo que encuentres por internet.
>
> El contenido de la página puede estar en castellano, aunque puedes usar un chatbot o un traductor para traducirlo al inglés.
</details>
</details>
