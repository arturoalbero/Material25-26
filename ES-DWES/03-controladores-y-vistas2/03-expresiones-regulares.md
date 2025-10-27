# 3.3 - Expresiones regulares

Información extraída de [esta página web](https://nachoiborraies.github.io/java/md/en/03d).

## Uso de expresiones regulares

Una **expresión regular** (o *regex*, en su forma abreviada) es una secuencia de caracteres especiales que nos permite detectar patrones en textos.

Por ejemplo, un número de identificación formado por 8 dígitos y una letra mayúscula, o un correo electrónico que contenga un `@`.

Usando expresiones regulares, podemos detectar fácilmente estos patrones en un texto dado, o también **obligar a que un texto cumpla un formato** al ser introducido por el usuario.


## 1. Sintaxis básica de expresiones regulares

Para trabajar con expresiones regulares en Java, necesitamos usar las clases del paquete `java.util.regex`. En concreto, nos basaremos en:

* **`Pattern`** → permite definir un patrón de expresión regular.
* **`Matcher`** → permite comprobar si un texto cumple un patrón dado.

### 1.1. Clase `Pattern`

La clase `Pattern` dispone de varios métodos útiles, entre ellos:

* `compile`: crea un objeto `Pattern` a partir de una expresión regular.
* `matcher`: devuelve un objeto `Matcher` que puede usar ese patrón con un texto.

### 1.2. Clase `Matcher`

La clase `Matcher` permite usar los siguientes métodos:

* `find`: comprueba si un patrón se encuentra en algún lugar del texto.
* `matches`: comprueba si **todo el texto** cumple el patrón (no solo una parte).
  También existe el método estático `Pattern.matches()` que hace lo mismo.


### 1.3. Ejemplo

Comprobemos si un texto contiene al menos un dígito entre 0 y 9.
El símbolo `\d` representa un dígito, así que lo usaremos dentro del patrón:

```java
String texto = "Hola, me llamo Nacho y tengo 44 años";
Pattern p = Pattern.compile("\\d");
Matcher m = p.matcher(texto);

if (m.find()) {
    System.out.println("El texto contiene dígito(s)");
} else {
    System.out.println("El texto no contiene ningún dígito");
}
```

> Nota: debemos escapar el carácter `\` al escribirlo dentro de un String, por eso usamos `\\d`.


### 1.4. Símbolos básicos

| Símbolo       | Significado
| --------      | -------------- 
| x             | El carácter literal ‘x’   
| \t            | Tabulación 
| \n            | Nueva línea      
| [abc]         | Cualquiera de los caracteres ‘a’, ‘b’ o ‘c’ 
| [^abc]        | Cualquier carácter **excepto** ‘a’, ‘b’ o ‘c’ 
| [a-zA-Z]      | Rango de ‘a’ a ‘z’ o de ‘A’ a ‘Z’     
| .             | Cualquier carácter                            
| ^             | Inicio de línea                               
| $             | Fin de línea                                  
| \d            | Dígito (0–9)                                  
| \D            | No es un dígito                               
| \s            | Espacio, tabulación o salto de línea          
| \S            | Cualquier cosa que no sea espacio             
| \w            | Carácter alfanumérico o subrayado             
| \W            | Cualquier cosa que **no** sea alfanumérica    
| (uno \| dos)  | El texto “uno” o “dos” 

**Ejemplos:**

* Texto que termina en punto:

  ```java
  Pattern p = Pattern.compile("\\.$");
  ```
* Texto formado por 4 dígitos:

  ```java
  Pattern p = Pattern.compile("^\\d\\d\\d\\d$");
  ```
* Las estaciones del año:

  ```java
  Pattern p = Pattern.compile("(winter|spring|summer|autumn)");
  ```


> **ACTIVIDAD**
>
> Crea un proyecto llamado **CarIDCheck** que pida al usuario un número de matrícula y verifique si está compuesto por **4 dígitos seguidos de 3 letras mayúsculas**.
>
>(No comprobamos si las letras son vocales o no, solo que sean mayúsculas).

## 2. Expresiones más complejas

Para crear expresiones más complejas, podemos usar **símbolos de cardinalidad**, que nos indican cuántas veces puede repetirse un elemento.

| Símbolo | Significado                                 |
| ------- | ------------------------------------------- |
| x?      | El símbolo x aparece 0 o 1 vez              |
| x+      | El símbolo x aparece 1 o más veces          |
| x*      | El símbolo x aparece 0 o más veces          |
| x{n}    | El símbolo x aparece n veces                |
| x{n,}   | Aparece al menos n veces                    |
| x{n,m}  | Aparece entre n y m veces (ambos incluidos) |

**Ejemplos:**

* Texto formado por 4 dígitos:

  ```java
  Pattern p = Pattern.compile("^\\d{4}$");
  ```
* DNI formado por 8 dígitos y una letra mayúscula:

  ```java
  Pattern p = Pattern.compile("^\\d{8}[A-Z]$");
  ```


> **ACTIVIDAD**
>
> Repite el ejercicio anterior usando **símbolos de cardinalidad**.


> **ACTIVIDAD**
> Crea un programa llamado **EmailChecker** que pida al usuario un correo electrónico y compruebe si es válido.
> 
> Un correo válido tendrá:
>
> * uno o más caracteres alfanuméricos,
> * seguido de `@`,
> * seguido de uno o más caracteres alfanuméricos,
> * seguido de un punto `.`,
> * y uno o más caracteres alfanuméricos.
> 
> Ejemplo válido: `miEmail@uno.com`
> Ejemplo inválido: `miOtroMail@aaa`


## 3. Uso de grupos

Los **grupos** nos permiten aislar partes de un texto que coinciden con un patrón, para poder tratarlas luego en el código.
Cada grupo se define entre paréntesis `( )` y podemos acceder a ellos con el método `group()` de la clase `Matcher`.

**Ejemplo: obtener todas las secuencias de 4 dígitos en un texto:**

```java
String texto = "Einstein nació en 1879 y Edison en 1847";
Pattern p = Pattern.compile("(\\d{4})");
Matcher m = p.matcher(texto);

if (!m.find()) {
    System.out.println("El texto no tiene secuencias de 4 dígitos");
} else {
    do {
        String dato = m.group();
        System.out.println("Encontrado: " + dato);
    } while (m.find());
}
```

Cada vez que llamamos a `group()`, se obtiene la siguiente coincidencia.

### 3.1. Grupos múltiples

Podemos definir **más de un grupo** dentro de una expresión.
En este caso, `group(n)` devuelve el grupo número `n`, empezando por 1.

Ejemplo: identificar nombres y apellidos en un texto:

```java
String texto = "Albert Einstein nació en 1879 y Thomas Edison en 1847";
Pattern p = Pattern.compile("([A-Z][a-z]+) ([A-Z][a-z]+)");
Matcher m = p.matcher(texto);

if (!m.find()) {
    System.out.println("No se han encontrado nombres");
} else {
    do {
        String nombre = m.group(1);
        String apellido = m.group(2);
        System.out.println("Encontrado: " + nombre + " " + apellido);
    } while (m.find());
}
```

**Salida:**

```
Encontrado: Albert Einstein  
Encontrado: Thomas Edison
```

> **ACTIVIDAD**:
> 
> Crea un programa llamado **HourIdentifier** que busque horas dentro de un texto.
> Una hora está formada por dos dígitos, seguidos de `:`, y otros dos dígitos (por ejemplo, `08:45`).
> No necesitamos comprobar si la hora es válida, solo identificarla.

## 4. Expresiones regulares con `Stream().filter()`

Podemos combinar **expresiones regulares** con **Streams** para filtrar fácilmente una lista de cadenas según un patrón determinado.

Por ejemplo, si queremos quedarnos solo con los elementos que **contengan al menos un número**, podemos hacerlo así:

```java
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

public class RegexStreamExample {
    public static void main(String[] args) {
        List<String> textos = List.of("abc", "a1b", "hola", "java8", "stream");

        Pattern patron = Pattern.compile(".*\\d.*"); // contiene al menos un dígito

        List<String> conNumeros = textos.stream()
            .filter(t -> patron.matcher(t).matches())
            .collect(Collectors.toList());

        System.out.println("Textos que contienen números:");
        conNumeros.forEach(System.out::println);
    }
}
```

**Salida:**

```
Textos que contienen números:
a1b
java8
```

Lo que sucede es:

* `Pattern.compile(".*\\d.*")` define una expresión regular que significa “contiene al menos un dígito”.
* `stream().filter(...)` evalúa cada cadena usando `matcher().matches()`.
* `collect(Collectors.toList())` recoge las coincidencias en una nueva lista.

> **ACTIVIDAD**:
> Crea un programa que, a partir de una lista de posibles correos electrónicos, **use `stream().filter()` y una expresión regular** para quedarse solo con los correos **válidos** (aquellos que tengan `@` y un dominio correcto).

> **ACTIVIDAD**: 
> Mejora la práctica de la unidad de programación anterior (My Favourite Composer) con expresiones regulares, concretamente **searchComposerView** para que admita la búsqueda con nombres parciales mediante **expresiones regulares**. Por ejemplo, si incluyes a *Franz Liszt* y a *Franz Peter Schubert* y buscas *Franz*, deben aparecer los dos.
