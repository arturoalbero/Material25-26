# Servicios de Nombres de Dominio (DNS)

## Sistema de Nombres de Dominio (DNS)

El Sistema de Nombres de Dominio (DNS) es un sistema jerárquico y distribuido que permite traducir nombres de dominio legibles por humanos en direcciones IP. Las aplicaciones web dependen del DNS para resolver el nombre del servidor web, localizar servicios (web, LDAP, correo, etc.) o garantizar la accesibilidad y coherencia del despliegue.

El DNS se organiza como un árbol jerárquico, con los siguientes nodos:

- Raíz (.)
- Dominios de nivel superior (TLD): .com, .org, .es
- Dominios de segundo nivel: example.com
- Subdominios: www.example.com, ldap.example.com

Asimismo, los tipos de registros más usados son los siguientes
|Tipo de registro | Significado
|---|---
|A| Nombre a IPv4
|AAAA| Nombre a IPv6
|CNAME|  Alias
|MX|Correo
|NS| Servidores de nombres

## Configuración de un DNS usando BIND9

Para poner en práctica esto, usaremos un contenedor de Docker con la imagen de Alpine. Necesitaremos tener una estructura de trabajo similar a esta:
```plain
DNS/
└── named/
    ├── named.conf
    └── empresa.local.zone
```
El archivo `named.conf` es el archivo de configuración del servidor DNS y el archivo `.zone` determina la configuración concreta de la zona, en este caso `empresa.local`.

Para instalar bind9 en alpine, debemos ejecutar:
```shell
apk update
apk add bind
```
También podemos añadir bind con la opción `--no-cache` para reducir el tamaño del contenedor. Esto instalará el servidor `named` y otras utilidades, como `nslookup`.