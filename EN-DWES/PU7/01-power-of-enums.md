# The Power of ENUMs in Java

## 1. Enum, That Data Type

An `enum` is a special type of class that represents an enumeration, that is, a finite and fixed set of constants.

```java
public enum Dia{
    LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
}
```

By convention, the different values of an enumeration are written in uppercase. Basic enums improve readability and prevent errors that could occur if we used Strings. In addition, the compiler controls the possible values, which makes them safer and more expressive than other alternatives and also helps IDEs perform correct autocompletion.

## 2. Basic Usage of `enum`

Although `enum`s in Java are much more powerful than in most languages, they share the basic usage for which they were designed. The most common use is in comparisons or in `switch-case` statements. `enum`s do not rely on the `equals` method (although they do provide it), but instead use the `==` operator, since each enum value is a **unique instance**. Enum values are accessed by writing the class name, a dot, and the value we want to reference:

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

## 3. Basic Methods

1. `values()`

The `values` method returns an array containing all the values of the enumeration.

```java
for (Dia d : Dia.values()) {
    System.out.println(d);
}
```

2. `valueOf(String)`

The `valueOf` method converts a `String` passed as an argument into an enum value of the corresponding type. It throws an `IllegalArgumentException` if no equivalent value exists.

```java
Dia d = Dia.valueOf("LUNES");
```

3. `name()`

The `name()` method returns the exact name of the enum value as a `String`.

```java
System.out.println(d.name()); // "LUNES"
```

4. `ordinal()`

The `ordinal()` method returns the position of the enum value, starting at 0. It is not good practice to use it in business logic, since the order would change if the enum definition were modified.

```java
System.out.println(Dia.LUNES.ordinal()); // 0
```

The `ordinal` method is not part of the logical contract of an enum (that is, how it is intended to be used), but rather part of its internal implementation. This is why it exists, but its use is not recommended.

## 4. Advanced Uses of `enum`

### 4.1. Enums with Attributes

In Java, enums can have fields, constructors, and methods. This significantly increases their usability and makes them a very flexible language feature.

For example, in the following enum we add an attribute to determine whether a day is a holiday, allowing us to query it using the `isFestivo` method:

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

Each enum value is a distinct instance, with its own attributes.

> **ACTIVITY 1:** Define an enum for the deck used in the **SEVEN AND A HALF** card game. The available cards are ACE, 2, 3, 4, 5, 6, 7, JACK, KNIGHT, and KING. All cards are worth their nominal value (ACE is worth one point, 2 is worth two points, etc.). Face cards, however, are worth half a point each.
>
> * Define the enum with the necessary attribute to store the points
> * Define the method needed to retrieve the points
> * Define a `compararCarta` method that compares the card with another card passed as a parameter. Return -1 if the card is worth less, 0 if equal, or 1 if greater in game value than the parameter card

> **NOTE:** To store the points that each card is worth it, you have several options. The obvious is to use some kind of float or double number, but you can multiply the points by ten and use more eficient data types as `byte`, which can represent values up to 127. You can return the value in float or double, but store it in byte to save memory. This kind of micro optimization is only necessary if you are using massive data. However, thinking in this kind of things allows you to train your *developer-brain*, in order to start thinking as a developer.


### 4.2. Custom Methods in Enums Using `switch`

Inside an enum class we can create methods that behave differently depending on the enum value. For example, in the following code, depending on whether the value is `SUMA` or `RESTA`, the `aplicar` method behaves differently:

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

> **ACTIVITY 2:** Create an enum `Descuento` with the values NORMAL, PREMIUM, and VIP, and create an `aplicar` method that applies a different discount depending on the enum value (NORMAL no discount, PREMIUM 10%, and VIP 20%).

### 4.3. Custom Methods in Enums Using Overriding

The previous approach can be achieved by applying what is known as the `Strategy` design pattern, through the overriding of an abstract method. In this way, each enum value overrides a method whose signature has been defined beforehand:

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

In practice, the functional result is the same. With this approach, we achieve cleaner and more extensible code.

