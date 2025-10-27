# 3.2 - Introducción a la programación funcional en java

## 1. El paradigma funcional

El paradigma de programación funcional es un paradigma declarativo. Esto quiere decir que lo que hacemos al programar, en lugar de dar instrucciones sobre cómo ha de comportarse el programa (paradigma imperativo), es definir una realidad (en el caso del paradigma funcional, a través de funciones matemáticas) y luego el programa, de forma transparente al programador, se encarga de resolver dicha realidad. El cálculo relacional que se usa en el lenguaje SQL también es declarativo.

El paradigma funcional se basa en el concepto de funciones anónimas. En realidad, una función es un fragmento de código que se guarda en una variable (su cabecera) y ese código es accesible por el resto. Cuando llamamos una función, lo que hacemos es invocar su nombre y adjuntarle unos parámetros. Las funciones anónimas son lo mismo, pero no están almacenadas hasta el momento de su ejecución. Como no tienen "nombre" (la cabecera), son denominadas anónimas.

## 2. Funciones anónimas

En Java, para crear funciones anónimas se necesita hacer uso de los objetos con clase anónima. Existen un tipo de interfaces que se denominan "interfaces funcionales" las cuales solamente tienen un método (que funciona como una función, es decir, devuelve un valor). Cualquier interfaz con un método es considerada funcional desde Java 8. Normalmente se anotan con `@FunctionalInterface`, pero no es necesario.

```java
interface Operacion{
    int calcular(int a, int b);
}
```

Para reescribir la función, empleamos el cálculo lambda, con la flecha `->`, como sigue:

```java
public class Main {
    public static void main(String [] args){
        Operacion suma = (a,b) -> {
            return a+b;
        };
        System.out.println(suma.calcular(8,9));
    }
}
```

Esto se traduce como *para toda entrada (a,b), siendo* `a` y `b` *sendos números enteros, entonces* (`->`) *se devuelve la suma `return a+b`.* Para usar nuestra operación, tenemos que llamar al método `calcular` de la interfaz.

Si la función que hemos reescrito tiene una sola línea, como sucede en muchos casos -como el anterior-, podemos simplificar la escritura:

```java
public class Main {
    public static void main(String [] args){
        Operacion suma = (a,b) -> a + b;
        System.out.println(suma.calcular(8,9));
    }
}
```

Lo que hacemos es omitir las llaves `{}`, el `return` y todos los `;` que habrían ido dentro del ámbito de las llaves.

Esto transforma una función imperativa (paso a paso) en una definición de la realidad a través de una función.

En Java, hay muchos casos en los que es conveniente el uso de funciones
anónimas, como por ejemplo en comparaciones y en el manejo de colecciones de datos (tanto estáticas como dinámicas).

> **NOTA**: En las interfaces funcionales, el nombre del método **no** es relevante.

> **ACTIVIDAD:** Crea una interfaz funcional que opere con un método tenga como parámetros de entrada dos String (s1, s2) y devuelva un String. Después, en el main, crea las siguientes funciones anónimas usando lambdas:
> * Inserta s2 al principio y al final de s1.
> * Devuelve "IGUAL" si s1 y s2 son iguales y "DIFERENTE" en caso contrario.
> * Devuelve s1 omitiendo tantos carácteres al principio como tenga s2.
> * Devuelve s1 pero con el tamaño de s2. Si s2 es más pequeño que s1, lo trunca. Si es más mayor, añade tantos `0` como sea necesario hasta rellenar el número de caracteres.

## 3. Comparadores

La interfaz `Comparator<T>` solo dispone de un método, `int compare(T o1, T o2)`.
Por lo tanto, es una interfaz funcional y susceptible de ser usada mediante funciones anónimas y expresiones lambda.

Antes de Java 8, al no estar implementado todavía el cálculo lambda, era práctica común definir el criterio de comparación a través de un objeto con clase anónima, de la siguiente forma:

```java
Collections.sort(listaDeStrings, new Comparator<String>() {
    @Override
    public int compare(String s1, String s2) {
        return s1.compareTo(s2);
    }    
});
```

Esta forma es mucho mejor que tener que crear un archivo que implemente la clase Comparator donde definimos un método compare para cada comparación que queramos hacer. Sin embargo, aunque mejora significativamente, sigue siendo algo verboso. A partir de Java 8 se puede usar el cálculo lambda de la siguiente forma:

