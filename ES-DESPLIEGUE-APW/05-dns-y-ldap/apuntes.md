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


# Verificación de aplicaciones web mediante servicios de red (DNS y LDAP)

Estos apuntes desarrollan el **Resultado de Aprendizaje 5** utilizando **DNS (BIND9)** y **LDAP (OpenLDAP)** como servicios de red fundamentales para la correcta ejecución de aplicaciones web.

El enfoque sigue el mismo **formato práctico y encapsulado en Docker con Alpine Linux** usado en los materiales anteriores del módulo.

---

## Actividad 1 – Servicio de nombres de dominio (DNS) con BIND9

### 1. Introducción

El **Sistema de Nombres de Dominio (DNS)** es un sistema jerárquico y distribuido que permite traducir nombres de dominio legibles por humanos en direcciones IP. Las aplicaciones web dependen del DNS para:

* Resolver el nombre del servidor web
* Localizar servicios (web, LDAP, correo, etc.)
* Garantizar la accesibilidad y coherencia del despliegue

---

### 2. Estructura y nomenclatura del DNS (Criterio a)

El DNS se organiza como un **árbol jerárquico**:

* **Raíz (.)**
* **Dominios de nivel superior (TLD)**: `.com`, `.org`, `.es`
* **Dominios de segundo nivel**: `example.com`
* **Subdominios**: `www.example.com`, `ldap.example.com`

Tipos de registros más usados:

* `A` → Nombre a IPv4
* `AAAA` → Nombre a IPv6
* `CNAME` → Alias
* `MX` → Correo
* `NS` → Servidores de nombres

---

### 3. Necesidades de configuración DNS para aplicaciones web (Criterio b)

Una aplicación web necesita:

* Resolución correcta del nombre del servidor
* Coherencia entre DNS y certificados TLS
* Posibilidad de definir subdominios (www, api, ldap)

Ejemplo:

* `www.empresa.local` → Servidor web
* `ldap.empresa.local` → Servicio de directorio

---

### 4. Entorno de trabajo con Docker y Alpine

Se usará una imagen **Alpine Linux** con BIND9 instalado.

#### 4.1 Estructura de trabajo

```text
DNS/
├── docker-compose.yml
├── Dockerfile
└── named/
    ├── named.conf
    └── empresa.local.zone
```

---

### 5. Dockerfile para BIND9

```dockerfile
FROM alpine:latest
RUN apk add --no-cache bind
CMD ["named", "-g"]
```

---

### 6. Configuración básica de BIND9

#### named.conf

```conf
options {
    directory "/var/bind";
    listen-on { any; };
    allow-query { any; };
};

zone "empresa.local" {
    type master;
    file "empresa.local.zone";
};
```

#### Zona empresa.local

```dns
$TTL 86400
@   IN  SOA ns.empresa.local. admin.empresa.local. (
        2025010101
        3600
        1800
        604800
        86400 )

@       IN  NS      ns.empresa.local.
ns      IN  A       172.20.0.2
www     IN  A       172.20.0.10
ldap    IN  A       172.20.0.20
```

---

### 7. Verificación del servicio DNS

Desde un contenedor cliente:

```sh
apk add bind-tools
dig www.empresa.local
```

Esto permite **verificar los parámetros de configuración DNS** y su impacto directo en la ejecución de la aplicación web.

---

## Actividad 2 – Servicio de directorio LDAP con OpenLDAP

### 1. Introducción

Un **servicio de directorio LDAP** permite almacenar y organizar información de usuarios y recursos de red de forma jerárquica y centralizada. En aplicaciones web se usa principalmente para:

* Autenticación de usuarios
* Gestión centralizada de credenciales
* Control de acceso

---

### 2. Función, elementos y estructura lógica del LDAP (Criterio c)

Elementos clave:

* **DN (Distinguished Name)** → Identificador único
* **Entry** → Objeto del directorio
* **Attributes** → Propiedades del objeto
* **ObjectClass** → Tipo de objeto

Ejemplo de DN:

```text
uid=usuario1,ou=users,dc=empresa,dc=local
```

Estructura lógica:

* dc=empresa,dc=local

  * ou=users
  * ou=groups

---

### 3. Análisis de la configuración de OpenLDAP (Criterio d)

OpenLDAP se configura mediante:

* Base DN
* Esquemas
* Backend de almacenamiento
* Métodos de autenticación

---

### 4. Entorno Docker con Alpine

#### Estructura de trabajo

```text
LDAP/
├── docker-compose.yml
├── Dockerfile
└── ldif/
    ├── base.ldif
    └── users.ldif
```

---

### 5. Dockerfile para OpenLDAP

```dockerfile
FROM alpine:latest
RUN apk add --no-cache openldap openldap-back-mdb openldap-clients
CMD ["slapd", "-d", "256", "-h", "ldap:/// ldapi:///"]
```

---

### 6. Configuración inicial del directorio

#### base.ldif

```ldif
dn: dc=empresa,dc=local
objectClass: top
objectClass: domain
dc: empresa


dn: ou=users,dc=empresa,dc=local
objectClass: organizationalUnit
ou: users
```

#### users.ldif

```ldif
dn: uid=usuario1,ou=users,dc=empresa,dc=local
objectClass: inetOrgPerson
cn: Usuario Uno
sn: Uno
uid: usuario1
userPassword: password
```

---

### 7. LDAP como autenticación centralizada (Criterio e)

Ventajas:

* Un único punto de autenticación
* Integración con aplicaciones web (PHP, Java, Python)
* Mayor control y auditoría

Las aplicaciones web consultan LDAP para validar usuarios sin almacenar contraseñas localmente.

---

### 8. Parámetros LDAP para validación de usuarios (Criterio f)

Parámetros habituales:

* URL del servidor LDAP
* Base DN
* DN de búsqueda
* Filtro de usuario (`(uid={username})`)
* Credenciales de acceso

Ejemplo de conexión:

```text
ldap://ldap.empresa.local
Base DN: dc=empresa,dc=local
User DN: uid=%u,ou=users,dc=empresa,dc=local
```

---

## Relación DNS + LDAP + Aplicaciones Web

* DNS permite localizar el servicio LDAP y el servidor web
* LDAP valida usuarios de forma centralizada
* Ambos servicios deben estar correctamente configurados para garantizar la ejecución de la aplicación web

---

## Conclusión

Con estas dos actividades se verifica la ejecución de aplicaciones web mediante el análisis y configuración de **servicios de red críticos**, cumpliendo todos los criterios del Resultado de Aprendizaje 5.
