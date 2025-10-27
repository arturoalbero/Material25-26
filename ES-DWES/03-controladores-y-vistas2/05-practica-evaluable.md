# My Favourite Composers 2.0

Mejora "My Favourite Composer" con las siguientes características:
* Un **formulario para añadir nuevos compositores**, que valide que las fechas sean correctas.
    * En el compositor, diferencia entre nombre real (nombre) y nombre artístico. Usaremos el nombre artístico como clave. *Franz Liszt* es el nombre real, pero *Liszt* el artístico. *Johannes Chrysostomus Wolfgangus Theophilus Mozart* es el nombre real, pero *Wolfgang Amadeus Mozart* el artístico. Si no se especifica un nombre artístico o real, se asume que los dos valores coinciden y se actúa en consecuencia (copiando el valor).
* Crea un **formulario que te permita introducir una pieza musical**, asignándole un compositor, basándote en la práctica de la unidad anterior. Emplea, por lo tanto, la clase `Pieza Musical` como *commandObject*, o bien una clase específica que, además de la pieza musical, incluya al compositor.
   * El compositor a seleccionar debe haber sido introducido previamente.
   * El compositor a seleccionar debe aparecer en una lista desplegada (dropdown).
   * La instrumentación se debe crear mediante un enumerador con las categorías PIANO, SOLO, CÁMARA, ORQUESTA, VOCAL, ESCENA, OTRO. 
   * Las piezas de tipo SOLO son por un instrumento solo que no sea piano.
   * Una pieza de cámara es aquella que involucra a varios instrumentistas, pero no llega a ser de orquesta. 
   * Llamamos "Vocal" a las piezas con solo voces (corales o no) y "Pieza de Escena" a las piezas de tipo operístico (voz y orquesta). 
    * Almacena la nueva pieza musical en el `.csv`.
    * En cada pieza musical, añade una lista de nombres alternativos. Por ejemplo, la *sonata para piano nº 14 en do sostenido menor, Op. 27 nº2 Quasi a fantasia* de Beethoven se conoce también como *Sonata nº 14 en do sostenido menor* o *Claro de luna* o *Moonlight Sonata*. 
* Sendos **formularios para EDITAR** compositores y/o piezas ya existentes. Ten en cuenta que permitiría reasignar piezas a otros compositores (pero no duplicarlas).
* Implementa la **validación de formularios** en los formularios de añadir y editar piezas musicales y compositores. Valida que las fechas sean fechas correctas, que los nombres no estén vacíos (salvo aquellos que puedan estarlo) y que los datos incluidos estén dentro de lo aceptado. Añade también mensajes de error y clases css de error. Modifica las clases del model con las anotaciones pertinentes.
* La posibilidad de borrar una pieza.
* La posibilidad de borrar un compositor (y todas sus piezas).
* Mejora **searchComposerView** para que admita la búsqueda con nombres parciales mediante **expresiones regulares**. Por ejemplo, si incluyes a *Franz Liszt* y a *Franz Peter Schubert* y buscas *Franz*, deben aparecer los dos.
* Una vista **searchMusicalPieceView** para buscar piezas musicales por su nombre. Implementa expresiones regulares para coincidencias parciales.
* Optimiza el código que maneja las colecciones empleando **programación funcional**.

## AMPLIACIÓN:

* Sobre el **formulario para añadir** nuevas piezas musicales a compositores registrados.
    * Al lado del apartado de compositores, añade un cuadro de texto que permita añadir el cuadro de un compositor no registrado. El cuadro se activa con un checkbox. 
    * Si está activo, se puede escribir en él pero no elegir a un compositor de la lista. 
    * Si no está activo, solo puedes escoger compositores de la lista. 
    * Cuando le des a enviar, debes lanzar el formulario de añadir compositor con el nombre del compositor no registrado y permitir añadir a dicho compositor y, finalmente, añadir la obra registrada en el nuevo compositor.
    