## 3.3 - Regular Expressions

Information extracted from [this webpage](https://nachoiborraies.github.io/java/md/en/03d). It's later expandend adding a section about combining regular expressions and functional programming.

## Using Regular Expressions

A **regular expression** (or **regex**, in its abbreviated form) is a sequence of special characters that allows us to detect patterns in texts. It is not meant for humans but for computers, so even if they appear to be very strange, a computer is capable of detect any text pattern if the regex is well defined.

For example, an identification number formed by 8 digits and one capital letter, or an email that contains an `@`.

Using regular expressions, we can easily detect these patterns in a given text, or also **enforce a text to comply with a format** when entered by the user.

## 1\. Basic Regular Expression Syntax

To work with regular expressions in Java, we need to use the classes from the `java.util.regex` package. Specifically, we'll rely on:

  * **`Pattern`** → allows defining a regular expression pattern.
  * **`Matcher`** → allows checking if a text matches a given pattern.

> **TIP:** Actually, we can use regular expressions in more ways than these and the String class, for instance, has several methods that use regex. However, `Pattern` and `Matcher` work very well for the general use of regex.

### 1.1. `Pattern` Class

The `Pattern` class has several useful methods, including:

  * `compile`: creates a `Pattern` object from a regular expression.
  * `matcher`: returns a `Matcher` object that can use that pattern with a text.

### 1.2. `Matcher` Class

The `Matcher` class allows using the following methods:

  * `find`: checks if a pattern is found anywhere in the text.
  * `matches`: checks if **the entire text** matches the pattern (not just a part).
    The static method `Pattern.matches()` also exists and does the same thing.

### 1.3. Example

Let's check if a text contains at least one digit between 0 and 9.
The `\d` symbol represents a digit, so we'll use it within the pattern:

```java
String texto = "Hola, me llamo Nacho y tengo 44 años";
Pattern p = Pattern.compile("\\d");
Matcher m = p.matcher(texto);

if (m.find()) {
    System.out.println("The text contains digit(s)");
} else {
    System.out.println("The text does not contain any digits");
}
```

> Note: We must escape the `\` character when writing it inside a String, which is why we use `\\d`.

### 1.4. Basic Symbols

| Symbol | Meaning |
| :--- | :--- |
| x | The literal character 'x' |
| \\t | Tab |
| \\n | Newline |
| [abc] | Any of the characters 'a', 'b', or 'c' |
| [^abc] | Any character **except** 'a', 'b', or 'c' |
| [a-zA-Z] | Range from 'a' to 'z' or 'A' to 'Z' |
| . | Any character |
| ^ | Start of line |
| $ | End of line |
| \\d | Digit (0–9) |
| \\D | Not a digit |
| \\s | Whitespace, tab, or line break |
| \\S | Anything that is not whitespace |
| \\w | Alphanumeric character or underscore |
| \\W | Anything that is **not** alphanumeric |
| (one | two) | The text "one" or "two" |

**Examples:**

  * Text that ends with a period:

    ```java
    Pattern p = Pattern.compile("\\.$");
    ```

  * Text formed by 4 digits:

    ```java
    Pattern p = Pattern.compile("^\\d\\d\\d\\d$");
    ```

  * The seasons of the year:

    ```java
    Pattern p = Pattern.compile("(winter|spring|summer|autumn)");
    ```

> **ACTIVITY**
>
> Create a project called **CarIDCheck** that prompts the user for a license plate number and verifies if it is composed of **4 digits followed by 3 capital letters**.
>
> (We are not checking if the letters are vowels or not, only that they are capital letters).

-----

## 2\. More Complex Expressions

To create more complex expressions, we can use **cardinality symbols**, which indicate how many times an element can be repeated.

| Symbol | Meaning |
| :--- | :--- |
| x? | The symbol x appears 0 or 1 time |
| x+ | The symbol x appears 1 or more times |
| x\* | The symbol x appears 0 or more times |
| x{n} | The symbol x appears n times |
| x{n,} | Appears at least n times |
| x{n,m} | Appears between n and m times (both inclusive) |

**Examples:**

  * Text formed by 4 digits:

    ```java
    Pattern p = Pattern.compile("^\\d{4}$");
    ```

  * ID formed by 8 digits and one capital letter:

    ```java
    Pattern p = Pattern.compile("^\\d{8}[A-Z]$");
    ```

> **ACTIVITY**
>
> Repeat the previous exercise using **cardinality symbols**.

> **ACTIVITY**
> Create a program called **EmailChecker** that prompts the user for an email address and checks if it is valid.
>
> A valid email will have:
>
>   * one or more alphanumeric characters,
>   * followed by `@`,
>   * followed by one or more alphanumeric characters,
>   * followed by a period `.`,
>   * and one or more alphanumeric characters.
>
> Valid example: `myEmail@one.com`
> Invalid example: `myOtherMail@aaa`

-----

## 3\. Using Groups

**Groups** allow us to isolate parts of a text that match a pattern, so we can process them later in the code.
Each group is defined within parentheses `( )` and we can access them with the `group()` method of the `Matcher` class.

**Example: getting all sequences of 4 digits in a text:**

```java
String texto = "Einstein nació en 1879 y Edison en 1847";
Pattern p = Pattern.compile("(\\d{4})");
Matcher m = p.matcher(texto);

if (!m.find()) {
    System.out.println("The text has no sequences of 4 digits");
} else {
    do {
        String dato = m.group();
        System.out.println("Found: " + dato);
    } while (m.find());
}
```

Every time we call `group()`, the next match is obtained.

### 3.1. Multiple Groups

We can define **more than one group** within an expression.
In this case, `group(n)` returns the group number `n`, starting from 1.

Example: identifying first and last names in a text:

```java
String texto = "Albert Einstein nació en 1879 y Thomas Edison en 1847";
Pattern p = Pattern.compile("([A-Z][a-z]+) ([A-Z][a-z]+)");
Matcher m = p.matcher(texto);

if (!m.find()) {
    System.out.println("No names were found");
} else {
    do {
        String nombre = m.group(1);
        String apellido = m.group(2);
        System.out.println("Found: " + nombre + " " + apellido);
    } while (m.find());
}
```

**Output:**

```
Found: Albert Einstein  
Found: Thomas Edison
```

> **ACTIVITY**:
>
> Create a program called **HourIdentifier** that searches for times within a text.
> A time is formed by two digits, followed by `:`, and two other digits (for example, `08:45`).
> We don't need to check if the time is valid, just identify it.

-----

## 4\. Regular Expressions with `Stream().filter()`

We can combine **regular expressions** with **Streams** to easily filter a list of strings based on a given pattern.

For example, if we want to keep only the elements that **contain at least one number**, we can do it like this:

```java
import java.util.*;
import java.util.regex.*;
import java.util.stream.*;

public class RegexStreamExample {
    public static void main(String[] args) {
        List<String> texts = List.of("abc", "a1b", "hola", "java8", "stream");

        Pattern pattern = Pattern.compile(".*\\d.*"); // contains at least one digit

        List<String> withNumbers = texts.stream()
            .filter(t -> pattern.matcher(t).matches())
            .collect(Collectors.toList());

        System.out.println("Texts that contain numbers:");
        withNumbers.forEach(System.out::println);
    }
}
```

**Output:**

```
Texts that contain numbers:
a1b
java8
```

What happens is:

  * `Pattern.compile(".*\\d.*")` defines a regular expression that means “contains at least one digit”. 
    * `.*` means *any character may appear 0 or more times*, `\\d` (the escaped `\d`) means *one digit* and, at the end, it appears again the `.*`.
  * `stream().filter(...)` evaluates each string using `matcher().matches()`.
  * `collect(Collectors.toList())` collects the matches into a new mutable list.

> **ACTIVITY**:
> Create a program that, given a list of possible email addresses, **uses `stream().filter()` and a regular expression** to keep only the **valid** emails (those that have `@` and a correct domain).

> **ACTIVITY**:
> Improve the practice from the previous programming unit (My Favourite Composer) with regular expressions, specifically **searchComposerView** so that it allows searching with partial names using **regular expressions**. For example, if you include *Franz Liszt* and *Franz Peter Schubert* and search for *Franz*, both should appear.