```java
Collections.sort(listaDeStrings, (s1, s2) -> s1.compareTo(s2));
```

Como se puede apreciar, la reducción de código es significativa. En este caso, sabemos que el segundo argumento del método `sort` tiene que ser un objeto de tipo `Comparator`. La firma del método es:

```java
public static <T> void sort(List<T> list, Comparator<? super T> c)
```

Por lo tanto, lo podemos definir al vuelo como un objeto con clase anónima. Como se trata de una interfaz funcional, podemos emplear el cálculo lambda para definirlo.

> **RECUERDA:** Para poder usar el cálculo lambda, necesitamos que este sustituya a un objeto que implemente una interfaz funcional.

> **ACTIVIDAD:** Dada una lista de personas con Nombre y Edad, ordénalas de la siguiente manera:
> * Primero por edad, los más jóvenes primero.
> * Ante un empate, ordena por orden alfabético del nombre.
> Ten en cuenta que no vas a usar compareTo y necesitarás emplear una función lambda (un poco) más compleja, con `{}` y `return`.

### 3.1. Métodos de referencia

Existe una forma de realizar estas operaciones todavía más concisa que el cálculo lambda, y esto es el uso de métodos de referencia. Un método de referencia es un método más corto de escribir un lambda. Sustituye a aquellos cálculos lambda en los que el resultado es la llamada a un método. Lo que hacemos es poner el nombre de la clase seguido de dos puntos y el método que queremos invocar.

