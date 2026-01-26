# 5.4 Documentación

<details>

<summary>

## RA6: Elabora la documentación de la aplicación web evaluando y seleccionando herramientas de generación de documentación, control de versiones y de integración continua.

</sumary>

a) Se han identificado diferentes herramientas de generación de documentación.
b) Se han documentado los componentes software utilizando los generadores específicos de las plataformas.
c) Se han utilizado diferentes formatos para la documentación.
d) Se han utilizado herramientas colaborativas para la elaboración y mantenimiento de la documentación.

</details>

## 1. Tipos de documentación

No importa cuán bueno sea el software... si la documentación no es lo suficientemente buena, la gente no lo usará. Y, si tiene que usarse, a menos que la documentación sea adecuada, no se utilizará correctamente.

Para tener una buena documentación, debemos tener en cuenta los siguientes tipos de documentación, de modo que podamos elegir la más adecuada según su propósito final.

Según el uso que se le dará a la documentación, esta puede ser:

- Tutoriales
    - Orientados al aprendizaje
    - Permiten a los usuarios comenzar a usar el software
    - Son como una lección
    - Analogía: enseñar a un niño a cocinar
- Guías prácticas (How-to guides)
    - Orientadas a resultados
    - Muestran cómo resolver un problema o necesidad concreta
    - Son una lista de pasos o etapas
    - Analogía: una receta de un libro de cocina
- Explicaciones
    - Orientadas a la comprensión
    - Explican algo y ofrecen contexto
    - Analogía: un artículo sobre la historia social de la gastronomía
- Referencia
    - Orientada a la información
    - Describe cómo se ha construido algo
    - Es exacta y completa
    - Analogía: una entrada en una enciclopedia

En lo que respecta a productos de software, los tipos más comunes de documentación son:

- **Manuales de usuario**, para enseñar al usuario final cómo utilizar la aplicación.
- **Proceso de software**, un documento que contiene todos los diagramas e informes de las etapas de análisis y diseño de la aplicación, para que se pueda ver cómo ha sido concebida.
- **Referencia de API** (Interfaz de Programación de Aplicaciones), una referencia completa con todos los componentes incluidos en la aplicación, especialmente clases, métodos públicos y elementos. Este último tipo de documentación es particularmente útil para el equipo de desarrollo, ya que facilita el mantenimiento y las futuras actualizaciones del producto.

Para crear un manual de usuario, podemos usar cualquier editor de texto disponible y redactar un documento completo que explique cómo usar cada componente de la aplicación. Alternativamente, también podemos crear un manual de usuario en línea, de modo que los usuarios puedan acceder a un sitio web y buscar el contenido que les interese.

