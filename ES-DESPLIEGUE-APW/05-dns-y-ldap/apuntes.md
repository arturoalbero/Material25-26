# Apuntes del RA5. ¿Cómo hay que hacer?

## 5. Verifica la ejecución de aplicaciones web comprobando los parámetros de configuración de servicios de red.

### Criterios de evaluación relacionados con el calendario de clase
1. Configurar DNS en Alpine -> usando el servicio BIND9
a) Se ha descrito la estructura, nomenclatura y funcionalidad de los sistemas de nombres jerárquicos.
b) Se han identificado las necesidades de configuración del servidor de nombres en función de los requerimientos de ejecución de las aplicaciones web desplegadas.

8 enero -> Examen RA4 + Introducción a DNS y LDAP
12 y 15 de enero - Configuración DNS con BIND9

https://wiki.alpinelinux.org/wiki/Small-Time_DNS_with_BIND9 

2. Configurar LDAP en Alpine -> usando el servicio OPENLDAP
c) Se han identificado la función, elementos y estructuras lógicas del servicio de directorio.
d) Se ha analizado la configuración y personalización del servicio de directorio.
e) Se ha analizado la capacidad del servicio de directorio como mecanismo de autenticación centralizada de los usuarios en una red.
f) Se han especificado los parámetros de configuración en el servicio de directorios adecuados para el proceso de validación de usuarios de la aplicación web.

19 y 22 de enero - Configuración LDAP con OPENLDAP

https://wiki.alpinelinux.org/wiki/Configure_OpenLDAP 

26 de enero y 29 de enero - Seguridad con openldap, examen el 29 de enero.

3. Tarea de ampliación

Montar una imagen con nginx, sftp, bind9 (dns), openldap y otra con la aplicación de spring boot, y coordinarlas con docker compose

### Transversal

g) Se ha elaborado documentación relativa a las adaptaciones realizadas en los servicios de red.
h) Se han utilizado tecnologías de virtualización en el despliegue de servidores de directorios en la nube y en contenedores.