```java
Class Persona{
    String nombre;
    int edad;
    public String getNombre(){return nombre;}
    public int getEdad(){return edad;}

    public Persona(String nombre, int edad){
        this.nombre = nombre;
        this.edad = edad;
    }

    //forma de escribir main en Java25, anteriormente `public static void main(String [] args)
    static void main(){ 
        List<Persona> listaPersonas = List.of(
            new Persona("Pepe", 18),
            new Persona("Luisa", 15),
            new Persona("Marcelino", 32),
            new Persona("Aurelia",7),
            new Persona("Agapito",92));
        Collections.sort(listaPersonas, (p1, p2) -> p1.getNombre().compareTo(p2.getNombre())); //forma con lambda

        Collections.sort(listaPersonas, Comparator.comparing(p->p.getNombre())); // usa lambda, pero con el método estático Comparing (que construye un comparador a partir de una función)

        Collections.sort(listaPersonas, Comparator.comparing(Persona::getNombre)); // forma con método de referencia

    }
}
```

El método estático `comparing` acepta una función y devuelve un `Comparator` del tipo adecuado, que podemos usar en `Collections.sort()`. Por lo tanto, hacemos *para todo `p` perteneciente a `listaPersonas`, entonces `->` aplicamos creamos un comparador a partir de la función `p.getNombre()`*. Usando métodos de referencia, reducimos `p->p.getNombre` a `Persona::getNombre`. Básicamente le decimos que creamos un comparadot para todos los elementos `Persona` de `listaPersonas` usando el resultado del método `getNombre`. 

## 4. Uso de Streams

Además de en comparaciones, el otro gran uso del cálculo lambda y/o los métodos de referencia es en la manipulación de *streams*. Los Streams en java también se introducen en Java 8. Consisten en una secuencia de elementos que se pueden procesar de forma declarativa.

Son muy similares a las colecciones tradicionales, pero tienen una serie de diferencias clave. Las colecciones almacenan datos en memoria, los streams no ("fluyen" sobre los datos). Las colecciones son mutables, los streams en cambio son inmutables (no se modifican, se sustituyen unos por otros). Las colecciones se procesan de inmediato, mientras que los streams solo cuando se los necesita (son ***lazy***). Por último, las colecciones se recorren, mientras que los streams se *procesan*. 

Para poder procesar una colección como si fuera un stream y, por lo tanto, poder usar el cálculo lambda, lo primero que tenemos que hacer es convertirla en un stream. Para ello, usamos la función `stream()` en las colecciones dinámicas o el método estático `Arrays.stream()` para convertir colecciones estáticas. Luego deberemos hacer el proceso inverso de reconversión, a través de los métodos `collect` de los que disponen los streams, como `toList()`.

### 4.1. Operaciones con Streams

Las operaciones en un Stream se dividen en intermedias y finales:

**Operaciones intermedias (devuelven otro Stream)**

* filter(Predicate) -> filtra elementos. Su argumento son predicados, es decir, funciones que devuelven verdadero o falso.
* map(Function) -> transforma elementos. Su argumento son funciones normales.
* sorted() o sorted(Comparator) -> ordena los elementos del stream
* distinct() -> elimina duplicados. Es necesario tener el equals y el hash bien definidos.
* limit(int n) / skip(int n) -> limita el flujo. En el primer caso muestra los `n` primeros y en el segundo se salta los `n` primeros. `n` es un entero positivo.

**Operaciones finales (terminan el flujo)**
* forEach(Consumer) -> recorre los elementos y recibe como entrada un objeto de la interfaz Consumer, que consiste en un método que recibe un parámetro y no devuelve nada (`void accept(T t);`)
* collect(Collector) -> convierte a lista, conjunto, etc. Explicaremos las funciones Collector más adelante.
* count() -> Devuelve un entero con la cuenta de los elementos
* findFirst() / findAny() -> obtiene un elemento del stream.
* allMatch(), anyMatch(), noneMatch() -> Devuelve verdadero o falso según se validan las condiciones

### 4.2. Filtros

Una de las operaciones más comunes y prácticas con streams es el filtrado de datos.
```java
listaPersonas.stream().filter(p -> p.getEdad()>18);
```
En este caso, lo que le decimos es *para todo elemento `p` del stream, créame un nuevo stream que solo contenga aquellos elementos en los que se cumpla `p.getEdad()>18`.

El filtro requiere un parámetro de tipo Predicate, que es una interfaz funcional genérica (acepta un tipo de datos cualquiera) con un método que devuelve verdadero o falso.

```java
interface Predicate<T>{
    boolean test(T t);
}
```
> **RECUERDA**: Aunque la mayoría de operaciones en streams sean de una línea y podamos escribirlas en forma resumida, podemos usar las líneas que necesitemos. Acuérdate de rodear la función con `{}` y devolver un valor adecuado con `return` cuando sea necesario.

### 4.3. Mapeos (transformaciones)

La segunda operación más común es la transformación de un stream de un tipo en otro mediante el *mapeo* de sus elementos.

```java
listaPersonas.stream().map(p->p.getNombre());
```

En este caso, le estamos diciendo que para todo `p` perteneciente a `listaPersonas`(es decir, `p` es de tipo `Persona`), extraiga el resultado de la función `getNombre()` (que devuelve tipo `String`) y cree un nuevo stream con esos datos (por lo tanto, crea un stream de `String` en lugar de `Persona`).

El método map recibe una entrada de tipo `Function`, que es una interfaz funcional con un método que, dada una entrada de un tipo `T` devuelve un resultado de un tipo `R`.

```java
@FunctionalInterface
public interface Function<T, R> {
    R apply(T t);
}
```

### 4.4. Funciones Collector

La tercera operación más común es `Collect`. A diferencia de las anteriores, se trata de una función final que no devuelve otro stream, sino un resultado. Generalmente, vamos a usar un Collect al final de cada stream para devolver un tipo de datos común (como una lista, un entero, etc.).

A diferencia de `filter` y  `map `, las funciones `collect` son mucho más complejas. Es por ello que solemos usar `Collectors` predefinidos:
* `Collectors.toList()`: Devuelve un `Collector` que transforma el stream en una lista. Se puede resumir con `toList()`. También existe la versión `toSet()`.
* `Collectors.joining(String separador)`: Devuelve un `Collector`que transforma el stream en un String a través del método `toString`. Lo que hace es unir todos los elementos del stream en uno solo, separándolos por el carácter que pasamos como argumento `separador`.
* `Collectors.counting()`: Devuelve la cantidad de elementos. Se puede resumir con el método `count()`.

```java
List<String> listaStrings = List.of("Juan", "Pepe", "Verónica", "Laura", "Marcos");

listaStrings.stream().collect(Collectors.joining(","));

