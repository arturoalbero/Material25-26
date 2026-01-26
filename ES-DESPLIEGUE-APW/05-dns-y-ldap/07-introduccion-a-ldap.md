# Introducción a LDAP

Vamos a seguir [**este tutorial**](https://somebooks.es/category/ldap/), adaptado a Docker y Alpine. Intentaremos realizar hasta el punto 6, pero puedes seguir profundizando en los 10 capítulos que tiene (aunque está pensado en Ubuntu Server, para usarlo con una máquina virtual)

> **ACTIVIDAD:** Sigue el tutorial y configura un contenedor con Open LDAP funcional.

## 1. LDAP - Lightweight Directory Access Protocol

LDAP es un protocolo de acceso distribuido, con una estructura ordenada, que permite establecer un servicio de directorio, con información accesible a través de la red.

Como en otros casos más complejos, como Active Directory, LDAP permite la organización de datos  por ámbitos geográficos, estructurales, etc. Y suele utilizar un espacio de nombres basado en DNS.

Las entradas del directorio pueden representar un amplio abanico de objetos, como usuarios, grupos, unidades organizativas, carpetas, archivos, impresoras, etc.

Uno de los usos más interesantes que podemos darle, es el almacenamiento de la información de autenticación de los usuarios, que nos permitirá gestionarla de forma centralizada. Este es el uso que aprenderemos a hacer del protocolo LDAP.

Por cierto, el nombre LDAP está formado por las siglas en inglés de Lightweight Directory Access Protocol (Protocolo Ligero de Acceso a Directorios).

## 2. Instalación de Open LDAP en Alpine Linux

### 2.1 Configuración inicial

Existen algunas cuestiones que deberemos tener en cuenta antes de instalar y configurar Alpine como servidor LDAP:

1. Lo primero será asegurarnos de que el sistema tiene asignada una dirección IP estática. Para ello, emplea el sistema que utilizamos con el servidor de DNS. 

Para consultar la configuración de red y asegurarte de que es correcta, puedes ejecutar el siguiente comando:
```sh
cat /etc/netplan/00-installer-config.yaml
```

2. También comprobaremos que los archivos/etc/hostname y /etc/hosts contienen los nombres adecuados para el servidor.

En el caso de /etc/hostname, para asignar un nuevo nombre al servidor, bastará con ejecutar el siguiente comando:

```sh
sudo hostnamectl set-hostname ldapserver.somebooks.local
```
> **NOTA:** `somebooks` es el nombre de la página web de donde es original el tutorial, puedes poner el nombre que te apetezca o necesites.

Con `/etc/hosts` el proceso es un poco más largo: debemos editar el archivo e incluir las líneas que relacionen la dirección IP estática del servidor con los nombres lógicos que tenemos previsto utilizar.

Para lograrlo, comenzaremos usando, por ejemplo, el editor nano:
```sh
sudo nano /etc/hosts
```

Nano es un editor de terminal, como vi o vim. Si `nano` no está instalado, instálalo en el contenedor. Puedes consultar cómo funciona desde su [página web oficial](https://www.nano-editor.org/). También puedes elegir bindear esa carpeta y editar el archivo con otro editor cualquiera desde el ordenador host (por ejemplo, vs code).

Una vez que nos encontramos en el entorno del editor, modificamos la línea que hace referencia al bucle local y añadimos una nueva línea que haga referencia a la dirección IP estática. En definitiva, algo como esto:

```sh
127.0.1.1 ldapserver.somebooks.local ldapserver
192.168.1.10 ldapserver.somebooks.local ldapserver
```
### 2.2 Instalar el software necesario
*Información extraída del [**tutorial oficial**](https://wiki.alpinelinux.org/wiki/Configure_OpenLDAP) de Alpine.*

#### Instalación de paquetes

Existe un paquete de Alpine para OpenLDAP. Sin embargo, simplemente añadir el paquete `openldap` no es suficiente para que todo funcione. También necesitarás instalar una base de datos backend y algunas herramientas de línea de comandos de LDAP.

Así es como se hace:

```sh
apk add openldap openldap-back-mdb openldap-clients
```

Pero antes de iniciar el servicio `slapd`, es necesario realizar algo de configuración.

#### Personalizar la configuración para OpenLDAP 2.3+

El paquete OpenLDAP de Alpine puede usar un directorio de configuración (`slapd.d`) o un archivo de configuración (`slapd.conf`). Desde la versión 2.3 de OpenLDAP, el método preferido es utilizar el directorio de configuración `slapd.d`. Toda la documentación oficial de OpenLDAP, incluida la guía de inicio rápido, utiliza este método.

Primero, crea el directorio `slapd.d` con la propiedad y permisos adecuados:

```sh
install -m 755 -o ldap -g ldap -d /etc/openldap/slapd.d
```

A continuación, edita la configuración de arranque de `slapd` para que use el directorio en lugar del archivo.

1. Abre `/etc/conf.d/slapd` en tu editor favorito.
2. Comenta la línea `cfgfile="/etc/openldap/slapd.conf"`.
3. Descomenta la línea `cfgdir="/etc/openldap/slapd.d"`.

Por último, elimina el archivo `slapd.conf` incluido:

```sh
rm /etc/openldap/slapd.conf
```

#### Actualizar los nombres de archivos de bibliotecas compartidas

Abre `/etc/openldap/slapd.ldif` en tu editor favorito. Busca los nombres de archivo que terminan en `.la` y cambia la extensión a `.so`.

#### Personalizar la configuración para tu dominio

Tu dominio LDAP puede ser el mismo que tu dominio DNS o puede ser completamente diferente. Sea cual sea el que elijas, asegúrate de usar la convención de nombres LDAP `dc=dominio,dc=tld` en lugar del estilo DNS separado por puntos `dominio.tld`.

Edita de nuevo `slapd.ldif`:

* Busca la palabra clave `olcSuffix:`
* Cambia su valor para que coincida con tu dominio
* Busca `olcRootDN:`
* Cambia su valor para que coincida con tu dominio

Más adelante, este documento asumirá que el dominio es `dc=home` o `dc=contoso,dc=com`, lo que refleja un dominio `home` o `contoso.com`, respectivamente.

#### Importar la configuración

Verifica `slapd.ldif` por última vez y utiliza el comando `slapadd` para importarlo en la base de datos backend.

```sh
slapadd -n 0 -F /etc/openldap/slapd.d -l /etc/openldap/slapd.ldif
```

No debería haber errores, solo un mensaje de **“Closing DB…”**.

A continuación, cambia la propiedad de los archivos resultantes en `/etc/openldap/slapd.d`.

Si omites este paso, el servicio `slapd` se negará a arrancar.

```sh
# chown -R ldap:ldap /etc/openldap/slapd.d/*
```

#### Configurar el servicio slapd

Falta el directorio del PID. Será necesario crearlo o el servicio no se iniciará, así que este paso debe realizarse primero.

```sh
install -m 755 -o ldap -g ldap -d /var/lib/openldap/run
```

Después, puedes iniciar el servicio y habilitarlo para que arranque al inicio del sistema:

```sh
rc-service slapd start
rc-update add slapd
```

#### Pruebas

La guía de inicio rápido de OpenLDAP utiliza la utilidad `ldapsearch` para probar la configuración.

```sh
$ ldapsearch -x -b "" -s base '(objectclass=*)' namingContexts
```

Deberías ver tu dominio.

También puedes probar con `slapcat`:

```sh
$ slapcat -n 0
```

Esto mostrará toda la base de datos de configuración en formato LDIF. También puedes redirigir la salida a `grep` y especificar el nombre de tu dominio para verificar que todo es correcto. Al usar `grep`, recuerda que LDAP utiliza el formato `dc=dominio,dc=com` y no el más habitual `dominio.com`.

Más adelante, cuando empieces a poblar tu base de datos LDAP, puedes usar `slapcat -n 1` para ver tu información. (El número cero corresponde a la base de datos de configuración. Los números mayores que cero son bases de datos definidas por el usuario).

Por último, puedes ejecutar `netstat -tln` y buscar el puerto LDAP **389** en la salida.


## 3. Iniciar la estructura del directorio

Aquí tienes la traducción al castellano:

---

## Creación de una estructura organizativa

Ahora que la instalación está completa, puedes empezar a utilizar tu base de datos LDAP. Como mínimo, necesitarás crear una organización dentro de tu directorio LDAP.

## Añadir entradas iniciales a tu directorio

Puedes usar **ldapadd(1)** para añadir entradas a tu directorio LDAP. `ldapadd` espera la entrada en formato **LDIF**. Lo haremos en dos pasos:

1. Crear un archivo LDIF
2. Ejecutar `ldapadd`

Usa tu editor favorito y crea un archivo LDIF que contenga:

```
dn: dc=<MI-DOMINIO>,dc=<COM>
objectclass: dcObject
objectclass: organization
o: <MI ORGANIZACIÓN>
dc: <MI-DOMINIO>

dn: cn=Manager,dc=<MI-DOMINIO>,dc=<COM>
objectclass: organizationalRole
cn: Manager
```

Asegúrate de sustituir `<MI-DOMINIO>` y `<COM>` por los componentes de dominio adecuados de tu nombre de dominio. `<MI ORGANIZACIÓN>` debe reemplazarse por el nombre de tu organización. Al copiar y pegar, asegúrate de eliminar cualquier espacio en blanco al principio y al final del ejemplo.

**Ejemplo**:

```
dn: dc=example,dc=com
objectclass: dcObject
objectclass: organization
o: Example Company
dc: example

dn: cn=Manager,dc=example,dc=com
objectclass: organizationalRole
cn: Manager
```

Ahora puedes ejecutar **ldapadd(1)** para insertar estas entradas en tu directorio:

```sh
ldapadd -x -D "cn=Manager,dc=<MI-DOMINIO>,dc=<COM>" -W -f example.ldif
```

Asegúrate de reemplazar `<MI-DOMINIO>` y `<COM>` por los componentes de dominio adecuados de tu nombre de dominio. Se te pedirá la contraseña (“secret”) especificada en `slapd.conf`. Por ejemplo, para **example.com**, usa:

```sh
ldapadd -x -D "cn=Manager,dc=example,dc=com" -W -f example.ldif
```

donde **example.ldif** es el archivo que creaste anteriormente.


Aquí tienes un ejemplo que utiliza el dominio **contoso.com** como organización y **home / dc=home** como DN base (actualiza el `baseDN` si el tuyo es diferente):

```sh
cat <<EOF >org.ldif
dn: dc=contoso,dc=com
objectclass: dcObject
objectclass: organization
o: Fictional Company
dc: contoso

dn: cn=Manager,dc=contoso,dc=com
objectclass: organizationalRole
cn: Manager
EOF

ldapadd -x -D "cn=Manager,dc=home" -w secret -f org.ldif
```

También puede que quieras crear **unidades organizativas (OU)** para ayudar a mantener tu directorio ordenado.

Aquí tienes un LDIF para crear **People** y **Groups** como OUs:

```ldif
# Unidad organizativa para usuarios
dn: ou=People,dc=home
changetype: add
objectClass: organizationalUnit
ou: People

# Unidad organizativa para grupos
dn: ou=Groups,dc=home
changetype: add
objectClass: organizationalUnit
ou: Groups
```

Importa las OUs con un comando `ldapadd` similar al utilizado para crear la organización.

Una vez hecho esto, ya estás listo para conectarte al servidor LDAP con la herramienta de administración que prefieras y empezar a añadir usuarios, grupos, etc. **LDAPAdmin** es una herramienta veterana, pero muy útil para usuarios de Windows.


## 4. Añadir usuarios y grupos de forma manual

## 5. Buscar, modificar y eliminar elementos del directorio

## 6. Importar los usuarios y grupos locales

## 7. Configurar un cliente para autenticarse en Open LDAP

> **ACTIVIDAD AMPLIACIÓN:** Realiza el tutorial completo (o parcial) usando una máquina virtual con Ubuntu Server.