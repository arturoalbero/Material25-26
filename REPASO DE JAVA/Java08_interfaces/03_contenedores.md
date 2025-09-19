# Contenedores, Layouts y mejoras visuales en Swing

- [Contenedores, Layouts y mejoras visuales en Swing](#contenedores-layouts-y-mejoras-visuales-en-swing)
  - [1. Contenedores](#1-contenedores)
    - [**1.1 JFrame (Ventana principal)**](#11-jframe-ventana-principal)
    - [**1.2 JPanel (Panel genérico)**](#12-jpanel-panel-genérico)
    - [**1.3 JDialog (Cuadro de diálogo)**](#13-jdialog-cuadro-de-diálogo)
    - [**1.4 JLayeredPane (Panel con capas)**](#14-jlayeredpane-panel-con-capas)
    - [**1.5 JScrollPane (Panel con desplazamiento)**](#15-jscrollpane-panel-con-desplazamiento)
    - [**1.6 JTabbedPane (Panel con pestañas)**](#16-jtabbedpane-panel-con-pestañas)
      - [**1.7 JSplitPane (Panel dividido)**](#17-jsplitpane-panel-dividido)
    - [**1.8 JToolBar (Barra de herramientas)**](#18-jtoolbar-barra-de-herramientas)
  - [**2. Layout Managers**](#2-layout-managers)
    - [**2.1 FlowLayout**](#21-flowlayout)
    - [**2.2 BorderLayout**](#22-borderlayout)
    - [**2.3 GridLayout**](#23-gridlayout)
    - [**2.4 BoxLayout**](#24-boxlayout)
    - [**2.5 Ejemplo: Uso de GridBagLayout**](#25-ejemplo-uso-de-gridbaglayout)
  - [**3. Ventanas Secundarias (`JDialog`)**](#3-ventanas-secundarias-jdialog)
  - [**4. Look and Feel en Swing**](#4-look-and-feel-en-swing)
    - [**4.1 Cambiar el Look and Feel**](#41-cambiar-el-look-and-feel)
      - [Ejemplo básico para cambiar el L\&F](#ejemplo-básico-para-cambiar-el-lf)
    - [**4.2 Establecer el Look and Feel del Sistema**](#42-establecer-el-look-and-feel-del-sistema)
    - [**4.3 Aplicar Cambios Personalizados con `UIManager`**](#43-aplicar-cambios-personalizados-con-uimanager)
  - [**5. Mejoras Visuales y Diseño Avanzado**](#5-mejoras-visuales-y-diseño-avanzado)
    - [**5.1 Establecer Iconos Personalizados**](#51-establecer-iconos-personalizados)
    - [**5.2 Transiciones y Animaciones Básicas**](#52-transiciones-y-animaciones-básicas)
  - [6. Actividad](#6-actividad)
  - [7. Ejercicios de refuerzo](#7-ejercicios-de-refuerzo)
    - [7.1 Ejercicio 1](#71-ejercicio-1)
    - [7.2 Ejercicio 2](#72-ejercicio-2)

## 1. Contenedores

6 horas

En **Swing**, los **contenedores** son componentes fundamentales que permiten organizar y agrupar otros componentes de la interfaz gráfica (botones, etiquetas, campos de texto, etc.). A continuación, te presento los principales contenedores de Swing y sus características más importantes:

### **1.1 JFrame (Ventana principal)**

- Es la ventana principal de una aplicación Swing.
- Puede contener componentes gráficos como botones, etiquetas, campos de texto, paneles, etc.
- Tiene decoraciones como un título, un botón de cerrar, maximizar y minimizar.
- Proporciona el método `setDefaultCloseOperation()` para determinar el comportamiento al cerrar la ventana.

```java
JFrame frame = new JFrame("Ventana Principal");
frame.setSize(400, 300);
frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
frame.setVisible(true);
```

### **1.2 JPanel (Panel genérico)**

- Es un contenedor flexible que organiza componentes gráficos.
- Sirve como base para agrupar componentes dentro de un diseño (`LayoutManager`).
- No tiene bordes ni decoraciones por defecto, pero se pueden añadir.
- Se utiliza dentro de otros contenedores como `JFrame`.

```java
JPanel panel = new JPanel();
panel.add(new JButton("Botón 1"));
panel.add(new JLabel("Etiqueta 1"));

frame.add(panel); // Agregar el panel al JFrame
```

### **1.3 JDialog (Cuadro de diálogo)**

- Es una ventana secundaria que generalmente se utiliza para mostrar mensajes, obtener datos del usuario o realizar confirmaciones.
- Puede ser modal (bloquea la interacción con otras ventanas hasta que se cierre) o no modal.
- Ideal para cuadros de alerta, formularios pequeños, o configuraciones.

```java
JDialog dialog = new JDialog(frame, "Cuadro de Diálogo", true); // Modal
dialog.setSize(200, 150);
dialog.add(new JLabel("Este es un cuadro de diálogo"));
dialog.setVisible(true);
```

---

### **1.4 JLayeredPane (Panel con capas)**

- Es un contenedor que permite organizar componentes en **capas**, donde unos pueden superponerse sobre otros.
- Cada componente tiene una posición en una capa específica, determinada por un índice.
- Muy útil para implementar ventanas emergentes, ventanas auxiliares internas, o efectos visuales avanzados.

```java
JLayeredPane layeredPane = new JLayeredPane();
JButton button1 = new JButton("Capa 1");
button1.setBounds(50, 50, 100, 50);
JButton button2 = new JButton("Capa 2");
button2.setBounds(70, 70, 100, 50);

// Añadir componentes a distintas capas
layeredPane.add(button1, JLayeredPane.DEFAULT_LAYER);
layeredPane.add(button2, JLayeredPane.PALETTE_LAYER);

frame.add(layeredPane);
```

---

### **1.5 JScrollPane (Panel con desplazamiento)**

- Proporciona barras de desplazamiento horizontal y/o vertical para componentes que pueden exceder el espacio visible.
- Se utiliza frecuentemente con `JTextArea`, `JTable`, `JList` o imágenes grandes.
- Puede ser decorado con bordes personalizados.

```java
JTextArea textArea = new JTextArea(5, 20);
JScrollPane scrollPane = new JScrollPane(textArea); // Vincular JTextArea con JScrollPane

frame.add(scrollPane);
```

### **1.6 JTabbedPane (Panel con pestañas)**

- Permite organizar componentes en diferentes pestañas, proporcionando una navegación más clara.
- Muy útil para dividir contenido relacionado en categorías.

```java
JTabbedPane tabbedPane = new JTabbedPane();
tabbedPane.add("Pestaña 1", new JLabel("Contenido de la Pestaña 1"));
tabbedPane.add("Pestaña 2", new JLabel("Contenido de la Pestaña 2"));

frame.add(tabbedPane);
```

#### **1.7 JSplitPane (Panel dividido)**

- Permite dividir el espacio entre dos componentes, con una barra ajustable entre ellos.
- Puede dividirse horizontal o verticalmente.

```java
JPanel panel1 = new JPanel();
JPanel panel2 = new JPanel();
JSplitPane splitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, panel1, panel2);

frame.add(splitPane);
```

### **1.8 JToolBar (Barra de herramientas)**

- Contenedor especializado para colocar botones o herramientas en forma de barra horizontal o vertical.
- Se puede arrastrar y reposicionar (docking).

```java
JToolBar toolBar = new JToolBar();
toolBar.add(new JButton("Herramienta 1"));
toolBar.add(new JButton("Herramienta 2"));

frame.add(toolBar, BorderLayout.NORTH); // Añadir la barra en la parte superior
```

En los ejemplos de los temas anteriores hemos usado contenedores, pero ahora vamos a aprender cómo mejorarlas usando Layouts.

## **2. Layout Managers**

Un **Layout Manager** se encarga de organizar automáticamente los componentes dentro de un contenedor. Los principales Layouts son:

1. **`FlowLayout`**:
   - Alinea los componentes horizontalmente (de izquierda a derecha) y luego pasa a la siguiente línea.
   - Ideal para interfaces pequeñas y simples.

2. **`BorderLayout`**:
   - Divide el espacio en cinco regiones: `NORTH`, `SOUTH`, `EAST`, `WEST`, `CENTER`.
   - Muy útil para interfaces estructuradas (como menús y contenido principal).

3. **`GridLayout`**:
   - Organiza los componentes en una cuadrícula con un número fijo de filas y columnas.

4. **`BoxLayout`**:
   - Alinea componentes en una sola fila o columna, con soporte para espacios entre ellos.

5. **`GridBagLayout`**:
   - El más flexible. Permite una distribución personalizada de componentes (ideal para diseños complejos).

A continuación, vamos a profundizar en cada uno de ellos:

### **2.1 FlowLayout**

Creamos un panel donde se organizan botones horizontalmente, alineados al centro:

```java
import javax.swing.*;
import java.awt.*;

public class EjemploFlowLayout extends JFrame {
    public EjemploFlowLayout() {
        setTitle("FlowLayout Demo");
        setSize(400, 200);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        // Usamos FlowLayout en el JFrame
        setLayout(new FlowLayout(FlowLayout.CENTER, 20, 10));

        // Añadimos algunos botones
        add(new JButton("Botón 1"));
        add(new JButton("Botón 2"));
        add(new JButton("Botón 3"));
        add(new JButton("Botón 4"));
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            EjemploFlowLayout ventana = new EjemploFlowLayout();
            ventana.setVisible(true);
        });
    }
}
```

### **2.2 BorderLayout**

Distribuimos los componentes en las regiones principales (NORTE, SUR, ESTE, OESTE, CENTRO):

```java
import javax.swing.*;
import java.awt.*;

public class EjemploBorderLayout extends JFrame {
    public EjemploBorderLayout() {
        setTitle("BorderLayout Demo");
        setSize(400, 300);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        // Usamos BorderLayout en el JFrame
        setLayout(new BorderLayout());

        // Añadimos componentes a las regiones
        add(new JButton("Norte"), BorderLayout.NORTH);
        add(new JButton("Sur"), BorderLayout.SOUTH);
        add(new JButton("Este"), BorderLayout.EAST);
        add(new JButton("Oeste"), BorderLayout.WEST);
        add(new JButton("Centro"), BorderLayout.CENTER);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            EjemploBorderLayout ventana = new EjemploBorderLayout();
            ventana.setVisible(true);
        });
    }
}
```

### **2.3 GridLayout**

Organizamos componentes en una cuadrícula de filas y columnas:

```java
import javax.swing.*;
import java.awt.*;

public class EjemploGridLayout extends JFrame {
    public EjemploGridLayout() {
        setTitle("GridLayout Demo");
        setSize(400, 300);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        // Usamos GridLayout con 2 filas y 3 columnas
        setLayout(new GridLayout(2, 3, 10, 10));

        // Añadimos algunos botones
        for (int i = 1; i <= 6; i++) {
            add(new JButton("Botón " + i));
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            EjemploGridLayout ventana = new EjemploGridLayout();
            ventana.setVisible(true);
        });
    }
}
```

### **2.4 BoxLayout**

Alineamos componentes en una columna (verticalmente):

```java
import javax.swing.*;
import java.awt.*;

public class EjemploBoxLayout extends JFrame {
    public EjemploBoxLayout() {
        setTitle("BoxLayout Demo");
        setSize(400, 300);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        // Creamos un panel con BoxLayout (orientación vertical)
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));

        // Añadimos algunos botones con espacio entre ellos
        panel.add(Box.createVerticalStrut(10)); // Espacio inicial
        panel.add(new JButton("Botón 1"));
        panel.add(Box.createVerticalStrut(10)); // Espacio entre componentes
        panel.add(new JButton("Botón 2"));
        panel.add(Box.createVerticalStrut(10));
        panel.add(new JButton("Botón 3"));

        add(panel);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            EjemploBoxLayout ventana = new EjemploBoxLayout();
            ventana.setVisible(true);
        });
    }
}
```

### **2.5 Ejemplo: Uso de GridBagLayout**

Para organizar componentes con un diseño más flexible:

```java
import javax.swing.*;
import java.awt.*;

public class EjemploGridBagLayout extends JFrame {
    public EjemploGridBagLayout() {
        setTitle("GridBagLayout Demo");
        setSize(400, 300);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();

        // Botón 1: Ocupa toda la primera fila
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        add(new JButton("Botón 1"), gbc);

        // Botón 2: En la segunda fila, primera columna
        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.gridwidth = 1;
        add(new JButton("Botón 2"), gbc);

        // Botón 3: En la segunda fila, segunda columna
        gbc.gridx = 1;
        gbc.gridy = 1;
        add(new JButton("Botón 3"), gbc);

        // Botón 4: Ocupa toda la tercera fila
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        add(new JButton("Botón 4"), gbc);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            EjemploGridBagLayout ventana = new EjemploGridBagLayout();
            ventana.setVisible(true);
        });
    }
}
```

## **3. Ventanas Secundarias (`JDialog`)**

Un **JDialog** es una ventana secundaria que puede bloquear la interacción con la ventana principal (modal) o permitirla (no modal).

A continuación, un ejemplo de una ventana modal simple:

```java
import javax.swing.*;
import java.awt.*;

public class VentanaModal extends JFrame {
    public VentanaModal() {
        setTitle("Ventana Principal");
        setSize(400, 300);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new FlowLayout());

        // Botón para abrir la ventana modal
        JButton abrirDialogo = new JButton("Abrir Diálogo");
        add(abrirDialogo);

        // Acción para abrir el diálogo
        abrirDialogo.addActionListener(e -> {
            // Crear un JDialog modal
            JDialog dialogo = new JDialog(this, "Diálogo Modal", true);
            dialogo.setSize(300, 150);
            dialogo.setLayout(new FlowLayout());
            dialogo.add(new JLabel("Este es un diálogo modal."));
            JButton cerrarButton = new JButton("Cerrar");
            cerrarButton.addActionListener(evt -> dialogo.dispose());
            dialogo.add(cerrarButton);
            dialogo.setLocationRelativeTo(this); // Centrarlo respecto a la ventana principal
            dialogo.setVisible(true);
        });
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            VentanaModal ventana = new VentanaModal();
            ventana.setVisible(true);
        });
    }
}
```

Si quisiéramos que la ventana secundaria no fuera modal, solo necesitaríamos configurar el JDialog como **no modal** cambiando el tercer parámetro en el constructor.

```java
JDialog dialogo = new JDialog(this, "Diálogo No Modal", false);
```

¡Vamos a ampliar tu contenido incluyendo cómo personalizar el aspecto visual (Look and Feel) y la configuración avanzada de Swing mediante el uso de `UIManager`!

---

## **4. Look and Feel en Swing**

El **Look and Feel (L&F)** determina la apariencia visual y el comportamiento de los componentes de Swing. Swing ofrece un diseño predeterminado, pero puedes personalizarlo para que se asemeje a otros entornos (Windows, macOS, etc.) o incluso implementar un diseño único.

### **4.1 Cambiar el Look and Feel**

La clase `UIManager` de Swing permite cambiar el L&F de una aplicación. Los L&F más comunes son:

- **Metal** (predeterminado de Java).
- **Nimbus** (moderno y atractivo).
- **Windows** (similar al estilo de Windows).
- **Motif** (estilo clásico UNIX).
- **Sistema** (adopta el L&F del sistema operativo actual).

#### Ejemplo básico para cambiar el L&F

```java
import javax.swing.*;

public class CambiarLookAndFeel {
    public static void main(String[] args) {
        try {
            // Establece el Look and Feel de Nimbus
            UIManager.setLookAndFeel("javax.swing.plaf.nimbus.NimbusLookAndFeel");
        } catch (Exception e) {
            System.out.println("No se pudo cargar el Look and Feel: " + e.getMessage());
        }

        // Crear una ventana para probar
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Ejemplo Look and Feel");
            frame.setSize(400, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLayout(new BoxLayout(frame.getContentPane(), BoxLayout.Y_AXIS));

            frame.add(new JButton("Botón 1"));
            frame.add(new JButton("Botón 2"));
            frame.add(new JCheckBox("Opción 1"));
            frame.setVisible(true);
        });
    }
}
```

### **4.2 Establecer el Look and Feel del Sistema**

Para que tu aplicación tenga el L&F del sistema operativo actual:

```java
UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
```

Esto hace que la aplicación se sienta más integrada con el sistema.

### **4.3 Aplicar Cambios Personalizados con `UIManager`**

Además de usar L&F predefinidos, puedes personalizar colores, fuentes y bordes para que coincidan con tu diseño. Por ejemplo:

```java
import javax.swing.*;
import java.awt.*;

public class PersonalizarLookAndFeel {
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());

            // Personalización del estilo
            UIManager.put("Button.background", Color.LIGHT_GRAY);
            UIManager.put("Button.foreground", Color.DARK_GRAY);
            UIManager.put("Label.font", new Font("Arial", Font.BOLD, 14));
            UIManager.put("Panel.background", Color.WHITE);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Crear una ventana para probar
        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Personalizar Look and Feel");
            frame.setSize(400, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            JPanel panel = new JPanel();
            panel.add(new JLabel("Texto Personalizado"));
            panel.add(new JButton("Botón Personalizado"));

            frame.add(panel);
            frame.setVisible(true);
        });
    }
}
```

---

## **5. Mejoras Visuales y Diseño Avanzado**

### **5.1 Establecer Iconos Personalizados**

Puedes añadir iconos a botones, etiquetas o incluso al icono de la ventana (`JFrame`). Ejemplo:

```java
import javax.swing.*;

public class IconosSwing {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Iconos en Swing");
        frame.setSize(400, 300);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new BoxLayout(frame.getContentPane(), BoxLayout.Y_AXIS));

        // Icono en una etiqueta
        JLabel label = new JLabel("Etiqueta con Icono", new ImageIcon("icono.png"), JLabel.CENTER);

        // Botón con icono
        JButton button = new JButton("Botón con Icono", new ImageIcon("icono.png"));

        frame.add(label);
        frame.add(button);

        frame.setVisible(true);
    }
}
```

### **5.2 Transiciones y Animaciones Básicas**

Aunque Swing no tiene soporte nativo para animaciones, puedes simular transiciones con un `Timer`. Ejemplo:

```java
import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class AnimacionBasica {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Animación Básica");
        frame.setSize(400, 300);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JButton button = new JButton("Mover");
        frame.setLayout(null);
        button.setBounds(10, 100, 100, 30);
        frame.add(button);

        Timer timer = new Timer(10, new ActionListener() {
            int x = 10;

            @Override
            public void actionPerformed(ActionEvent e) {
                x += 1;
                if (x > frame.getWidth()) {
                    x = 10;
                }
                button.setBounds(x, 100, 100, 30);
            }
        });

        button.addActionListener(e -> timer.start());
        frame.setVisible(true);
    }
}
```

## 6. Actividad

> Diseño de las VISTAS de la aplicación de gestión de turnos de un hospital
>

## 7. Ejercicios de refuerzo

### 7.1 Ejercicio 1

Crea una aplicación con una tabla con las columnas `nombre`, `sexo` y `edad`. Añade un botón añadir, un botón editar y un botón borrar para eliminar la selección. Los botones editar y borrar sólo deben estar activos cuando haya un elemento seleccionado de la tabla.

Cuando se pulse el botón añadir o editar, se tiene que abrir una ventana modal con un botón Aceptar y un formulario en el cual se pidan los datos para el nombre, sexo (con RadioButton o ComboBox) y edad.

Se tiene que verificar que haya un nombre escrito y un sexo seleccionado, así como que la edad sea un número entre 0 y 200. En caso de que falle alguna comprobación al pulsar el botón Aceptar, debería aparecer al lado de cada campo "Todo OK" en verde si está correcto y "Error: " más la descripción del error, en rojo, si es incorrecto (Utiliza etiquetas para esto último).

La diferencia entre Añadir y Editar es que el formulario en Añadir está vacío y al darle aceptar se añade un elemento nuevo, mientras que en Editar el formulario aparece con los datos del elemento seleccionado y, al darle aceptar, este se borra y se sustituye por el nuevo (siempre que haya pasado la comprobación).

### 7.2 Ejercicio 2

Añade un RadioButton que nos permita cambiar el L & F de la aplicación anterior. Por defecto estará seleccionado el L & F del sistema operativo, pero añade 2 opciones más (o las que quieras).

Añade un icono personalizado para los botones de Añadir, Editar y Borrar.

Finalmente, crea una pseudo animación que haga que, cuando se abra una ventana modal, esta empiece con un tamaño (0,0) y tarde 1 segundo (o menos) en alcanzar su tamaño apropiado.
