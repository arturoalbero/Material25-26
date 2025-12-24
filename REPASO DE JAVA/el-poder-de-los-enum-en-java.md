# El poder de los ENUM en Java

## 1. Enum, ese tipo de datos

Un `enum` es un tipo especial de clase que representa una enumeración, es decir, un conjunto finito y fijo de constantes.
```java
public enum Dia{
    LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
}
```
Por convenio, los distintos valores de la enumeración se escriben con mayúsculas. Los enums básicos mejoran la legibilidad y evitan errores que podrían ocurrir si empleáramos Strings. Además, el compilador controla los valores posibles, lo que los hace más seguros y expresivos que otras alternativas y ayudan también a los IDE a realizar correctamente la autocompleción.

## 2. Uso básico de los `enum`

Aunque los `enum` en Java son mucho más potentes que en la mayoría de lenguajes, comparten el uso básico para el que fueron diseñados. Lo más habitual es usarlos en comparaciones o en `switch-case`. Los `enum` no emplean el método `equals` (aunque disponen de él), sino que usan el operador `==` ya que cada valor del enum es una **instancia única**. Los valores del `enum` se invocan poniendo el nombre de la clase, un punto, y el valor que queremos invocar:

```java
if(hoy == Dia.LUNES){
    System.out.println("Inicio de la semana");
}
```
```java
switch(hoy){
    case LUNES:
        System.out.println("Inicio de la semana");
        break;
    case SABADO:
    case DOMINGO:
        System.out.println("Fin de semana");
        break;
    default:
        System.out.println("Entre semana");
}
```
## 3. Métodos básicos

1. `values()`

El método `values` devuelve un array con todos los valores del enumerador.
```java
for (Dia d : Dia.values()) {
    System.out.println(d);
}
```

2. `valueOf(String)`

El método `valueOf` convierte un String que se le pasa como argumento en un enum del tipo. Lanza una `IllegalArgumentException` en caso de que no exista un valor equivalente.
```java
Dia d = Dia.valueOf("LUNES");
```

3. `name()`

El método `name()` devuelve el nombre exacto del enum, en String.
```java
System.out.println(d.name()); // "LUNES"
```

4. `ordinal()`

El método `ordinal()` devuelve la posición del valor del enum, empezando en 0. No es una buena práctica usarlo en la lógica de negocio ya que el orden cambiaría si cambiáramos algo en el código de la clase.

```java 
System.out.println(Dia.LUNES.ordinal()); // 0
```

El método `ordinal` no forma parte del contrato lógico del enum (es decir, de cómo se debe usar), sino de su implementación interna. Esto es el motivo por el que existe, pero no es aconsejable su uso.

## 4. Usos avanzados de `enum`

### 4.1. Enums con atributos

En Java, los enums pueden tener campos, constructor y métodos. Esto hace que su usabilidad aumente considerablemente y los convierte en un elemento muy flexible del lenguaje.

Por ejemplo, en el siguiente `enum` vamos a añadir un atributo para determinar qué día es festivo, para así poder consultarlo con el método `isFestivo`:
```java
public enum Dia {
    LUNES(false),
    SABADO(true),
    DOMINGO(true);

    private boolean festivo;

    Dia(boolean festivo) {
        this.festivo = festivo;
    }

    public boolean isFestivo() {
        return festivo;
    }
}
```
```java
if (Dia.DOMINGO.isFestivo()) {
    System.out.println("No se trabaja");
}
```

Cada valor del enum es una instancia distinta, con sus propios atributos.

> **ACTIVIDAD 1:** Define un enum para la baraja del juego **SIETE Y MEDIO**. Las cartas disponibles son AS, 2, 3, 4, 5, 6, 7, SOTA, CABALLO y REY. Todas las cartas valen su valor nominal, valiendo el AS un punto, el 2 dos puntos, etc. Las figuras, sin embargo, valen medio punto cada una. 
> * Define el enum con el atributo necesario para almacenar los puntos
> * Define el método necesario para consultar los puntos.
> * Define un método `compararCarta` que compare la carta con otra pasada como parámetro. Devuelve -1 si la carta es menor, 0 igual o 1 mayor en valor de juego que la pasada por parámetro.


### 4.2. Métodos personalizados en enums, usando switch

En la clase enum podemos crear métodos que tengan comportamientos distintos en función del valor del enum. Por ejemplo, en el siguiente código en función de si el valor es `SUMA` o `RESTA`, la función aplicar se comportará de una forma o de otra:

```java
public enum Operacion {
    SUMA, RESTA;

    public int aplicar(int a, int b) {
        switch (this) {
            case SUMA: return a + b;
            case RESTA: return a - b;
            default: throw new AssertionError();
        }
    }
}
```
```java
Operacion op = Operacion.SUMA;
System.out.println(op.aplicar(3, 2));
```

> **ACTIVIDAD 2:** Crea un enum `Descuento` con los valores NORMAL, PREMIUM y VIP y crea un método `aplicar` que, dependiendo del valor del enum, aplique un descuento u otro (NORMAL sin descuento, PREMIUM con un 10% y VIP con un 20%).

### 4.3. Métodos personalizados en enums, usando sobreescritura

Lo anterior lo podemos conseguir aplicando lo que se conoce como patrón de diseño `strategy`, mediante la sobreescritura de un método abstracto. De esta forma, cada valor del enum sobreescribe un método cuya firma ha sido definida previamente:

