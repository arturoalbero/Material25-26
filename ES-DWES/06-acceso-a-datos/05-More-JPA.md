# 6.5 Más acerca de JPA

## 1. Fetch Type

## 2. Paginación

## 3. Herencia

## 4. Otras anotaciones

### `@Transactional`
### `@IdClass`
### `@NaturalId`
### `@Transient`
### `@Enumerated`
### `@Temporal`
### `@MapsId`

## 5. Entity Manager

> **ACTIVIDAD 1:** Mejora la actividad acerca de alumnos, profesores y asignaturas haciendo que:
> - Alumnos y profesores se generalizan en Usuarios. Es decir, Alumno y Profesor son clases derivadas de Usuario.
> Emplea los mecanismos de herencia de JPA para reflejar esto tanto en el modelo de dominio como en la base de datos.

> **ACTIVIDAD 2:** Mejora My Favourite Composer para incluir conceptos avanzados de JPA. Por ejemplo, `@Enumerated` para los enumeradores y `@Temporal`.