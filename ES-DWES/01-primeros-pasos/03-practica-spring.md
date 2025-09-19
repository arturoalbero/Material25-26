# Introducción al desarrollo web en entorno servidor

## Entrega

Entrega ambos proyectos, así como una memoria en la cual haya capturas de pantalla de todo el proceso, explicando lo que se hace en cada momento. La memoria debe contener:

- Portada.
- Índice (con los dos ejercicios, y dividiendo la configuración inicial del desarrollo posterior y la ejecución)
- Texto explicativo (bien redactado) y capturas de pantalla.
- Posibles incidencias encontradas.
- Documentación sobre el uso de diferentes recursos disponibles a modo de anexo, si es el caso (por ejemplo, el uso de algún chatbot para traducir del castellano al inglés). 

## Ejercico 1: Web estática con VSC

Crea un proyecto Spring Boot a través del asistente de VSC. Incluye las dependencias starter spring-Web, starter-Thymeleaf y DevTools, en Java 21, empaquetado jar. Configura para que escuche por el puerto 9000 y que solo contenga una página index.html con un titular "Hola Mundo". Ejecuta la apliación y comprueba en el navegador que funciona correctamente.

## Ejercicio 2: Web estática con start.spring.io

Crea un segundo proyecto a partir de https://start.spring.io con las mismas características que el anterior. En este caso, consistirá en una web estática sobre Frédeic Chopin.

- index.html con una biografía general (puedes extraer información de la [Wikipedia](https://es.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Chopin) y resumirla). Interesan los datos referentes a su nacimiento y fallecimiento, así como los lugares donde ejerció su actividad profesional. Habla de su mujer George Sand y de su paso por Mallorca, así de como cualquier dato que consideres importante o curioso.
- repertorio.html con la lista de piezas más relevantes del compositor. Añade enlaces a las partituras seleccionadas que estén en [imslp.org](https://imslp.org/wiki/Category:Chopin,_Fr%C3%A9d%C3%A9ric), así como vídeos de interpretaciones en youtube o en el propio imslp para cada una.
- galeria-imagenes.html con fotos y cuadros relevantes. Puedes extraerlas de la Wikipedia.
- enlaces-externos.html con enlaces relevantes para la página web. Puedes añadir los de su página de Wikipedia e imslp.org, así como de algún artículo que encuentres por internet.

El contenido de la página puede estar en castellano, aunque puedes usar un chatbot o un traductor para traducirlo al inglés.

## Ejercicio 3: Repaso de Java

### Domótica v.1 - Repaso de clases e interfaces

Realiza las siguientes aplicaciones de consola:

> Se desea desarrollar un programa que gestione los dispositivos domóticos de un edificio. Para ello tendremos un ArrayList que contenga, en principio, 3 elementos: uno para el termostato de la calefacción, otro para el ascensor y otro más para el dial de la radio del hilo musical. En un futuro, podríamos tener más elementos.
>
> El termostato tiene una fecha de útlima revisión, un valor entero en grados centígrados: mínimo 15, máximo 80 y la temperatura inicial es 20. El ascensor tiene una planta en la que se encuentra, de 0 a 8. La planta inicial es 0. Por último, el dial de radio va desde 88.0 hasta 104.0, avanzando de décima en décima, siendo el valor inicial 88.0.
>
> De cada elemento, y los futuros que aparezcan, se debe conseguir que sean capaces de realizar las siguientes funciones:
> - subir(), incrementa en una unidad el elemento domótico. Devuelve true si la operación se realiza con éxito, false si ocurre algún problema (por llegar al máximo).
> - bajar(), decrementa en una unidad el elemento domótico. Devuelve true si la operación se realiza con éxito, false si ocurre algún problema (por llegar al máximo).
> - reset(), devuelve al elemento domótico a su situación original.
> - verEstado(), devuelve un String con el tipo de elemento domótico, así como su estado actual
> Además, el termostato debe incluir un método, revisar(), para fijar la fecha de la revisión a la fecha actual.
>
> Una vez definido el sistema, crea un programa que inicie un ArrayList con una instancia de cada uno de los 3 dispositivos y luegoo, mediante un menú, permita hacer todas las operaciones (0 para salir, 1 para subir un dispositivo, 2 para bajar un dispositivo, 3 para resetear un dispositivo y 4 para revisar el termostato) y luego seleccionar sobre qué elemento queremos trabajar (verificando que sea un valor entre 0 y el tamaño del ArrayList -1).
>
> El menú, además de las opciones, nos mostrará siempre el estado de los dispositivos

### Domótica con operaciones CRUD

**Operaciones CRUD:**

- C - Create (Insert)
- R - Read (Select)
- U - Update
- D - Delete

#### Domótica v.2 - Ficheros

> Haz una segunda versión del programa, pero que permita almacenar y cargar los elementos domóticos desde un fichero de texto tipo .csv (comma separated values) incluido en los resources del proyecto.
>
> Añade una opción que permita añadir un elemento domótico del tipo que sea, otra que permita borrarlo y otra que permita editarlo.

#### Domótica v.3 - Base de datos

> Haz una versión alternativa del programa anterior, pero que funcione con una base de datos SQLite (o cualquier otra) en lugar del fichero. Simplemente debes reescribir los métodos que se encargaban de leer y escribir datos en el fichero para que lo hagan en la base de datos.

- [Tutorial SQLite](https://www.sqlitetutorial.net/sqlite-java/)
- [Repositorio de Maven](https://central.sonatype.com/artifact/org.xerial/sqlite-jdbc)