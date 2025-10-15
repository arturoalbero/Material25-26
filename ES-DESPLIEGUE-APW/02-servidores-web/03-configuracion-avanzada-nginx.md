# Configuración avanzada

## Usos del bloque location

La directiva de bloque `location` nos permite asociar diferentes URI a los distintos recursos del servidor. La directiva de bloque `location` requiere un parámetro extra antes de los `{}` y es, precisamente, el URI que queremos mapear. Dentro del contexto de `location` tenemos que indicar los recursos que queremos servir.

Dentro de la carpeta donde tienes bindeada la dirección del contenedor `/usr/share/nginx/html` crea una subcarpeta `miscosas` y dentro un archivo `index.html` como este:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title> 
</head>
<body>
    <h1>Estas son mis cosas</h1>
    <p>Algunas cosas</p>
</body>
</html>
```
Después, modifica el `nginx.conf` de la siguiente forma:

```
events {}

http{
    include mime.types;
    server{
        listen 8080;
        root /usr/share/nginx/html;
        
        location /miscosas {
            root /usr/share/nginx/html;
        }
    }
}
```
En este ejemplo, la localización del recurso `/miscosas`, cuya raíz es, precisamente, el root anterior (por lo que no habría mucha diferencia de ponerlo a no ponerlo). Lo que hace `location` es añadir `/miscosas` a la localización que hemos indicado como `root`. Recuerda que para que se sirva algo en estas URL, tiene que haber un archivo `index.html` en la carpeta, si no, dará error 403 (forbidden) al intentar acceder.

> **NOTA**: Un fallo habitual es poner la ruta completa del location en el root. Lo que interpretaría nginx si pusiéramos en el root de dentro del location `root /usr/share/nginx/html/miscosas;` es `root /usr/share/nginx/html/miscosas/miscosas;`.

Si no queremos que se añada la localización, podemos usar `alias` en lugar de `root`. Esto además nos va a permitir mapear varias URIS a una sola localización en nuestro servidor. En el siguiente ejemplo, `miscosas` y `mascosas` apuntan al mismo recurso:

```
events {}

http{
    include mime.types;
    server{
        listen 8080;
        root /usr/share/nginx/html;
        
        location /miscosas {
            root /usr/share/nginx/html;
        }
        location /mascosas {
            alias /usr/share/nginx/html/miscosas;
        }
    }
}
```
Si tratamos de acceder a una carpeta que no tenga un `index.html`, nos dará error 403. Para poder acceder a los recursos, debemos usar la directiva `tryfiles`. Crea una carpeta `otrascosas` dentro de la carpeta html y dentro de ella un archivo `cosas.html` tal que así:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css"> 
</head>
<body>
    <h1>No soy un index y aun así me ves</h1>
</body>
</html>
```
Si queremos acceder a este archivo al escribir la URI `/otrascosas`, debemos configurar el `nginx.conf` usando `try_files`:
```
events {}

http{
    include mime.types;
    server{
        listen 8080;
        root /usr/share/nginx/html;
        
        location /miscosas {
            root /usr/share/nginx/html;
        }
        location /mascosas {
            alias /usr/share/nginx/html/miscosas;
        }
        location /otrascosas {
            root /usr/share/nginx/html;
            try_files /otrascosas/cosas.html /index.html = 404;
        }
    }
}
```
Como vemos en el ejemplo, try_files admite no solo un recurso, sino varios. Si no encuentra el primero, pasa al segundo y así sucesivamente. Si no encuentra ninguno, con `=404`le indicamos que lance un error 404 (recurso no encontrado). Los construye desde el `root` sin añadirle el argumento del `location`, lo cual también es un dato importante para hacer bien el mapeo de ficheros.

Finalmente, también podemos hacer uso de expresiones regulares en location, de la siguiente forma:
```
location ~* /count/[0-9] {
    root /usr/share/nginx/html;
    try_files index.html =404;
}
```
Con el argumento `~*` le indicamos que trate la URI que sigue como una expresión regular. En este caso, interpretará `[0-9]` como cualquier número de una cifra (del 0 al 9) y después realizará el contenido de esa dirección. Esto nos permite controlar que varias direcciones escritas de formas distintas nos lleven al mismo sitio (así podríamos controlar variantes ortográficas sencillas, por ejemplo).

