# Configuración del cliente y operaciones comunes LDAP en línea de comandos (CLI)

## 1. Configuración del cliente LDAP

> **ACTIVIDAD:** Completa este tutorial, partiendo del del punto anterior, y documenta el proceso en la memoria.
> - Configura el cliente en docker alpine
> - Realiza las operaciones básicas LDAP usando las herramientas del contenedor cliente

### 1.1. Conceptos importantes de LDAP

Como hemos visto en el documento anterior **LDAP** (*Lightweight Directory Access Protocol*) es un protocolo estándar para acceder y gestionar servicios de directorio distribuido. **OpenLDAP** es la implementación open-source más utilizada.

Tenemos que tener en cuenta los siguientes conceptos clave:

##### Conceptos clave

| Término | Descripción |
|---|---|
| **DN** (Distinguished Name) | Identificador único de una entrada. Ej: `cn=Juan,ou=Users,dc=empresa,dc=com` |
| **RDN** (Relative DN) | Componente más específico del DN. Ej: `cn=Juan` |
| **DIT** (Directory Info Tree) | Estructura jerárquica del árbol de directorio |
| **Entry** | Nodo en el árbol, descrito por atributos |
| **ObjectClass** | Define qué atributos puede/debe tener una entrada |
| **Attribute** | Par clave-valor dentro de una entrada. Ej: `mail: juan@empresa.com` |
| **Schema** | Conjunto de reglas que definen objectClasses y attributes válidos |
| **LDIF** | LDAP Data Interchange Format. Formato de texto para importar/exportar datos |
| **Base DN** | Raíz del árbol de búsqueda. Ej: `dc=empresa,dc=com` |
| **Bind DN** | Credenciales para autenticarse en el servidor LDAP |

##### Puertos estándar LDAP

| Puerto | Uso |
|---|---|
| **389** | LDAP (sin cifrar o con STARTTLS) |
| **636** | LDAPS (LDAP sobre SSL/TLS) |
| **3268** | Global Catalog (Microsoft AD) |
| **3269** | Global Catalog sobre SSL |

Nosotros estamos construyendo un entorno para trabajar con OpenLDAP con las siguientes características:

```
HOST Windows
├── Apache Directory Studio (cliente GUI LDAP)
│   └── Se conecta a localhost:389
│
└── Docker Engine
    ├── Contenedor: ldap-server  (Alpine + OpenLDAP)
    │   ├── Puerto expuesto: 389:389
    │   └── Red: ldap-net
    │
    └── Contenedor: ldap-client  (Alpine + ldap-utils)
        └── Red: ldap-net
```

### 1.2. Creación de un cliente OpenLDAP en Docker y Alpine

Debemos crear una imagen igual que la anterior, pero no hace falta bindear ningún archivo ni exponer los puertos

```sh
docker run -it --name ldap-client --network ldap-net alpine sh
```

Así, entramos en el modo iterativo e instalamos `openldap-clients`.

Con los dos contenedores corriendo, dentro del cliente podemos probar:

```bash
# Desde dentro del contenedor ldap-client:
# El servidor se resuelve por nombre gracias a la red Docker

# Test básico de conexión anónima:
ldapsearch -x -H ldap://ldap-server:389  -b '' -s base '(objectclass=*)' namingContexts

# Test con autenticación:
ldapsearch -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'dc=empresa,dc=com' '(objectclass=*)'
```

> **SABÍAS QUÉ...** si queremos simplificar el proceso, podemos crear variables de entorno de la siguiente forma:
> 
> ```bash
> export LDAP_HOST='ldap://ldap-server:389'
> export LDAP_BASE='dc=empresa,dc=com'
> export LDAP_ADMIN='cn=admin,dc=empresa,dc=com'
> export LDAP_PASS='admin123'
>
> # Ahora los comandos son más cortos:
> ldapsearch -x -H $LDAP_HOST -D $LDAP_ADMIN -w $LDAP_PASS -b $LDAP_BASE '(objectclass=*)'
> ```

## 2. Operaciones LDAP características

### 2.1 Estructura y unidades organizativas

Antes de añadir usuarios y grupos necesitamos crear la estructura base del árbol:

```
dc=empresa,dc=com
├── ou=People        → usuarios
├── ou=Groups        → grupos
├── ou=Services      → cuentas de servicio
└── ou=Computers     → equipos
```

