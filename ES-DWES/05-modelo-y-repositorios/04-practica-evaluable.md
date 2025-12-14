# Práctica evaluable de la unidad de programación 5.

## 5.1. El modelo de dominio: Entidades. Uso de Lombok. Logging

> **ACTIVIDAD 1:** Rediseña la aplicación *My Favourite Composer* con un enfoque orientado a entidades. Recomiendo crear un nuevo proyecto desde cero, añadiendo las dependencias necesarias e incluyendo Lombok.
> - Agrupa los paquetes de forma correcta.
> - Diferencia los objetos que son entidades (Composer, Music Piece, etc.) de los DTO (objetos para recoger datos de los formularios).
> - Crea las clases de nuevo, usando Lombok.
> - Reutiliza las vistas y los controladores que puedas
> - Elimina toda la lógica de negocio que hayas puesto en los controladores y trasládala a diferentes servicios, que interactúen con las entidades (esto posiblemente ya lo tengas hecho).

> **ACTIVIDAD 2:**
> Añade logs a la aplicación.
> - Un log de info para cada controlador, para saber cuándo se accede a ellos.
> - Un log de info para los servicios, para comprobar que se está efectuando lo que queremos.
> - Un log de warning si:
>   - El compositor añadido vivió o vive más de 100 años.
>   - Si la pieza añadida a un compositor tuvo el estreno después de su fecha de nacimiento.
> - Añade un log de error cada vez que salte una excepción que tengas controlada.
>   - Añade una casuística más para no permitir añadir una pieza: Que su estreno sea anterior al nacimiento del compositor.