> **ACTIVITY 3:** Complete Activity 2, but using the `Strategy` design pattern (with an abstract method).

> **ACTIVITY 4:** Add more values to the enum and implement them using both approaches: the one from **Activity 2** and the one from **Activity 3**. Analyze the advantages and disadvantages of each approach (`switch` versus abstract method).

### 4.4. Static Methods

Like any other class in Java, enums can also have static methods and attributes, which work in the same way. In the following code, the static method `esValido` receives a value `s` and determines whether it is a valid enum value:

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

> **ACTIVITY 5:** Given the enum from Activity 1 (the Seven and a Half cards), do the following:
>
> * Define a method that allows you to sum a collection of cards and return the resulting value
> * Define a class to represent a hand. A hand consists of a collection of cards. You may add additional attributes, such as the player's name
> * Define a method to determine whether a hand is losing. A hand loses when it exceeds a score of 7.5
> * Define a method that, given a collection of hands, determines which player’s hand wins (the one closest to 7.5 without exceeding it). Since there may be multiple winners, it should return a list of `String`s with the winners’ names

### 4.5. Interfaces and Enums

Enums cannot inherit from other classes, although they implicitly extend `java.lang.Enum`. What they *can* do is implement interfaces:

```java
public enum Rol implements Serializable {
    ADMIN, USER;
}
```

> **ACTIVITY 6:** Given the previous code, refactor the enum so that the `compararCarta` method and the static methods can be used across multiple collections of cards. To do this, create an interface `Carta` containing those methods. The enum will become `CartaSieteYMedio`.

## 5. The `EnumMap` Collection

Enums can be used as keys in maps. In fact, this is a very efficient type of map—faster than `HashMap` and consuming less memory. Naturally, the map must support enum keys, but when it does, this is the optimal way to create it:

```java
EnumMap<Dia, String> mensajes = new EnumMap<>(Dia.class);
mensajes.put(Dia.LUNES, "Duro");
```

As with all collections, you can (and are encouraged to) use the base collection interface to limit the exposed API, promoting decoupling and facilitating future changes in the implementation, such as replacing the `EnumMap` with another type of map if needed:

```java
Map<Dia, String> mensajes = new EnumMap<>(Dia.class);
mensajes.put(Dia.LUNES, "Duro");
```

You can find more information about `EnumMap` [**here**](https://www.baeldung.com/java-enum-map). Additionally, other collections such as sets also benefit from using enums when appropriate. You can learn more about `EnumSet` [**here**](https://www.baeldung.com/java-enumset).

> **ACTIVITY 7:** Given the enum representing the days of the week, create an `EnumMap` that associates each day with a list of activities. To do so, define an `Actividad` class containing a description of the activity and the number of hours it takes. Once defined, create the following methods:
>
> * A method that sums all the hours for a given day and returns the result
> * A method that, given an `EnumMap`, returns the busiest day in terms of total hours

## 6. Final Considerations

For all these reasons, enums are a very useful and practical data type. They are especially relevant in security-related contexts, since they guarantee a single instance per value and are commonly used to represent states, roles, types, and so on.

Furthermore, using enums is much safer and more readable than using constants (as was traditionally done in C).

That said, not all programming languages handle enums as thoroughly as Java does. In C++ or C#, their usage is much more rudimentary. In C, as mentioned earlier, they do not even exist as such and are merely constants.

In Python, although enums can also have methods, they usually do not have attributes and are not as robust. JavaScript does not have enums either, but instead relies on patterns. TypeScript, being a superset of JavaScript, does not have real enums either; instead, it provides them at the type level and simulates them internally by transforming them into JavaScript structures during compilation.

In short, Java has the most powerful and secure enum model, but at the same time this can make it harder to transfer code from Java to other less powerful languages, where auxiliary classes would be required to replicate the same behavior.

> **ACTIVITY 8 (ADVANCED):** Translate the result of **Activity 6** (the cards) into C#, Python, and JavaScript, noting the changes required to achieve equivalent behavior.

## Factory Pattern