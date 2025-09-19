# **Modelo Vista Controlador (MVC) con Swing**

- [**Modelo Vista Controlador (MVC) con Swing**](#modelo-vista-controlador-mvc-con-swing)
  - [1. MVC. Componentes y aplicación en Swing](#1-mvc-componentes-y-aplicación-en-swing)
  - [**2. Un ejemplo práctico: Gestión de Turnos en un Hospital**](#2-un-ejemplo-práctico-gestión-de-turnos-en-un-hospital)
    - [2.1 **El paquete `modelo`**](#21-el-paquete-modelo)
      - [Clase `Empleado`](#clase-empleado)
      - [Subclases de `Empleado` (cada una con su archivo correspondiente)](#subclases-de-empleado-cada-una-con-su-archivo-correspondiente)
      - [Clase `Turno`](#clase-turno)
      - [Clase `Hospital`](#clase-hospital)
    - [\*\* 2.2 El paquete `vista`\*\*](#-22-el-paquete-vista)
      - [Clase `HospitalView`](#clase-hospitalview)
      - [Clase `TurnosTableModel`](#clase-turnostablemodel)
    - [**2.3 Paquete `controlador`**](#23-paquete-controlador)
      - [Clase `HospitalController`](#clase-hospitalcontroller)
    - [**2.4 La clase `Main`**](#24-la-clase-main)
  - [3. Creación de un JAR a partir de nuestro proyecto](#3-creación-de-un-jar-a-partir-de-nuestro-proyecto)
  - [4. Actividad](#4-actividad)
  - [5. Ejercicios de refuerzo](#5-ejercicios-de-refuerzo)
    - [2.5 Ejercicio 1](#25-ejercicio-1)
    - [3.1 Ejercicio 2](#31-ejercicio-2)

## 1. MVC. Componentes y aplicación en Swing

12 horas

El patrón **Modelo-Vista-Controlador (MVC)** es un patrón de arquitectura de software ampliamente empleado para crear aplicaciones modulares, escalables y fáciles de mantener. En Swing, este patrón nos permite separar claramente la lógica de negocio (modelo), la interfaz gráfica (vista) y la gestión de eventos (controlador). Vamos a explicar sus componentes paso a paso:

1. **Modelo**:
   - Representa la lógica y los datos del negocio.
   - Contiene clases para manejar información, realizar cálculos y gestionar las reglas del sistema.
   - No tiene referencias a Swing.

2. **Vista**:
   - Encargada de la presentación (interfaz gráfica).
   - Incluye todos los elementos de Swing como `JFrame`, `JButton`, `JTable`, etc.
   - No contiene lógica de negocio.

3. **Controlador**:
   - Gestiona la interacción entre el modelo y la vista.
   - Escucha eventos de la vista y actualiza el modelo o viceversa.
   - Implementa `ActionListener`, `MouseListener`, u otros escuchadores de eventos.

En general, cuando diseñemos una aplicación en Java usando Swing y el patrón de arquitectura MVC, deberemos seguir los siguientes pasos:

1. Diseñar el **Modelo**: Crear las clases que representan las entidades de negocio.
2. Diseñar la **Vista**: Construir la interfaz gráfica en clases separadas.
3. Crear el **Controlador**: Coordinar la interacción entre modelo y vista.

## **2. Un ejemplo práctico: Gestión de Turnos en un Hospital**

Para profundizar en el uso del MVC, vamos a lanzarnos de cabeza al desarrollo de un programa completo que lo utilice. Para ello, primero crearemos tres paquetes distintos. Uno para el modelo, otro para la vista y otro para el controlador. En el modelo pondremos nuestras clases que no dependan de Swing, en la vista aquellas clases que sirvan para montar la interfaz gráfica de nuestra aplicación y en el controlador los eventos que gestionan la interacción entre nuestro modelo y nuestra vista.

En este proyecto, queremos gestionar turnos para empleados (médicos, enfermeros, administrativos). Los datos serán cargados dinámicamente en una interfaz Swing que incluye:

1. **Un JComboBox para seleccionar el tipo de empleado.**  
2. **Una JTable para visualizar y editar turnos.**  
3. **Botones para agregar o eliminar turnos.**

### 2.1 **El paquete `modelo`**

#### Clase `Empleado`

```java
public abstract class Empleado {
    private String id;
    private String nombre;

    public Empleado(String id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    @Override
    public String toString() {
        return nombre;
    }
}
```

#### Subclases de `Empleado` (cada una con su archivo correspondiente)

```java
public class Medico extends Empleado {
    public Medico(String id, String nombre) {
        super(id, nombre);
    }
}

public class Enfermero extends Empleado {
    public Enfermero(String id, String nombre) {
        super(id, nombre);
    }
}

public class Administrativo extends Empleado {
    public Administrativo(String id, String nombre) {
        super(id, nombre);
    }
}
```

#### Clase `Turno`

```java
import java.time.LocalDateTime;

public class Turno {
    private Empleado empleado;
    private LocalDateTime inicio;
    private LocalDateTime fin;

    public Turno(Empleado empleado, LocalDateTime inicio, LocalDateTime fin) {
        this.empleado = empleado;
        this.inicio = inicio;
        this.fin = fin;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public LocalDateTime getInicio() {
        return inicio;
    }

    public LocalDateTime getFin() {
        return fin;
    }

    @Override
    public String toString() {
        return "Turno: " + inicio + " - " + fin + " (" + empleado.getNombre() + ")";
    }
}
```

#### Clase `Hospital`

```java
import java.util.ArrayList;
import java.util.List;

public class Hospital {
    private List<Empleado> empleados;
    private List<Turno> turnos;

    public Hospital() {
        empleados = new ArrayList<>();
        turnos = new ArrayList<>();
    }

    public void agregarEmpleado(Empleado empleado) {
        empleados.add(empleado);
    }

    public List<Empleado> getEmpleados() {
        return empleados;
    }

    public void agregarTurno(Turno turno) {
        turnos.add(turno);
    }

    public List<Turno> getTurnos() {
        return turnos;
    }
}
```

### ** 2.2 El paquete `vista`**

#### Clase `HospitalView`

En esta clase definimos la apariencia que va a tener la ventana de la aplicación que representa el hospital. Para hacer la tabla más funcional, vamos a crear aparte una clase derivada de `AbstractTableModel` que llamaremos `TurnosTableModel`. Esto nos permitirá personalizar su comportamiento y adecuarlo a las necesidades de la aplicación.

```java
import javax.swing.*;
import java.awt.*;
import java.util.List;

public class HospitalView extends JFrame {
    private JComboBox<Empleado> comboEmpleados;
    private JTable tablaTurnos;
    private JButton btnAgregarTurno;
    private JButton btnEliminarTurno;

    public HospitalView() {
        setTitle("Gestión de Turnos - Hospital");
        setSize(600, 400);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // Panel superior con JComboBox
        JPanel panelSuperior = new JPanel();
        panelSuperior.add(new JLabel("Empleado:"));
        comboEmpleados = new JComboBox<>();
        panelSuperior.add(comboEmpleados);
        add(panelSuperior, BorderLayout.NORTH);

        // Tabla para los turnos
        tablaTurnos = new JTable(new TurnosTableModel());
        add(new JScrollPane(tablaTurnos), BorderLayout.CENTER);

        // Panel inferior con botones
        JPanel panelInferior = new JPanel();
        btnAgregarTurno = new JButton("Agregar Turno");
        btnEliminarTurno = new JButton("Eliminar Turno");
        panelInferior.add(btnAgregarTurno);
        panelInferior.add(btnEliminarTurno);
        add(panelInferior, BorderLayout.SOUTH);
    }

    public JComboBox<Empleado> getComboEmpleados() {
        return comboEmpleados;
    }

    public JTable getTablaTurnos() {
        return tablaTurnos;
    }

    public JButton getBtnAgregarTurno() {
        return btnAgregarTurno;
    }

    public JButton getBtnEliminarTurno() {
        return btnEliminarTurno;
    }
}
```

#### Clase `TurnosTableModel`

Esta clase es una extensión de la clase `AbstractTableModel`, creada para personalizar el comportamiento de la tabla y adecuarlo a los requisitos de la aplicación.

```java
import javax.swing.table.AbstractTableModel;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class TurnosTableModel extends AbstractTableModel {
    private List<Turno> turnos = new ArrayList<>();
    private String[] columnas = {"Empleado", "Inicio", "Fin"};

    @Override
    public int getRowCount() {
        return turnos.size();
    }

    @Override
    public int getColumnCount() {
        return columnas.length;
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        Turno turno = turnos.get(rowIndex);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        switch (columnIndex) {
            case 0:
                return turno.getEmpleado().getNombre();
            case 1:
                return turno.getInicio().format(formatter);
            case 2:
                return turno.getFin().format(formatter);
            default:
                return null;
        }
    }

    @Override
    public String getColumnName(int column) {
        return columnas[column];
    }

    public void agregarTurno(Turno turno) {
        turnos.add(turno);
        fireTableRowsInserted(turnos.size() - 1, turnos.size() - 1);
    }

    public void eliminarTurno(int rowIndex) {
        turnos.remove(rowIndex);
        fireTableRowsDeleted(rowIndex, rowIndex);
    }
}
```

### **2.3 Paquete `controlador`**

#### Clase `HospitalController`

El controlador de nuestra aplicación tiene la función de conectar el modelo con la vista. Para ello, tiene dos métodos principales:

- `inicializarVista` es el método de inicialización, que nos da el estado inicial de la aplicación.
- `agregarEventos` es el método en el que se define el comportamiento de los diferentes botones y elementos de la vista. En una versión menos separado habríamos cargado el comportamiento al crear la vista, pero haciéndolo así podemos separar el código con Swing del código sin él, manteniendo la mezcla solamente en el controlador. A la hora del mantenimiento, es más sencillo.

```java
import java.time.LocalDateTime;

public class HospitalController {
    private Hospital model;
    private HospitalView view;

    public HospitalController(Hospital model, HospitalView view) {
        this.model = model;
        this.view = view;

        inicializarVista();
        agregarEventos();
    }

    private void inicializarVista() {
        // Cargar empleados en el JComboBox
        for (Empleado empleado : model.getEmpleados()) {
            view.getComboEmpleados().addItem(empleado);
        }
    }

    private void agregarEventos() {
        view.getBtnAgregarTurno().addActionListener(e -> {
            Empleado empleado = (Empleado) view.getComboEmpleados().getSelectedItem();
            if (empleado != null) {
                LocalDateTime inicio = LocalDateTime.now();
                LocalDateTime fin = inicio.plusHours(8);
                Turno turno = new Turno(empleado, inicio, fin);
                model.agregarTurno(turno);

                TurnosTableModel tableModel = (TurnosTableModel) view.getTablaTurnos().getModel();
                tableModel.agregarTurno(turno);
            }
        });

        view.getBtnEliminarTurno().addActionListener(e -> {
            int filaSeleccionada = view.getTablaTurnos().getSelectedRow();
            if (filaSeleccionada != -1) {
                TurnosTableModel tableModel = (TurnosTableModel) view.getTablaTurnos().getModel();
                tableModel.eliminarTurno(filaSeleccionada);
            }
        });
    }
}
```

### **2.4 La clase `Main`**

Para que la aplicación funcione, debemos definir un método `main` que lance la aplicación. Aparte, usamos ese mismo método para cargar unos datos de prueba.

```java
public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            Hospital model = new Hospital();
            model.agregarEmpleado(new Medico("1", "Dr. López"));
            model.agregarEmpleado(new Enfermero("2", "Enf. Pérez"));
            model.agregarEmpleado(new Administrativo("3", "Sra. García"));

            HospitalView view = new HospitalView();
            new HospitalController(model, view);

            view.setVisible(true);
        });
    }
}
```

## 3. Creación de un JAR a partir de nuestro proyecto

Para distribuir nuestros programas, necesitamos crear ejecutables. En el casa de Java, los ejecutables son conocidos como Java Archives, o simplemente JAR. Un JAR es un archivo que se compone de nuestro código y todo lo necesario para que este funcione. Generalmente incorporan de manera automática el JDK, pero si usamos dependencias externas debemos incluirlas en la creación del JAR.

Esto último implica que, mientras que la distribución de una aplicación que use solamente dependencias del JDK (como por ejemplo, Swing) es automática y sencilla, si usa dependencias externas añade una serie de pasos que lo hacen más complicado:

- Descargar las dependencias desde su repositorio oficial.
- Incluir las dependencias en el ejecutable en el momento de su creación.

Por este mismo motivo hemos escogido Swing para diseñar interfaces gráficas en este curso introductorio, a pesar de que JavaFX es más moderno y potente. JavaFX tiene dos problemas principales: Es más complejo y no está incluido en el JDK desde la versión 11.

Tu trabajo consiste en, empleando las herramientas de IntelliJ, crear un archivo .JAR de tu aplicación de menús y distribuirla.

Para crear un archivo JAR (Java Archive) en IntelliJ IDEA, sigue estos pasos:

- Ir a la ventana “Proyecto”: En la barra de menú principal, haz clic en “Archivo” (o presiona Ctrl + Alt + Shift + S en Windows/Linux o Cmd + Opt + Shift + S en macOS) y selecciona “Estructura del proyecto” (Project Structure).
- Sección “Artefactos”: En la ventana “Estructura del proyecto”, haz clic en la pestaña “Artefactos” (Artifacts).
- Crear un nuevo artefacto: Haz clic en el botón “+” (Add) y selecciona “JAR” (From modules with dependencies…).
- Configurar el JAR: En la ventana “Crear JAR”, selecciona la clase principal de tu proyecto (Main Class) y configura las opciones según tus necesidades. Puedes especificar la ruta de acceso para el archivo MANIFEST.MF (Directory for META-INF/MANIFEST.MF) y agregar archivos a la biblioteca (Add).
- Generar el JAR: Haz clic en “Build” (Generar) y selecciona “Build Artifacts” (Generar artefactos). El JAR se creará en la carpeta “out” o la ruta que hayas especificado.

También puedes crear un JAR desde el menú contextual de tu proyecto:

- Sección “Proyecto”: En la ventana principal de IntelliJ IDEA, selecciona tu proyecto en la lista de proyectos.
- Menú contextual: Haz clic con el botón derecho en el proyecto y selecciona “Build” > “Build Artifacts” > “JAR” (From modules with dependencies…).
- Configurar y generar: Sigue los pasos 3 y 4 de la sección anterior.

## 4. Actividad

> Conecta el código desarrollado en los temas anteriores con las vistas diseñadas en esta unidad siguiendo el patrón de diseño MVC

## 5. Ejercicios de refuerzo

### 2.5 Ejercicio 1

Como mejora de la aplicación de gestión de turnos de un hospital, podríamos cargar los datos desde dos ficheros .csv, 'empleados.csv' y `turnos.csv`. Asimismo, podríamos añadir una funcionalidad para agregar o eliminar empleados, así como la capacidad de guardar los datos en sendos archivos .csv. Las consultas a estos recursos deberían hacerse a través de derivados de `SwingWorker` para garantizar que no se bloquee la interfaz.

Más adelante en el curso, podríamos sustituir (o complementar) los archivos .csv por una base datos.

### 3.1 Ejercicio 2

Crea un JAR del gestor de turnos del hospital y distribúyelo en varios ordenadores para comprobar que funciona de manera adecuada.