> **ACTIVIDAD:** Prueba los usos de `location` trabajados hasta ahora y documenta las pruebas. Debes testear:
> * Encontrar una dirección usando location y root.
> * Encontrar una dirección usando alias.
> * Encontrar una dirección usando try_files. En este caso, pon varias alternativas y ve cambiando el nombre de los archivos html para que primero encuentre el primero, luego el segundo y, finalmente, al no encontrar ninguno lance un error 404.
> * Encontrar una dirección usando expresiones regulares.

### Redirects

Podemos redirigir una location a otra fácilmente de la siguiente manera:

```
location /cositas {
    return 307 /otrascosas;
}
```
En este ejemplo, cada vez que se acceda al URI `/cositas` se enviará un mensaje http con el código 307 (redirección) y se redirigirá al URI `/otrascosas`, lo que entonces resolverá su location y nos mostrará su contenido. En este caso, la URL cambia.

### Rewrite

Rewrite es una directiva especial que nos permite transformar una dirección en otra sin que cambie en el navegador. A través del poder de las expresiones regulares, permite además reescribir la dirección de forma parcial, almacenando en variables temporales las partes que deseamos conservar. 
```
rewrite ^/number/(\w+) /count/$1;

location ~* /count/[0-9] {
    root /usr/share/nginx/html;
    try_files index.html =404;
}
```
En este ejemplo, usamos la expresión regular de la siguiente forma: Con `^` le indicamos el principio de la cadena. Escribimos hasta donde queremos reescribir y, después, con `()` indicamos la parte de la URI que queremos guardar en una variable. Debemos indicar esa parte también con expresión regular (en este caso, `\w+` indica que se trata de un caracter alfanumérico que aparece una o más veces). Finalmente, el segundo argumento indica el rewrite y, con $1 situamos el valor de la variable que habíamos almacenado.

A continuación, una tabla con expresiones regulares:

|Símbolo|Significado|
|----|-----|
|x| Si indicamos una letra, se trata de la letra misma|
|\t| Tabulación|
|\n| Salto de línea|
|[abc]| Carácter `a`, `b` **o** `c`|
|[^abc] | Cualquier carácter que no sea `a`, `b` **o** `c`|
|[a-zA-Z] Cualquier carácter entre la `a` y la `z` **o** la `A` y la `Z`|
|.| Cualquier carácter |
|^| Principio de línea (no hay nada antes)|
|$| Fin de línea (no hay nada después) |
|\d| Dígito entre 0 y 9 |
|\D| Cualquier cosa menos un dígito entre 0 y 9|
|\s| Carácter de espacio|
|\S| Cualquier cosa menos un espacio|
|\w| Cualquier carácter alfanumérico|
|\W| Cualquier cosa menos un carácter alfanumérico|
|(uno\|dos) | Texto `uno` o texto `dos`

También contamos con las siguientes instrucciones para las expresiones:

|Símbolo|Significado
|--|--
|x?| El símbolo x aparece 0 o 1 vez
|x+| El símbolo x aparece 1 o más veces
|x*| El símbolo x aparece 0 o más veces
|x{n}| El símbolo x aparece n veces (n es un número entero positivo)
|x{n,} El símbolo x aparece al menos n veces
|x{n,m}| El símbolo x aparece entre n y m veces (m también es un número entero positivo)

> **ACTIVIDAD:** Prueba a hacer un redirect primero y después un rewrite. Experimenta con diferentes expresiones regulares.
> * Cualquier cosa que empiece por la palabra `otra` nos dirige a `otrascosas`.
> * Para ir a `/count/[0-9]` podemos hacerlo siempre que el primer argumento del camino (en este caso `count`) sea una palabra que empiece por consonante y solo contenga caracteres alfanuméricos, siendo el mínimo 1 (la consonante inicial) y el máximo 5 (la consonante inicial y 4 caracteres alfanuméricos). Por ejemplo, `/x23z/3` es una dirección válida para el rewrite, pero ``/a23z/3` o `/x23zzz/3` no lo son.