```java
public enum Operacion {
    SUMA {
        public int aplicar(int a, int b) {
            return a + b;
        }
    },
    RESTA {
        public int aplicar(int a, int b) {
            return a - b;
        }
    };

    public abstract int aplicar(int a, int b);
}
```
En la práctica, el resultado funcional es el mismo. Con esta aproximación conseguimos un código limpio y extensible.

> **ACTIVIDAD 3:** Realiza la actividad 2, pero empleando el patrón de diseño `Strategy` (con el método abstracto).

> **ACTIVIDAD 4:** Añade más valores para el enum e impleméntalos tanto con el método de la **actividad 2** como con el método de la **actividad 3**. Analiza las ventajas e inconvenientes de cada uno de los enfoques (con **switch** o con **método abstracto**).

### 4.4. Métodos estáticos

Como todas las clases en Java, los enum también pueden tener métodos y atributos estáticos, que funcionan de la misma manera. En el siguiente código, el método estático `esValido` recibe un valor `s` y determina si es un valor válido para el enum:
```java
public enum Estado {
    ACTIVO, INACTIVO;

    public static boolean esValido(String s) {
        for (Estado e : values()) {
            if (e.name().equals(s)) {
                return true;
            }
        }
        return false;
    }
}
```

> **ACTIVIDAD 5:** Dado el enum de la actividad 1 (el de las cartas del siete y medio), haz lo siguiente:
> * Define un método que te permita sumar una colección de cartas y devuelva el valor obtenido.
> * Define una clase para representar una mano. Una mano consiste en una colección de cartas. Puedes añadir algún atributo más, como el nombre del jugador.
> * Define un método que te permita saber si una mano es perdedora o no. Una mano pierde cuando supera la puntuación de 7'5. 
> * Define un método que te permita saber, dada una colección de manos, cuál es el jugador cuya mano gana (aquella que se acerca más a 7'5 sin pasarse). Como puede haber varios ganadores, debería devolver una lista de Strings con los nombres de los ganadores.

### 4.5. Interfaces y enums

Los `enum` no pueden heredar de otras clases, aunque extienden implícitamente de `java.lang.Enum`. Lo que sí pueden hacer es implementar interfaces:
```java
public enum Rol implements Serializable {
    ADMIN, USER;
}
```

> **ACTIVIDAD 6:** Dado el código anterior, vamos a refactorizar el enum para poder usar los métodos `compararCarta` y los métodos estáticos en varias colecciones de cartas. Para ello, crea una interfaz `Carta` que contenga dichos métodos. El enum pasará a ser `CartaSieteYMedio`.

## 5. La colección `EnumMap`

Se pueden emplear los enum como claves en mapas. De hecho, es un tipo de mapas muy eficiente, más rápido que HashMap y que consume menos memoria. Por supuesto, nuestro mapa debe ser susceptible de tener las claves como `enum` pero, en caso afirmativo, es la manera más óptima de crearlo:

```java
EnumMap<Dia, String> mensajes = new EnumMap<>(Dia.class);
mensajes.put(Dia.LUNES, "Duro");
```

Igual que con todas las colecciones, puedes emplear (y además es aconsejable hacerlo) la interfaz básica de la colección para limitar el `API` expuesto, favoreciendo el desacoplamiento y facilitando cambios futuros en la implementación, como cambiar el enumMap por otro tipo de mapa más adelante si lo necesitaras:

```java
Map<Dia, String> mensajes = new EnumMap<>(Dia.class);
mensajes.put(Dia.LUNES, "Duro");
```

Puedes consultar más cosas acerca de los enumMap [**aquí**](https://www.baeldung.com/java-enum-map). Además, otras colecciones como los conjuntos (set) también se benefician de usar enum cuando es apropiado. Puedes consultar más sobre los `enumSet` [**aquí**](https://www.baeldung.com/java-enumset).

> **ACTIVIDAD 7:** Dado el enum de los días de la semana, crea un EnumMap en el cual se asocien a cada día de la semana una lista de actividades. Para ello, define una clase Actividad que contenga una descripción de la actividad y el número de horas que ocupa. Una vez definida, crea los siguientes métodos:
> * Un método que sume todas las horas de un día determinado y devuelva dicho valor.
> * Un método que, dado un EnumMap, devuelva cuál es el día más cargado a nivel de horas. 

## 6. Consideraciones finales

Por todo esto, los `enum` son un tipo de datos muy útil y práctico. Son especialmente relevantes para temas de seguridad, ya que garantizan una sola instancia por valor y se suelen emplear para determinar estados, roles, tipos, etc. 

Por otro lado, es mucho más seguro y legible emplear `enum` en lugar de constantes (como se hacía en C).

Eso sí, hay que tener en cuenta que no todos los lenguajes de programación manejan los enum de una forma tan prolija como lo hace Java. En C++ o C# el uso es mucho más rudimentario. En C, como ya hemos expuesto antes, ni siquiera existen como tal, son constantes. 

En Python, aunque los enum también pueden tener métodos, no suelen tener atributos y no son tan robustos. Javascript tampoco tiene enum, sino que emplea patrones. Typescript, al ser un superconjunto de Javascript, tampoco tiene enum reales, sino que los tiene a nivel de tipado y los simula a nivel interno, ya que los transforma en estructuras de Javascript durante la compilación.

En definitiva, Java es el lenguaje con el modelo de enum más potente y seguro, pero al mismo tiempo eso podría dificultar la transferencia de código desde Java hacia otros lenguajes con menor potencia, para los que habría que emplear clases auxiliares para replicar su comportamiento.

> **ACTIVIDAD 8:** Traduce a C#, Python y Javascript el resultado de la **actividad 6** (las cartas), anotando los cambios que debes realizar para que tenga un comportamiento equivalente.
