# Prompts para practicar con Inteligencia Artificial determinadas materias

## Consideraciones generales

A la hora de practicar materias, la inteligencia artificial puede ser una gran herramienta si se usa con cautela. Sin embargo, hay que tener en cuenta determinadas cosas:

- La IA funciona como el estereotipo de *cuñao*, es decir, SIEMPRE tiene una respuesta, y además una convincente. Otra cosa distinta es que la respuesta sea verídica o fiable. Por eso siempre hay que revisarla.

- Como buen *cuñao*, va a intentarte darte las respuestas de todo y una chapa muy grande. **Hay que pararle los pies en el *prompt***. Cuando quieres estudiar, no quieres que te dé los resultados. Lo que quieres son **apuntes sobre lo que vas a usar en el ejercicio** y el **ejercicio** sin ningún tipo de pista. Una vez le entregas el ejercicio, entonces sí dejas que te lo corrija.

- Cuanto más la usas, más tiende a desobedecerte en las órdenes que le das. Por ejemplo, si le dices que te estructure un temario en una serie de semanas, te puede decir que lo hace y empezar a hacerte la estructura. Sin embargo, cuando te das cuenta, te ha metido más o menos semanas de las que le dijiste, o se ha saltado o inventado cosas del temario. En ese sentido, la IA funciona bien para realizar un **trabajo superficial**, pero luego falla cuando hay que entrar en detalle.

- La IA controla bien las cosas conocidas, pero las desconocidas se las inventa. Es mejor en informática que en cualquier otro aspecto. Es particularmente mala, por ejemplo, en el análisis musical.

- No todas las IA funcionan igual para todos los campos. Por ejemplo, en mi experiencia Gemini es mejor a la hora de rellenar datos repetitivos, como bases de datos o XML; Sin embargo, Chatgpt funciona mejor a la hora de redactar y se inventa menos cosas, además de que te proporciona fuentes y enlaces (que no siempre funcionan).

## Bases de Datos

Para esta materia, el motor de IA empleado ha sido Gemini, de Google, ya que daba mejores resultados al crear tablas (aunque algunos ejercicios se hicieron con chatGPT). Gemini tiene tendencia a inventar mucho, por lo que tiene que estar sometida a vigilancia constante para dar buenos resultados. También puede que trate de corregirte algún ejercicio que esté bien.

> Prepárame una base de datos de pruebas en MySQL, con su DML y sus inserciones iniciales. El objetivo es practicar procedimientos, funciones y triggers, centrándonos en cursores, excepciones, señales, etc. Una vez creada la base de datos, vamos a trabajar cada uno de esos aspectos de uno en uno.

> Ponme ejercicios para practicar **consultas SQL de tipo DML**. Me plantearás al principio unos apuntes sobre la sintaxis que he de usar y siempre antes de cada ejercicio me pondrás las tablas del modelo. Quiero hacer los ejercicios de uno en uno, tu me lo planteas y yo te lo mando. Empieza con el primero.

> Hola, quiero entrenar sql estándar. Quiero que me hagas ejercicios para **practicar cursores, funciones, triggers, procedimientos, consultas, subconsultas, exists, in, conjuntos, any, all, extract, operaciones usando la misma tabla varias veces, etc**. Hazme los ejercicios de 1 en 1, sin darme pistas. Recuérdame la sintaxis necesaria para realizar cada ejercicio, siempre que sea un elemento nuevo. Te paso el script de creación de la base de datos en MySQL.

## Programación en Java. Aprendizaje a través de la Inteligencia Artificial

Java es un lenguaje muy popular en el desarrollo de aplicaciones web, se emplea sobre todo en el campo del backend aunque puede ser empleado para el frontend usando extensiones como JavaServer Pages (JSP). Java emplea la misma lógica que otros lenguajes como C# o C++.

Al crear nuestro proyecto en Maven, en la carpeta src introducimos nuestros archivos de código fuente, en los que insertamos nuestras clases. En java, los archivos deben tener el mismo nombre que las clases públicas definidas y solo puede haber una clase pública por archivo. Dentro de la clase pública, podemos crear métodos estáticos, que nos permiten tratar la clase como si fuera un contenedor de funciones, o definirla como una clase normal, como las que trabajamos en la Unidad de Programación 3 sobre diseño orientado a objetos.

- *archivo Main.java*
```java
import java.util.*;
import java.lang.*;
import java.io.*;

// The main method must be in a class named "Main".
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
    }
}
```
Este es el código de un `Hola Mundo` extraído de MyCompiler.io. Si usamos la autocompleción de IntelliJ, los `import` se añadirán solos. Es importante, por lo tanto, emplear esas herramientas que nos facilita el IDE, conocidas como herramientas de refactorización. 

Una vez que conocemos la estructura básica de un programa en Java, es hora de transferir nuestros conocimientos en cualquier otro lenguaje de programación a Java. Para ello, una herramienta fundamental es la **Inteligencia Artificial**. Podemos usar ChatGPT, Gemini o cualquier otra. Incluso podemos ir alternando para obtener diferentes perspectivas. La versión de Java que trabajaremos será la 21 LTS (Long Term Support), por temas de compatibilidad.

> **Actividad**
> Coge tus apuntes de Programación sobre `Entrada y salida de datos por consola` y pídele a un modelo de lenguaje que te los traduzca a Java.

Más adelante aprenderemos a traducir lo aprendido en la unidad de programación 3 a lenguaje Java y, aunque no es necesario para este módulo, sí que sería recomendable hacer un esfuerzo en aprender los siguientes puntos sobre Java:
- Uso de if, if-else, switch y enhaced switch en Java.
- Uso de while, do-while, for y enhanced for en Java.

> **Actividad**
> Pídele a un modelo de lenguaje que te haga un tutorial para aprender a manejar cada uno de los siguientes puntos en Java. Pídele un tutorial distinto por punto, para evitar respuestas demasiado largas o complejas. Pídele que te proponga ejercicios para que tú los resuelvas y luego él te los corrija.
> - Uso de if y de if-else
> - Uso de switch-case
> - Uso de while y do-while
> - Uso de for
> - Creación y consulta de arrays
> - Uso de enhanced for para recorrer arrays

Puedes emplear también la información obtenida en el apartado de Diagramas de Actividad de la Unidad de Programación 2, pero ten en cuenta que los diagramas que tratan la concurrencia son de carácter avanzado y pueden hacerse complicados de trabajar y depurar en Java.

Conforme vayas avanzando en el módulo de programación, procura tratar de convertir esos conocimientos a Java. Te será de utilidad en un futuro.
