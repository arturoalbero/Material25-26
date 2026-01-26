# Introducción a la Integración continua

## CI/CD: Integración y Entrega/Despliegue Continuos

**CI/CD** es una práctica fundamental en el desarrollo de software moderno que integra dos conceptos clave: la **Integración Continua (CI)** y la **Entrega Continua (CD)** o **Despliegue Continuo (CD)**. Su objetivo es automatizar y mejorar el proceso desde la creación del código hasta su implementación en producción, permitiendo ciclos de desarrollo más rápidos, eficientes y fiables.

La **Integración Continua (CI)** consiste en integrar los cambios de código en un repositorio compartido de forma frecuente. Cada integración se valida automáticamente mediante compilaciones y pruebas automatizadas, lo que permite detectar errores de manera temprana y mantener una base de código estable.

La **Entrega Continua (CD)** automatiza la preparación del software para su lanzamiento. El código que supera las pruebas queda siempre en un estado desplegable, aunque la decisión de desplegar en producción se realiza manualmente.

El **Despliegue Continuo (CD)** automatiza también el despliegue en producción. Si el código supera todas las pruebas, se despliega automáticamente sin intervención humana.

En conjunto, CI/CD define un *pipeline* automatizado que facilita la integración, prueba y entrega de software de forma constante, reduciendo riesgos y acelerando el desarrollo.


## Crear el Proyecto Spring Boot con Maven y VS Code

En este documento configuraremos un flujo de trabajo de **CI/CD** usando **GitHub Actions** sobre un proyecto **Spring Boot** con **Maven** y **Java 17**, trabajando desde **Visual Studio Code**.

1. Ir a [https://start.spring.io](https://start.spring.io).
2. Configurar el proyecto:

   * **Project**: Maven
   * **Language**: Java
   * **Spring Boot**: versión estable por defecto
   * **Java**: 17
   * **Group**: `com.ejemplo`
   * **Artifact**: `ci-cd-demo`
3. Generar el proyecto y descargar el archivo `.zip`.
4. Descomprimirlo y abrir la carpeta del proyecto en **VS Code** (`File > Open Folder`).

Estructura del proyecto:

```
ci-cd-demo
│── src
│   ├── main
│   │   └── java
│   │       └── com.ejemplo.cicddemo
│   │           └── CiCdDemoApplication.java
│   └── test
│       └── java
│           └── com.ejemplo.cicddemo
│               └── CalculadoraTest.java
│── pom.xml
│── .gitignore
```

## Agregar Código y Pruebas

### Clase a probar (`Calculadora.java`)

Crear el archivo `src/main/java/com/ejemplo/cicddemo/Calculadora.java`:

```java
package com.ejemplo.cicddemo;

public class Calculadora {
    public int sumar(int a, int b) {
        return a + b;
    }

    public int restar(int a, int b) {
        return a - b;
    }

    public int multiplicar(int a, int b) {
        return a * b;
    }

    public int dividir(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("No se puede dividir por cero");
        }
        return a / b;
    }
}
```

### Pruebas con JUnit (`CalculadoraTest.java`)

En `src/test/java/com/ejemplo/cicddemo/CalculadoraTest.java`:

```java
package com.ejemplo.cicddemo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculadoraTest {

    private final Calculadora calculadora = new Calculadora();

    @Test
    void testSuma() {
        assertEquals(5, calculadora.sumar(2, 3));
    }

    @Test
    void testResta() {
        assertEquals(1, calculadora.restar(5, 4));
    }

    @Test
    void testMultiplicacion() {
        assertEquals(10, calculadora.multiplicar(2, 5));
    }

    @Test
    void testDivision() {
        assertEquals(2, calculadora.dividir(10, 5));
    }

    @Test
    void testDivisionPorCero() {
        assertThrows(ArithmeticException.class, () -> calculadora.dividir(10, 0));
    }
}
```

## Configurar Git y Subir el Proyecto a GitHub

### Inicializar un repositorio Git

Desde la terminal integrada de **VS Code** (`Terminal > New Terminal`):

```sh
git init
git add .
git commit -m "Primer commit"
```

### Subir el código a GitHub

1. Crear un nuevo repositorio en **GitHub**.
2. Copiar la URL del repositorio y ejecutar:

```sh
git remote add origin <URL_DEL_REPOSITORIO>
git branch -M main
git push -u origin main
```

El proyecto ya está disponible en GitHub.

## Configurar CI/CD con GitHub Actions

### Crear un workflow en GitHub Actions

1. En el repositorio de GitHub, ir a la pestaña **Actions**.
2. Seleccionar **New workflow** → **Set up a workflow yourself**.
3. Crear el archivo `.github/workflows/ci.yml`.
4. Añadir el siguiente contenido:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Clonar repositorio
        uses: actions/checkout@v4

      - name: Configurar JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Construir con Maven
        run: mvn clean package

      - name: Ejecutar pruebas unitarias
        run: mvn test
```

* El workflow se ejecuta en cada **push** o **pull request** sobre la rama `main`.
* Utiliza **Ubuntu** como entorno de ejecución.
* Configura **Java 17**.
* Compila el proyecto con **Maven**.
* Ejecuta las pruebas unitarias con **JUnit**.

Tras hacer commit de este archivo, GitHub Actions ejecutará automáticamente el pipeline en cada cambio.

> **ACTIVIDAD:** Crea un workflow para ejecutar pruebas de un programa simple utilizando Spring Boot y Maven. Por ejemplo, un programa que analice fechas diciendo si son correctas, si pertenecen a un año bisiesto o no, su signo del zodiaco occidental y su signo del zodiaco chino (recoge fechas entre 2000 y 2005, para limitar el alcance del programa)
