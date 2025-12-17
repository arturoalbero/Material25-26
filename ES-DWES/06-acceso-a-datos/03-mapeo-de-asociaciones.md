# 6.3 Mapeo de asociaciones

## 1. `@ManyToOne` y `@OneToMany`

## 2. `@ManyToMany`

## 3. `@OneToOne`

> **ACTIVIDAD 1:** Realiza los mapeos correspondientes en el proyecto del apartado anterior (el de alumnos, profesores y asignaturas). Recuerda que la base de datos era:
> - Queremos una base de datos en la cual estén registrados alumnos (id, nombre, email, fecha de nacimiento, direccion, teléfonos), profesores (mismos atributos que alumnos y departamento, categoría [FIJO, INTERINO]) y asignaturas(id, nombre, descripción). 
>   - Un alumno puede cursar muchas asignaturas y una asignatura puede tener muchos alumnos.
>   - Un profesor puede impartir muchas asignaturas, pero una asignatura solo puede ser impartida por un profesor.
> Y añade lo siguiente:
> - Un alumno puede tener una calificación en una asignatura. Trata "calificación" como una entidad que se relaciona con la asociación de la relación alumno-asignatura. Las calificaciones tienen una nota sin decimales, del 1 al 10, contando los valores 0 como *no presentado* y 11 como *mención de honor*.
> Comprueba en la consola de H2 el funcionamiento correcto de la aplicación.

> **ACTIVIDAD 2:** Haz una nueva versión de My Favourite Composer empleando:
> - Entidades y mapeo relacional con Hibernate. Que emplee una base de datos persistente H2.
>   - Modifica las clases para que la base de datos gestione bien las claves primarias y las claves ajenas.
> - Lombok para generar los getters y los setters.
> - Repositorios usando las interfaces Repository.
> - La estructura de paquetes de servicios, controladores, entidades y repositorios.
> Además, organiza las URIs para conseguir lo siguiente:
> **CREATE:**
> - `add/composer`: Formulario para añadir compositores.
> - `add/music-piece`: Formulario para añadir piezas musicales.
> **READ**
> - `show/composer`: Muestra todos los compositores. Permite organizarlos por diferentes criterios (alfabético, por fecha, etc.).
> - `show/music-piece`: Muestra todas las piezas musicales. Permite organizarlas por diferentes criterios (alfabético, por fecha, etc.). Permite la eliminación de piezas.
> - `search/composer`: Búsqueda de compositores según diferentes criterios (nombre, nacionalidad, etc.). Añade `/result` para la vista del resultado. Parecida a `show/composer`.
> - `search/music-piece/`: Búsqueda de piezas musicales según diferentes criterios (nombre, instrumentación, etc.). Añade `/result` para la vista del resultado. Parecida a `show/music-piece`.
> **UPDATE**
> - `edit/composer/{id}` : Formulario para editar al compositor con esa {id}.
> - `edit/music-piece/{id}`: Formulario para editar la pieza musical con esa {id}.
> **DELETE**
> - `delete/composer/{id}`: Elimina un compositor. Elige si quieres que las piezas musicales se eliminen en cascada, pongan el compositor a *null* o que el compositor no se pueda eliminar hasta que no se eliminen las piezas asociadas.
> - `delete/music-piece/{id}`: Elimina una pieza musical.
> Como ves, son las operaciones básicas de un CRUD, así que emplea los repositorios de forma adecuada para conseguir  que funcione todo de forma correcta. Emplea servicios y mantén muy clara la separación entre modelo, vista y controlador (MVC) para que en un futuro, cambiando solamente el controlador podamos usar API-REST. **[Puedes recordar aquí el MVC](https://developer.mozilla.org/es/docs/Glossary/MVC)**. En este caso, crea las vistas que necesites con **Thymeleaf** (que sean funcionales, puedes reciclar las anteriores versiones de las vistas si lo ves oportuno).
>
> Comprueba que la base de datos se genera de forma correcta en la consola de H2. Comprueba también que las inserciones, actualizaciones y borrados se realizan de manera adecuada.
> 
> Para la base de datos, puedes seguir un esquema relacional similar a este:
> ![alt text](image.png)
