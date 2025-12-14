# 5.3 Atributos no usados en formularios y lectura de parámetros ocultos

## 1. Atributos no usados en formularios
En algunos casos (por ejemplo, al hacer el alta de un elemento en un CRUD) puede ser que haya atributos que no deseemos que sean introducidos en el formulario, bien por que toman un valor por defecto, bien porque se calculan en un servicio, etc. Un ejemplo podría ser la fecha de registro del empleado, que se podría tomar del sistema de forma automática.

En estos casos, si la vista con el formulario no tiene ningún `<input>` asociado a un atributo, al hacer el `submit`, ese atributo llegará con valor nulo al controlador. Para solucionar este posible problema tenemos varias opciones.
a) Asignar el valor después de recibirlo del submit y no antes
b) Si es necesario asignarlo antes, por ejemplo en el constructor, añadir un `<input type="hidden">` en la vista, que hace que permanezca oculto, pero conserve el valor asignado previamente.
c) Crear una clase ad-hoc solo con los campos de formulario (lo que se conoce como DTO), y, al recibirlo, mover esos atributos del dto al objeto real. Esta sería la mejor opción.

Vamos a ver todo esto en un ejemplo. Supongamos que seguimos en el CRUD de la entidad `Empleado` y que, además de los atributos anteriores, tiene uno nuevo llamado `fechaRegistro`.

Supongamos que este último atributo se toma de la fecha del sistema. Las posibilidades vistas se plasmarían así:
- a) En el servicio (o controlador) asignar el valor después de recibirlo del `submit` y no antes:

```java
public Empleado añadir(Empleado empleado){
    empleado.setFechaRegistro(LocalDate.now());
    repositorio.add(empleado);
    return empleado;
}
```

- b) Si el valor se ha añadido previamente, añadir un `<input type="hidden">` en la vista del formulario, para no perderlo, entonces, en la clase `Empleado`, modificamos el constructor por defecto, para asignarle el valor antes de enviarlo al formulario:

```java
public Empleado(){
    this.fechaRegistro=LocalDate.now();
}
```

Y luego en la vista:

```html
<input type="hidden" th:field="*{fechaRegistro}" />
```

- c) Creamos una clase ad-hoc solo con los campos de formularios (lo que se llama un DTO). Desde Java 14 podemos usar los `record`, que son especialmente útiles para crearlos.

```java
public record EmpleadoDTO(Long id, String nombre, Double salario){}
```

A la vista con el formulario de nuevo empleado le pasaríamos un *EmpleadoDTO* y no un *Empleado. Al recibir el DTO, llamamos a un método de servicio que asigne los campos del dto al empleado.

```java
@PostMapping("/nuevo/submit")
public String showNewSubmit(EmpleadoDTO empleadoForm){
    Empleado e = empleadoService.buildEmpleadoFromDto(empleadoForm);
    empleadoService.add(e);
    return "redirect:/";
}
```

Y el método `buildEmpleadoFromDto` sería algo así:

```java
public Empleado buildEmpleadoFromDto(EmpleadoDTO empleadoDTO){
    Empleado empleado = new Empleado();
    empleado.setId(empleadoDTO.id());
    (... Todos los setters)
    return empleado;
}
```

> **ACTIVIDAD 1**: Lee sobre los **record** [en esta página web](https://www.makigas.es/series/records-en-java/records-de-java-que-son-y-como-usarlos) y responde a las siguientes preguntas:
> - ¿Qué métodos se generan automáticamente en un record?
> - ¿Por qué no se pueden usar setters?
> - ¿Qué quiere decir que los atributos sean finales?
> - ¿Qué particularidad tienen los getters que se generan automáticamente?

> **ACTIVIDAD 2**: Modifica los formularios y sus métodos de controlador respectivos para demostrar las tres alternativas que tenemos para gestionar atributos ocultos. Puedes modificar las clases para añadir algún atributo oculto en caso de necesidad:
> 1. Asignando de forma manual el atributo oculto.
> 2. Usando un campo hidden.
> 3. Usando un DTO ad-hoc (con record)

## 2. Lectura de parámetros de ficheros

Una operación típica de nuestras aplicaciones será obtener determinados valores de variables o constantes de nuestra aplicación desde un archivo de configuración: por ejemplo, el porcentaje de IVA a aplicar en nuestras facturas, importes o fechas globales para toda la aplicación, etc. o incluso los mensajes de texto que se mostrarán dependiendo del idioma seleccionado. 

Esos parámetros pueden almacenarse en distintos formatos: XML, JSON, etc. pero es muy típico guardarlos en un fichero de tipo `properties`, similar al `application.properties` que ya conocemos. Este podría ser un ejemplo:
```properties
porcentajeImpuesto = 0.21
bonus = 200
```
La forma de trabajar con este tipo de archivos es muy sencilla:

1. Crear el archivo con extensión `properties` y almacenarlo en la carpeta `/resources` o en una subcarpeta de esta.
2. Crear una clase que recoja los parámetros del fichero en variables que luego podemos utilizar. La clase estará en el paquete donde están el resto de clases, típicamente en el subpaquete `/config` (que creamos nosotros) y debe cumplir los siguientes requisitos:
    - Estar anotada con `@Configuration` para que se cree al principio de la aplicación.
    - Estar anotada con `@PropertySource("classpath:/config/miarchivo.properties"). La ruta es aquella en la que coloques el archivo de propiedades.
    - Crear getters y setters (usa Lombok)
    - Tener un atributo para cada variable contenida en el archivo y anotarla con `@Value("${nombreVariableEnArchivo}")`
```java
@Configuration
@Getter
@Setter
@PropertySource("classpath:/config/parametros.properties")
public class Parametros{
    @Value("${porcentajeImpuesto}")
    private Double porcentajeImpuesto;
    @Value("${bonus}")
    private Integer bonus;
}
```
3. Luego, simplemente, inyectamos la clase donde sea necesario, generalmente en las clases de servicio:
```java
@Autowired
private Parametros parametros;
```
Para usar sus valores a través de los getters:
```java
Double salarioFinal = empleado.getSalarioBase() * (1 - parametros.getPorcentajeImpuesto()) + parametros.getBonus();
empleado.setSalarioFinal(salarioFinal);
```

También es habitual usarlo para el envío de emails como vimos en el tema anterior. Ahí podemos guardar mensajes genéricos, direcciones habituales, etc.

> **ACTIVIDAD 3:** Rehaz el proceso de envío de emails de la newsletter que diseñaste guardando los mensajes en un archivo de configuración `email.properties`.

> **ACTIVIDAD 4:** Crea otro archivo de configuración en el que almacenes mensajes que luego enviarás a la vista a través de los controladores:
> - Mensajes de error
> - Mensajes de bienvenida

> **ACTIVIDAD 5:** Crea otro archivo de configuración en el que guardamos la versión de la aplicacion web `version = 1`. Después, añade en alguna de las clases un parámetro que indique en qué versión de la aplicación se creó. Ese parámetro se tendrá que almacenar también en el `.csv` correspondiente.