listaStrings.stream().reduce((acumulador,s) -> acumulador + "," + s).orElse("");
```

En este caso, no disponemos de valor inicial y el acumulador toma el primer valor del stream. Como podría ser nulo, necesitamos usar el método `orElse(T t)` que devuelve el resultado almacenado en el Optional excepto cuando es nulo, que devuelve `t`.

> **CONSEJO:** Del envoltorio `Optional` nos interesan sobre todo los métodos:
> * `orElse(T valorPorDefecto)`: Si el valor contenido en el envoltorio Optional es nulo, devuelve un `valorPorDefecto` del mismo tipo `T` (por ejemplo, `String` si tenemos un `Optional<String>`).
> * `isPresent()`: Devuelve `true` si el valor en el envoltorio no es null. No confundir con `ifPresent`.
>
> Usamos `Optional<T>` para evitar la excepción `NullPointerException`.

La operación `reduce` es más similar a cómo funciona Javascript. Como regla de uso, utilizamos `reduce` cuando queremos devolver un único valor y `collect` cuando queremos devolver, potencialmente, una colección de valores.


#### 4.4.2. Operación groupingBy

`Collectors.groupingBy(Function f)`: Devuelve un `Map` que agrupa todos los elementos del stream en función de un parámetro:

```java
listaPersonas.stream().collect(Collectors.groupingBy(Persona::getEdad))
```

En este caso, se crea un mapa en el cual la clave es la edad (tipo entero) y el valor es una lista de Personas, que serán aquellas que tengan dicha edad.


#### 4.4.3. Operación partitioningBy

`Collectors.partitioningBy(Predicate p)`: Devuelve un `Map` con dos claves, una `true` y otra `false`. Se le pasa como argumento un predicado y agrupa los valores ciertos bajo la clave `true` y los valores falsos bajo la clave `false`.

```java
listaPersonas.stream().collect(Collectors.partitioningBy(p->p.getEdad()>18));
```

### 4.5. Operación reduce

La operación `reduce`, aunque no es estríctamente un `Collector`, también es una operación final que nos devuelve un valor. Toma como argumento un valor inicial (identidad), un acumulador y una operación (expresamos el acumulador *dentro* de la operación). 

También puede no tener un valor inicial, pero entonces la operación debe devolver un `Optional<T>`, que sirve para manejar los posibles valores nulos. [Consulta los métodos del envoltorio `Optional` en la documentación oficial de java](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html).

El acumulador es una variable donde se va almacenando el resultado de una operación. Lo que hacemos es pasarle la operación directamente:

```java
List<Integer> lista = List.of(1,2,3,4);
lista.stream().reduce(0, (acumulador,valorDeLaLista)-> acumulador + valorDeLaLista);
```

En este caso, lo que hace es *dado un valor inicial* `0`, *almacénalo en el* `acumulador` *y, para cada valor de la lista* `valorDeLaLista`, *realiza la operación* `acumulador + valorDeLaLista`*, almacenando el resultado en* `acumulador`.

La operación `reduce`, si bien algo confusa al principio, es extremadamente poderosa y puede sustituir a los `Collectors` completamente (algo no necesariamente deseable).

### 4.6. Operaciones finales find y match

Las operaciones **`find`** y **`match`** son terminales y devuelven un **resultado booleano o un Optional**, dependiendo de la operación. Son muy útiles para **consultas rápidas** sobre los elementos de un Stream.


#### 4.6.1. `findFirst()` y `findAny()`

Estas operaciones buscan un **elemento del Stream**.

* **`findFirst()`**: devuelve el **primer elemento** del Stream que cumpla la condición (útil en Streams ordenados).
* **`findAny()`**: devuelve **cualquier elemento** que cumpla la condición (puede ser más eficiente que `findFirst()` cuando se trabaja con streams paralelos, que no están recogidos en estos apuntes).

Ambos devuelven un `Optional<T>`, porque puede que no haya ningún elemento que cumpla la condición.

```java
List<String> lista = List.of("Ana", "Luis", "Bea", "Carlos");

Optional<String> primero = lista.stream()
    .filter(s -> s.length() > 3)
    .findFirst();

primero.ifPresent(System.out::println); // Ana
```

> **NOTA:** El método ifPresent(Consumer) recibe una función de tipo consumidor y la ejecuta con el valor del envoltorio en caso de que no sea nulo. En este caso, es casi equivalente a hacer System.out.println(primero.get()), aunque más seguro. 

#### 4.6.2. `allMatch()`, `anyMatch()` y `noneMatch()`

Estas operaciones permiten **verificar si los elementos cumplen una condición**.

* **`allMatch(Predicate)`**: Devuelve `true` si **todos los elementos cumplen la condición**.
* **`anyMatch(Predicate)`**: Devuelve `true` si **al menos un elemento cumple la condición**.
* **`noneMatch(Predicate)`**: Devuelve `true` si **ningún elemento cumple la condición**.

```java
List<Integer> numeros = List.of(2, 4, 6, 8);

