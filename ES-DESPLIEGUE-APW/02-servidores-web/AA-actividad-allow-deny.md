# Actividad de ampliación: ALLOW / DENY

Esta actividad se tiene que hacer con los conocimientos de allow/deny explicados en el punto 4 de esta unidad de programación.

> **ACTIVIDAD:** Abre tres equipos de clase, averigua las IP de los tres equipos y, en uno de ellos, lanza un servidor NGINX con contenido estático, como el de las actividades anteriores, pero sin usar Docker. Modifica el archivo de configuración para conseguir los siguientes efectos:
> - Impide el acceso de una localización concreta a uno de los equipos y permíteselo al resto.
> - Permite el acceso de una localización concreta a uno de los equipos y permíteselo al resto.
> - Impide el acceso a la red local. De esta manera, solo podrás acceder al contenido con el ordenador servidor que tenga el `localhost`.