Creamos el **archivo: `base_structure.ldif`** en el cliente, con la ruta `/ldif/base_structure.ldif`. Utiliza vim o vi (sigue [**este tutorial**](https://opensource.com/article/19/3/getting-started-vim) para iniciarte en el programa) para crearlo:

```ldif
# 1. Entrada raíz de la organización
dn: dc=empresa,dc=com
objectClass: top
objectClass: dcObject
objectClass: organization
o: Empresa S.L.
dc: empresa

# 2. OU para usuarios
dn: ou=People,dc=empresa,dc=com
objectClass: top
objectClass: organizationalUnit
ou: People
description: Usuarios de la organizacion

# 3. OU para grupos
dn: ou=Groups,dc=empresa,dc=com
objectClass: top
objectClass: organizationalUnit
ou: Groups
description: Grupos de la organizacion

# 4. OU para servicios
dn: ou=Services,dc=empresa,dc=com
objectClass: top
objectClass: organizationalUnit
ou: Services
description: Cuentas de servicio

# 5. OU para equipos
dn: ou=Computers,dc=empresa,dc=com
objectClass: top
objectClass: organizationalUnit
ou: Computers
description: Equipos de la organizacion
```

```bash
ldapadd -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -f /ldif/base_structure.ldif
```

### 2.2 Gestión de Usuarios

El objectClass `inetOrgPerson` es el más completo para usuarios. Combina atributos de `person`, `organizationalPerson` e `inetOrgPerson`.

**Archivo: `users.ldif`**

```ldif
# Usuario 1: Juan García (Administrador IT)
dn: uid=jgarcia,ou=People,dc=empresa,dc=com
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: jgarcia
cn: Juan García
sn: García
givenName: Juan
displayName: Juan García
mail: jgarcia@empresa.com
telephoneNumber: +34 91 123 4567
title: Administrador de Sistemas
ou: IT
departmentNumber: IT-001
employeeNumber: 001
uidNumber: 1001
gidNumber: 5000
homeDirectory: /home/jgarcia
loginShell: /bin/bash
userPassword: {SSHA}HASH_AQUI

# Usuario 2: María López (Desarrolladora)
dn: uid=mlopez,ou=People,dc=empresa,dc=com
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: mlopez
cn: María López
sn: López
givenName: María
displayName: María López
mail: mlopez@empresa.com
telephoneNumber: +34 91 234 5678
title: Desarrolladora Senior
ou: Desarrollo
departmentNumber: DEV-001
employeeNumber: 002
uidNumber: 1002
gidNumber: 5001
homeDirectory: /home/mlopez
loginShell: /bin/bash
userPassword: {SSHA}HASH_AQUI
```

```bash
# Genera los hashes de contraseña primero:
slappasswd -s Password123   # Para jgarcia
slappasswd -s Secret456     # Para mlopez

# Reemplaza HASH_AQUI en el LDIF con los valores generados, luego importa:
ldapadd -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -f /ldif/users.ldif
```

#### Listar todos los usuarios

```bash
ldapsearch -x \
  -H ldap://ldap-server:389 \
  -D 'cn=admin,dc=empresa,dc=com' \
  -w admin123 \
  -b 'ou=People,dc=empresa,dc=com' \
  '(objectClass=inetOrgPerson)' \
  uid cn mail title
```

#### Buscar un usuario específico

```bash
ldapsearch -x \
  -H ldap://ldap-server:389 \
  -D 'cn=admin,dc=empresa,dc=com' \
  -w admin123 \
  -b 'ou=People,dc=empresa,dc=com' \
  '(uid=jgarcia)'
```

### 2.3 Gestión de Grupos

#### Tipos de grupos en LDAP

| ObjectClass | Descripción |
|---|---|
| `posixGroup` | Grupos Unix. Miembros por `memberUid` (uid del usuario) |
| `groupOfNames` | Grupos LDAP. Miembros por DN completo en atributo `member` |
| `groupOfUniqueNames` | Similar a `groupOfNames` pero miembros en `uniqueMember` |

**Archivo: `groups.ldif`**

```ldif
# Grupo IT (posixGroup - estilo Unix)
dn: cn=it,ou=Groups,dc=empresa,dc=com
objectClass: top
objectClass: posixGroup
cn: it
gidNumber: 5000
description: Departamento de IT
memberUid: jgarcia

# Grupo Developers (groupOfNames - estilo LDAP)
dn: cn=developers,ou=Groups,dc=empresa,dc=com
objectClass: top
objectClass: groupOfNames
cn: developers
description: Equipo de Desarrollo
member: uid=mlopez,ou=People,dc=empresa,dc=com

# Grupo Admins (con varios miembros)
dn: cn=admins,ou=Groups,dc=empresa,dc=com
objectClass: top
objectClass: posixGroup
cn: admins
gidNumber: 5002
description: Administradores del sistema
memberUid: jgarcia
memberUid: mlopez
```

```bash
ldapadd -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -f /ldif/groups.ldif
```

### 2.4 Búsquedas LDAP (ldapsearch)

#### Sintaxis básica

```bash
ldapsearch [opciones] [filtro] [atributos]
```

#### Opciones principales

| Opción | Descripción |
|---|---|
| `-x` | Autenticación simple (no SASL) |
| `-H ldap://` | URL del servidor LDAP |
| `-D binddn` | DN para autenticarse |
| `-w password` | Contraseña en texto plano |
| `-W` | Solicitar contraseña interactivamente |
| `-b basedn` | Base DN de búsqueda |
| `-s scope` | Ámbito: `base`, `one`, `sub` (default: `sub`) |
| `-l timelimit` | Tiempo límite en segundos |
| `-z sizelimit` | Número máximo de entradas |
| `-LLL` | Salida LDIF limpia (sin comentarios) |
| `-o ldif-wrap=no` | Deshabilitar el ajuste de línea en LDIF |

#### Sintaxis de filtros

Los filtros LDAP usan notación prefija con paréntesis:

| Filtro | Descripción |
|---|---|
| `(objectClass=*)` | Todas las entradas (presencia) |
| `(uid=jgarcia)` | Igualdad exacta |
| `(cn=Juan*)` | Coincidencia de subcadena |
| `(uidNumber>=1000)` | Mayor o igual que |
| `(&(objectClass=person)(uid=*))` | AND lógico |
| `(|(uid=jgarcia)(uid=mlopez))` | OR lógico |
| `(!(uid=admin))` | NOT lógico |
| `(mail=*@empresa.com)` | Email de empresa |

#### Ejemplos de búsquedas

```bash
# 1. Todos los usuarios con email:
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'ou=People,dc=empresa,dc=com' '(mail=*)' uid cn mail

# 2. Usuarios de un departamento (IT):
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'ou=People,dc=empresa,dc=com' '(ou=IT)' uid cn title

# 3. Grupos a los que pertenece un usuario:
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'ou=Groups,dc=empresa,dc=com' '(memberUid=jgarcia)' cn description

# 4. Búsqueda por nombre parcial:
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'dc=empresa,dc=com' '(cn=Juan*)'

# 5. Scope one — solo hijos directos, no recursivo:
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'dc=empresa,dc=com' -s one '(objectClass=organizationalUnit)' ou

# 6. Salida limpia LDIF sin comentarios:
ldapsearch -x -LLL -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'ou=People,dc=empresa,dc=com' '(objectClass=inetOrgPerson)' uid cn mail
```

### 2.5 Modificación de Entradas (ldapmodify)

`ldapmodify` modifica atributos de entradas existentes. Las operaciones posibles son `add`, `delete` y `replace`. Las operaciones múltiples dentro de un mismo LDIF se separan con un guión (`-`).

#### Cambiar el correo de un usuario

```ldif
dn: uid=jgarcia,ou=People,dc=empresa,dc=com
changetype: modify
replace: mail
mail: j.garcia.nuevo@empresa.com
```

```bash
ldapmodify -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -f modify_mail.ldif
```

#### Añadir un atributo nuevo

```ldif
dn: uid=jgarcia,ou=People,dc=empresa,dc=com
changetype: modify
add: description
description: Administrador principal de sistemas Linux
```

#### Eliminar un atributo

```ldif
dn: uid=jgarcia,ou=People,dc=empresa,dc=com
changetype: modify
delete: telephoneNumber
```

#### Múltiples cambios en una sola operación

```ldif
dn: uid=mlopez,ou=People,dc=empresa,dc=com
changetype: modify
replace: title
title: Lead Developer
-
add: description
description: Responsable técnico del equipo frontend
-
replace: departmentNumber
departmentNumber: DEV-002
```

#### Cambiar la contraseña de un usuario

```bash
# Con ldappasswd (herramienta específica):
ldappasswd -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -s NuevaPassword789 'uid=jgarcia,ou=People,dc=empresa,dc=com'

# Un usuario puede cambiar su propia contraseña:
ldappasswd -x -H ldap://ldap-server:389 -D 'uid=jgarcia,ou=People,dc=empresa,dc=com' -w Password123 -a Password123 -s NuevoPassword999
```

### 2.6 Eliminación de Entradas (ldapdelete)

```bash
# Eliminar un usuario:
ldapdelete -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 'uid=jgarcia,ou=People,dc=empresa,dc=com'

# Eliminar múltiples entradas desde un archivo
# (un DN por línea, sin cabecera LDIF):
cat > delete_list.txt << 'EOF'
uid=jgarcia,ou=People,dc=empresa,dc=com
cn=it,ou=Groups,dc=empresa,dc=com
EOF

ldapdelete -x -H ldap://ldap-server:389 -D 'cn=admin,dc=empresa,dc=com' -w admin123 -f delete_list.txt
```

> **CUIDADO:** No se puede eliminar una entrada que tenga entradas hijas. Elimina siempre de abajo a arriba (hojas primero).

### 2.7 Autenticación LDAP

La autenticación LDAP (*bind*) verifica que un DN conoce su contraseña. Los dos tipos más comunes son:

- **Simple Bind**: el cliente envía DN y contraseña en texto — usar siempre con TLS en producción.
- **Anonymous Bind**: sin credenciales, acceso limitado por ACLs.

#### Probar autenticación de usuario

```bash
# Intentar bind con credenciales de un usuario (no admin):
ldapsearch -x -H ldap://ldap-server:389 -D 'uid=mlopez,ou=People,dc=empresa,dc=com' -w Secret456 -b 'uid=mlopez,ou=People,dc=empresa,dc=com' '(objectClass=*)' cn mail

# Si devuelve datos      → autenticación exitosa
# Código 49             → credenciales inválidas
# Código 32             → usuario no encontrado (No such object)
```

#### Flujo de autenticación en aplicaciones

```bash
# Paso 1: Bind como admin para localizar el DN del usuario
ldapsearch -x -H ldap://ldap-server -D 'cn=admin,dc=empresa,dc=com' -w admin123 -b 'ou=People,dc=empresa,dc=com' '(uid=mlopez)' dn

# Paso 2: Bind con el DN encontrado y la contraseña del usuario
ldapsearch -x -H ldap://ldap-server -D 'uid=mlopez,ou=People,dc=empresa,dc=com' -w Secret456 -b 'uid=mlopez,ou=People,dc=empresa,dc=com' '(objectClass=*)' cn
```

### 2.8 Control de Acceso (ACLs)

Las ACLs en `slapd.conf` controlan quién puede leer, modificar o autenticarse con qué atributos. La sintaxis general es:

```
access to <qué>
  by <quién>  <nivel>
  by <quién>  <nivel>
```

Los **niveles de acceso** de menor a mayor son: `none` → `auth` → `compare` → `search` → `read` → `write` → `manage`.

#### Ejemplos de ACL

```
# 1. Contraseñas: solo auth anónima y escritura propia
access to attrs=userPassword
  by self                                 write
  by anonymous                            auth
  by dn.exact="cn=admin,dc=empresa,dc=com" write
  by *                                    none

# 2. Datos personales: el usuario puede editar los suyos
access to attrs=mail,telephoneNumber,description
  by self          write
  by users         read
  by *             none

# 3. OU completa: solo lectura para usuarios autenticados
access to dn.subtree="ou=People,dc=empresa,dc=com"
  by dn.exact="cn=admin,dc=empresa,dc=com" write
  by users         read
  by *             none

# 4. Todo lo demás: lectura general
access to *
  by dn.exact="cn=admin,dc=empresa,dc=com" write
  by users         read
  by *             read
```

> **ATENCIÓN:** Las ACLs se evalúan en orden. La primera que coincide con `<qué>` se aplica. Si ninguna coincide, se deniega el acceso.