boolean todosPares = numeros.stream().allMatch(n -> n % 2 == 0);
boolean algunoMayorQue5 = numeros.stream().anyMatch(n -> n > 5);
boolean ningunoNegativo = numeros.stream().noneMatch(n -> n < 0);

System.out.println(todosPares);       // true
System.out.println(algunoMayorQue5);  // true
System.out.println(ningunoNegativo);  // true
```

### 4.7. Operación foreach

La operación final `foreach(Consumer)` nos permite recorrer cada elemento del stream y realizar con él una operación consumer (es decir, que no devuelve nada). Es muy habitual, por ejemplo, usarla con System.out.println():

```java
listaPersonas().stream().foreach(p->System.out.println(p.getNombre()));
```

Cabe recordar que también podemos usar métodos de referencia para simplificar estas operaciones. Por ejemplo, si la clase Persona tuviera un método toString() bien definido, podríamos hacer:

```java
listaPersonas().stream().foreach(p->System.out.println(p));
```
Que podríamos simplificar usando métodos de referencia de la siguiente manera:

```java
listaPersonas().stream().foreach(System.out::println);
```

## 5. Conclusión

Estos son los casos más útiles en los que usar la programación funcional y las operaciones lambda. Tratar los datos de esta manera no es necesariamente más eficiente que hacerlo de la forma habitual, pero sí tiene dos ventajas fundamentales:

1) El código que creas es mucho más compacto.
Dada esta lista:
```java
List<String> listaStrings = List.of("Juan", "Pepe", "Verónica", "Laura", "Marcos");
```
Esto:

```java
Map<Boolean,List<String>> m1 = listaStrings.stream().collect(Collectors.partitioningBy(s->s.length() > 4));
```
Es equivalente a esto:

```java
Map<Boolean,List<String>> m2 = new HashMap<>();
for(String s : listaStrings){
    if (s.length() > 4){
        m2.get(true).add(s);
    }else{
        m2.get(false).add(s);
    }
}
```

2) Deridada de la anterior, el código es menos propenso a errores (hay menos sitios en los que fallar).

Con este ejemplo tan sencillo ya se puede apreciar la *magia* y el *encanto* de este tipo de sintaxis. El código se queda mucho menos verboso y hace falta usar muchas menos variables intermedias. Además, si estás acostumbrado al cálculo matemático, también es más fácil y rápido de leer (aunque para una persona que no esté familiarizada con las matemáticas, probablemente resulte todo lo contrario).

> **CONSEJO:** Recuerda el flujo de trabajo con los streams. 
> 1) Transformar la colección en Stream
> 2) Realizar las operaciones intermedias (filtros, mapeos, etc)
> 3) Realizar la operación final para obtener un valor o una colección de valores.

---

> **ACTIVIDAD:** Dada una lista de Personas, utiliza streams para conseguir los siguientes resultados.
> * Una lista con todas las personas cuyo nombre empiece por la letra `A`.
>   * Haz una versión que los muestre por pantalla con `foreach()`.
> * Una lista con los nombres de todas las personas que sean mayores de 20 años.
>   * Haz una versión que los muestre por pantalla con `foreach()`.
> * Un mapa que divida las personas entre `"Menores de edad"` (<18), `"En edad de trabajar"` (entre 18 y 67) y `"En edad de retirarse"` (>=67).
> * Un String que contenga las iniciales de todas las personas, ordenadas por edad de menor a mayor y después por orden alfabético, separadas por el carácter `-`. Haz una versión con collect() y otra con reduce().
> * Encuentra si hay alguna persona cuyo nombre empiece por consonante y sea mayor de edad. Haz la versión que diga si sí o si no y la versión que devuelva a la persona en concreto que cumpla las condiciones.

> **ACTIVIDAD**:
> Mejora la práctica de la unidad de programación anterior (My Favourite Composer) de la siguiente forma:
> * Optimiza el código que maneja las colecciones empleando **programación funcional**.