[***fuente***](https://nachoiborraies.github.io/java/md/en/09a)

## 2. Documentación de código

### Javadoc

Javadoc es una herramienta oficial de Java que se utiliza para generar documentación API en formato HTML directamente desde el código fuente. Esta documentación se basa en comentarios especiales que se escriben en el código, justo antes de las clases, métodos y otros elementos, y proporciona una manera fácil de crear y mantener documentación legible y coherente para los desarrolladores. 

Algunos IDE, como IntelliJ, tienen su propio generador de documentación. Sin embargo, para poder compilar la documentación Javadoc en VS Code es necesaria una extensión, como [Javadoc Tools](https://marketplace.visualstudio.com/items?itemName=madhavd1.javadoc-tools).

Javadoc utiliza comentarios específicos que comienzan con `/**` y terminan con `*/`, lo que los distingue de los comentarios regulares en Java (`//` y `/*` ... `*/`). Los comentarios Javadoc incluyen etiquetas especiales:

- `@author`: Especifica quién escribió la clase.
- `@version`: Es la versión actual de la clase, útil para llevar control de cambios.
- `@since`: Indica la fecha o versión en la que la clase fue introducida o modificada.
- `@param` para describir parámetros.
- `@return` para describir el valor de retorno.
- `@throws` para excepciones (si las hay).

```java
/**
 * Clase que representa una cuenta bancaria simple con operaciones 
 * básicas como depósito, retiro y consulta de saldo.
 * 
 * Esta clase es utilizada para gestionar cuentas bancarias individuales
 * en una aplicación de banca.
 * 
 * 
 * @author Juan Pérez
 * @version 1.0
 * @since 2024-10-24
 */
public class CuentaBancaria {

    private double saldo;

    /**
     * Constructor para crear una cuenta bancaria con un saldo inicial.
     * 
     * @param saldoInicial El saldo inicial de la cuenta.
     */
    public CuentaBancaria(double saldoInicial) {
        this.saldo = saldoInicial;
    }

    /**
     * Método para depositar dinero en la cuenta bancaria.
     * 
     * @param monto El monto a depositar.
     */
    public void depositar(double monto) {
        this.saldo += monto;
    }

    /**
     * Método para retirar dinero de la cuenta bancaria.
     * 
     * @param monto El monto a retirar.
     * @throws IllegalArgumentException si el monto es mayor que el saldo.
     */
    public void retirar(double monto) {
        if (monto > saldo) {
            throw new IllegalArgumentException("Fondos insuficientes");
        }
        this.saldo -= monto;
    }

    /**
     * Método que devuelve el saldo actual de la cuenta.
     * 
     * @return El saldo actual de la cuenta.
     */
    public double consultarSaldo() {
        return this.saldo;
    }
}
```
> **ACTIVIDAD 1:** Crea documentación javadoc para el siguiente código, trabajado en la unidad de programación 4. Organiza el proyecto en paquetes para que tenga sentido.

```java
// Martillo.java
public class Martillo {
    protected float longitud;
    protected String marca;
    protected CabezaDeMartillo cabeza; // Composición: Martillo "tiene" una CabezaDeMartillo

    public Martillo() {
        this.cabeza = new CabezaDeMartillo(); // La CabezaDeMartillo se crea con el Martillo
    }

    public void martillar() {
        // Implementación del método martillar
    }
}

// MartilloElectrico.java
public class MartilloElectrico extends Martillo { // Herencia: MartilloElectrico "es un" Martillo
    private float bateria;

    public float getBateria() {
        return bateria;
    }

    public void setBateria(float bateria) {
        this.bateria = bateria;
    }

    public int tiempoRestante() {
        // Cálculo y retorno del tiempo restante de la batería
        return 0; // Placeholder
    }
}

// Trabajador.java
public class Trabajador {
    private String nombre;
    private Martillo martillo; // Agregación: Trabajador "usa un" Martillo

    public Trabajador(String nombre, Martillo martillo) { // El Martillo se pasa al constructor
        this.nombre = nombre;
        this.martillo = martillo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Martillo getMartillo() {
        return martillo;
    }

    public void setMartillo(Martillo martillo) {
        this.martillo = martillo;
    }

    public void trabajar() {
        // Implementación del método trabajar
    }
}

// CabezaDeMartillo.java
public class CabezaDeMartillo {
    private String material;

    public CabezaDeMartillo() {
        // Constructor por defecto
    }

    public CabezaDeMartillo(String material) {
        this.material = material;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }
}
```

### Doxygen

Doxygen es una herramienta externa e independiente que permite generar documentación para diversos lenguajes de programación, como C#, Java o PHP, entre otros. Puedes descargar Doxygen desde su sitio web oficial , en la sección de Descargas . En Windows, solo necesitas ejecutar un instalador.

Luego debemos lanzar el asistente de Doxygen (también conocido como DoxyWizard ), el cual mostrará una pantalla inicial como esta:
![alt text](image-4.png)

En el campo de texto superior, debemos seleccionar la carpeta donde se instaló Doxygen (normalmente C:\Program Files\doxygen). En los campos de texto inferiores, podemos indicar la carpeta de origen para revisar los archivos (podemos marcar la opción de escaneo recursivo) y la carpeta de destino para generar la documentación.

![alt text](image-5.png)

Normalmente, elegimos incluir " Todas las entidades" y, a continuación, el lenguaje de programación que utilizamos (en nuestro caso, "Optimizar para Java" o "C# output "). Después, pasamos al siguiente paso.

![alt text](image-6.png)

Aquí debemos elegir el formato de salida. Normalmente marcamos la casilla HTML y podemos decidir si queremos mostrar un panel de navegación o una opción de búsqueda. Luego, pasamos al siguiente paso.

Los dos últimos pasos consisten en:

- Elegir si desea generar diagramas de clases con la herramienta interna (o con una herramienta externa llamada GraphViz)
- Ejecutar Doxygen

Tras ejecutar Doxygen , verá el progreso en el área de texto del registro hasta que aparezca el mensaje final de finalización de Doxygen. A continuación, puede mostrar la salida HTML de Doxygen o navegar a la carpeta de salida seleccionada.

![alt text](image-7.png)

> **ACTIVIDAD 2**: A partir de la actividad 1, emplea Doxygen para generar la documentación.

[***fuente***](https://nachoiborraies.github.io/java/md/en/09c)

## 3. Markdown y Plantuml

### 3.1\. ¿Qué es Markdown y cómo se utiliza?

**Markdown** es un lenguaje de marcado ligero que permite formatear texto de manera sencilla e intuitiva. Es muy utilizado para escribir documentación, blogs o cualquier otro tipo de texto que luego se convierte a HTML, ya que facilita mucho su legibilidad. Un documento Markdown es esencialmente texto plano que se puede leer fácilmente y que luego se puede exportar a otros formatos como HTML o PDF.

Estos apuntes están escritos combinando Markdown con plantuml y mermaidjs. Además, Markdown es el lenguaje de marcado más empleado a la hora de elaborar **documentación técnica**, y también es el lenguaje de marcado que emplean los chatbots como ChatGPT o Gemini para imprimir sus resultados.

Además, la sencillez de Markdown se puede combinar con el poder de HTML5, permitiendo intercalar etiquetas HTML en documentos Markdown para así conseguir cosas complejas, como aplicar un estilo CSS o usar `<details>` para ocultar elementos (como se hace en estos apuntes con los códigos en plantuml).

#### Sintaxis básica de Markdown

1.  **Títulos y subtítulos**
    Los títulos en Markdown se crean utilizando el símbolo de almohadilla `#`. Cuantas más almohadillas se colocan, menor es el nivel del título:

      * `# Título 1`
      * `## Título 2`
      * `### Título 3`

2.  **Texto en negrita**
    El texto se puede poner en negrita rodeándolo con dos asteriscos `**` o dos guiones bajos `__`:

      * `**Este texto está en negrita**`
      * `__Este texto también está en negrita__`

3.  **Texto en cursiva**
    Para poner el texto en cursiva, se utiliza un solo asterisco `*` o un solo guion bajo `_`:

      * `*Texto en cursiva*`
      * `_Texto en cursiva_`

4.  **Listas**
    Para crear una **lista no ordenada** (puntos), se utiliza un asterisco `*`, un signo más `+`, o un guion `-`:

      * `* Elemento 1`
      * `- Elemento 2`

    Para **listas numeradas**:

      * `1. Primer elemento`
      * `2. Segundo elemento`

5.  **Enlaces**
    Los enlaces se crean utilizando la sintaxis `[texto](url)`:

      * `[Google](https://www.google.com)`

6.  **Imágenes**
    Las imágenes se pueden insertar de manera similar a los enlaces, añadiendo un signo de exclamación al principio `![texto alternativo](url)`:

      * `![Logo](https://url-de-la-imagen.com/logo.png)`

7.  **Código**
    Si quieres mostrar un fragmento de código dentro de una línea de texto, puedes utilizar las comillas invertidas `` ` ``. Para **bloques de código**, se pueden usar tres comillas invertidas \`\`\`:

      * `inline code: \`echo "Hola"\`\`

      * Bloques de código:

      * Puedes especificar incluso el lenguaje de programación para que resalte la sintaxis si quieres (no funcionará en todos los entornos).

        ```bash
        echo "Esto es un bloque de código"
        ```

8.  **Citas**
    Se pueden añadir citas utilizando `>` al principio de la línea:

      * `> Esto es una cita`


### 3.2\. Utilizar Markdown en Visual Studio Code

#### Instalación de Visual Studio Code

Primero que todo y si no lo has hecho aún, es necesario instalar **VSCode**, que se puede descargar desde su [página oficial](https://code.visualstudio.com/). Una vez instalado, ya estaremos listos para personalizarlo y utilizarlo para editar Markdown.

##### Extensiones importantes

Para mejorar la experiencia trabajando con Markdown en VSCode, es necesario instalar algunas **extensiones muy útiles**:

1.  **Markdown All in One**
    Esta extensión proporciona herramientas útiles para editar Markdown, como vista previa, cierre automático de listas y otros atajos de teclado.

      * Para instalarla, ve a la sección de extensiones dentro de VSCode y busca "Markdown All in One".

2.  **Markdown PDF**
    Esta extensión permite convertir ficheros `.md` a PDF, HTML u otros formatos.

      * Busca "Markdown PDF" e instálala para poder exportar tus documentos.

3. **Markdown Enhanced Preview (RECOMENDADA)**
    Esta extensión es ideal para trabajar con Markdown, Mermaid y Plantuml. Incorpora funciones de todo lo anterior, por lo que vas a poder exportar el resultado a pdf o incluso HTML. Puedes instalar solamente esta extensión y funcionará, es una especie de sustituta de las otras dos.

4.  **Markdownlint**
    Añade un **linter** que verifica si tu Markdown sigue buenas prácticas, ayudándote a corregir errores comunes y a seguir una sintaxis pura de Markdown (cosa que no siempre te será útil)

      * Busca "Markdownlint" en la sección de extensiones.

##### Comandos útiles dentro de VSCode usando Markdown All In One

1.  **Vista previa de Markdown**
    Para ver una vista previa del fichero Markdown que estás editando, puedes abrir el fichero `.md` y hacer clic en `Ctrl+Shift+V` (Windows/Linux) o `Cmd+Shift+V` (Mac). También puedes hacer clic con el botón derecho sobre el fichero y seleccionar "Open Preview".

2.  **Exportar a HTML o PDF**
    Una vez tienes el documento editado, puedes exportarlo a HTML o PDF utilizando la extensión Markdown PDF:

      * Para exportarlo, abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`) y escribe "Markdown PDF: Export". Selecciona el formato deseado.
      * También puedes escribir `>` en la barra de búsqueda. Tiene el mismo efecto y puede ser más fácil de recordar.

Otra herramienta de diagramas que está ganando popularidad recientemente, en parte gracias a su compatibilidad con diferentes frameworks de aplicaciones web como `astro.build`, es d2. Puedes encontrar más información [aquí](https://d2lang.com/).

> **ACTIVIDAD 3:** Crea una memoria en la que repases paso a paso el proceso de instalación y preparación de las extensiones necesarias para poder editar plantuml y mermaid.js en VS Code. Crea un documento con capturas de pantalla de todo el proceso.

