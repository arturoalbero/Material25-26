# Gestión de usuarios avanzada y Cookies

## 1. Gestión de usuarios avanzada

### 1.1 Obtener el usuario conectado

En muchos casos, para realizar una operación en un servicio o en cualquier otro componente, necesitaremos saber si hay un usuario conectado y, en caso afirmativo, saber su nombre o los permisos que tiene.

Por ejemplo, en el CRUD de empleados, imaginemos que solo pudiese modificar los datos de un empleado ese mismo empleado: habría que comprobar si el usuario conectado es igual al empleado que tratamos de modificar. Para ello utilizamos el objeto `Authentication` que contiene toda la información relativa al usuario conectado.

En particular, podemos obtener su nombre con el método getName() y, a partir de ahí, acceder al repositorio de usuarios para obtener toda su información. Puede ser muy interesante tener un método como este:

```java
public Usuario obtenerUsuarioConectado(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(!auth instanceOf AnonymousAuthenticationToken){
                String nombreUsuarioConectado = auth.getName();
                return usuarioRepository.findByNombre(nombreUsuarioConectado);
        }
        return null; //en caso de que no haya entrado en el if.
}
```

Si lo que nos interesa es solo el rol del usuario conectado, disponemos del método `getAuthorities` que devuelve una colección con todos los roles del mismo. Podríamos recorrer esa colección para buscar el permiso deseado. Como en nuestro caso, para simplificar, siempre estamos asignado a cada usuario un solo rol podemos pasar esa colección a String y compararla con ese rol, pero con esta sintaxis: `[ROLE_ADMIN], [ROLE_MANAGER],etc`. Estos datos los podemos enviar al cliente o, en caso de Thymeleaf, tratarlos directamente en la vista.

### 1.2 Mejorando la presentación

Una vez implementado todo el proceso de control de acceso podemos realizar ciertas mejoras como mostrar el nombre de usuario, mostrar ciertas zonas de las vistas solo a determinados roles de usuario, etc.

Thymeleaf posee etiquetas orientadas a la gestión de la seguridad, pero se encuentran en una dependencia adicional:
```xml
<dependency>
        <groupId>org.thymeleaf.extras</groupId>
        <artifactId>thymeleaf-extras-springsecurity6</artifactId>
        <version>3.1.2.RELEASE</version>
</dependency>
```
En la etiqueta incial <html> incluiremos su referencia:
```html
<html xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity">
```
Una vez incluida disponemmos de estas opciones:
- Para mostrar el nombre de usuario `sec:authentication="name"`.
- Para mostrar una sección solo a usuarios autentificados `sec:authorize="isAuthenticated()"`
- Para mostrar una sección solo a un determinado rol `sec:authorize="hasRole('ADMIN')"` o varios roles `sec:authorize="hasAnyRole('ADMIN', 'USER')"`.

> **ACTIVIDAD 1:** En My Favourite Composer Obtén el usuario conectado y mejora la presentación:
> - Muestra el usuario conectado en todo momento.
> - En la página de inicio, haz que la sección con los enlaces a los formularios para el CRUD de usuarios solo le aparezcan al administrador.
> - En la página de inicio, haz que la sección con los enlaces a los formularios para los CRUD de compositores y piezas le aparezcan solo al administrador y a los editores.
> - En las páginas de búsqueda, haz que los enlaces a la información de los compositores o piezas no le aparezcan a los usuarios visitantes.
> - En las páginas de compositores o piezas, haz que las opciones para editar solo le aparezcan a los administradores y a los editores.

### 1.3. Login y Logout personalizados

Si no queremos usar los formularios de login y logout por defecto, podríamos crear unos propios, teniendo en cuenta que si personalizamos uno debemos personalizar el otro también. El proceso sería el siguiente:

1. Añadir dos nuevos mappings a un controlador existente o en uno nuevo. El primero será por GET hacia la ruta del formulario de login (por ejemplo, `/signin`) y devolverá una vista con dicho formulario. El segundo será un GET hacia la vista de confirmación de desconexión (por ejemplo, `/signout`). Los enlaces para conectarse y desconectarse en las vistas apuntarán a estos mappings.
```java
@GetMapping("/signin")
public String showLogin(){
        return "signinView";
}
@GetMapping("/signout")
public String showLogout(){
        return "signoutView";
}
```

2. Registrar esas rutas en el bean de configuración, en la sección ***formlogin()*** y ***logout()***.
```java
.formLogin(httpSecurityFormLoginConfigurer->
                httpSecurityFormConfigurer
                        .loginPage("signin") //mapping para mostrar form de login
                        .loginProcessingUrl("login") //ruta post de /signin
                        .failureUrl("/signin?error") //vuelve a signin con mensaje de error
                        .defaultSuccessUrl("/home", true).permitAll()
                ).logout((logout)-> logout
                        .logoutSuccessUrl("/signin?logout").permitAll() //u otra url  
                )
```

3. Crear en `/templates` el archivo ***signinView.html*** que debe cumplir una serie de restricciones: el formulario debería incluir un `token csrf` pero Thymeleaf lo hará por nosotros. No podemos cambiar el atributo name del username y password. Finalmente, el destino del formulario debe ser por POST:/login. Esta sería una plantilla básica que luego podríamos personalizar:
```html
<body>
        <h2>Introduce tus credenciales</h2>
        <div th:if="${param.error}">Credenciales incorrectas</div>
        <div th:if="${param.logout}">Te has desconectado </div>
        <form th:action="@{/login}" method="post">
                <input type="text" name="username" placeholder="Username"/><br/>
                <input type="text" name="password" placeholder="Password"/><br/>
                <input type="submit" value="Log in"/>
        </form>
</body>

```

Análogamente, para hacer logout, el método anotado con GetMapping("/signout") servirá una vista llamada ***signoutView.html*** que ofrecerá al usuario un formulario para que confirme que desea desconectarse. El submit de este formulario nos llevará a /logout por POST, que representa la desconexión real. Podría ser algo así:
```html
<body>
        <h2>¿Estás seguro de que quieres desconectarte</h2>
        <form th:action="@{logout}" method="post">
                <input type="submit" value="Logout">
        </form>
</body>
```
Para la operación de logout tendríamos otra opción, que sería hacer la desconexión directamente sin pasar por la vista de confirmación. Con csfr activado, la ruta /logout mediante POST realiza la desconexión efectiva, por lo que, en las vistas, bastaría con añadir el código que hiciese ese POST:
```html
<form th:action="@{logout}" method="post">
        <input type="submit" value="Logout">
</form>
```

Al pulsar el botón, nos devolvería directamente a la página servida por la ruta especificada en el bean de configuración, concretamente en el parámetro: logoutSuccessUrl.

> **ACTIVIDAD 2:** Crea un login y un logout personalizados para MyFavouriteComposer.


### 1.4. Otras opciones de autenticación

#### 1.4.1 Autorregistro de usuarios

Para que un usuario no identificado pueda registrarse, deberíamos crear una nueva entrada en el meníu principal, un nuevo controlador y vistas, todo ello similar a la gestión de usuarios, pero más limitados, ya que el rol asignado será el más básico, no lo podrá seleccionar el usuario. Debemos dar permisos a todo el mundo para acceder a esta nueva URL.
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/registro/nuevo/**").permitAll()
        )
}
```
Por otra parte, en muchos casos será aconsejable que el usuario proporcione una dirección de correo electrónico y que se valide el usuario cuando se envíe un email de confirmación. Dejamos esta parte fuera de este manual, aunque el proceso sería el siguiente:
1. Añadir a la clase Usuario la dirección de correo electrónico y un nuevo campo, de tipo boolean, llamado "activo" o similar. Cuando el usuario se registrase tendría valor false y no podría autenticarse.
2. En el proceso de alta se enviaría a esa dirección un email para que validase el usuario. Tendríamos un controlador que recibiese el enlace enviado al correo y que pasase a true el campo activo, para permitir autenticación.

Otra opción sería tener una tabla de usuarios no confirmados donde se almacenarían en el proceso de autorregistro. Una vez recibido el email de confirmación, el usuario pasaría a la tabla real de usuarios. Así evitamos tener en cuenta en todas las operaciones ese campo boolean "activo" del que hablamos en el primer punto.

#### 1.4.2 Opción "recuérdame"

Cada vez que un usuario visita nuestra aplicación que requiere autentificación debe iniciar de nuevo sesión y esto puede llegar a ser tedioso. La funcionalidad "Recuérdame" es un mecanismo para resolver esto de forma que si, una vez identificados, abandonamos el sitio sin cerrar sesión, nuestras credenciales serán recordadas por cierto tiempo y así, al volver a visitar el sitio, no necesitaremos identificarnos de nuevo. Obviamente, este mecanismo tiene problemas de seguridad en caso de que alguien ajeno acceda a nuestro navegador.

Spring ofrece dos vías de implementarlo: mediante cookies o mediante persistencia. En este manual vamos a ver solo la primera. Al autentificarnos, normalmente se almacena una cookie llamada JSESSIONID con los datos de nuestra sesión. Esta cookie expira al cerrar el navegador. De todas formas, cuando cerramos sesión en la aplicación, esta cookie ya no funcionará por lo que no es necesario borrarla explícitamente.

Con la opción "Recuérdame" adicionalmente se almacenará una nueva cookie que tiene una vigencia superior a la de la sesión (por defecto dos semanas) que nos permitirá seguir logueados sin necesidad de autentificarnos de nuevo. Esta cookie obviamente guarda el usuario y la contraseña, por lo que puede ser peligroso si es interceptada. Lo único que debemos hacer es añadir al bean SecurityFilterChain la opción rememberMe:
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.headers(
                headersConfigurer -> headersConfigurer
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("...").hasAnyRole(...) //lo que sea...
                        (...)
                .rememberMe(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults());
                /// COMPLETAR COMO SIGUE
        )
}
```

Con solo esta operación se hará toda la gestión de la cookie que recordará nuestro usuario loguado y su contraseña. También modifica automáticamente el formulario de login por defecto, añadiéndole el checkbox que debe marcar el usuario si quiere que guarde sus credenciales. Si hemos desarrollado un formulario de login personalizado, debemos añadirle nosotros mismos ese checkbox y su propiedad name debe ser tal y como se muestra a continuación:
```html
<input type='checkbox' name='remember-me' />Remember me on this computer
```
Para ver las cookies desde Google Chrome, accedemos a las herramientas para desarrolladores (Ctrl + Shift + I) y en la pestaña aplicación, en el menú lateral, Storage >> Application >> Cookies.

> **ACTIVIDAD 3:** Implementa en MyFavouriteComposer el autorregistro de usuarios y la opción "recuérdame". Comprueba que las cookies son correctas.

> **AMPLIACIÓN:** Implementa la confirmación de usuarios registrados.

#### 1.4.3 Opción "He olvidado mi contraseña"

Otro aspecto que puede ser interesante incorporar a nuestro sistema es una opción para restablecer la contraseña en caso de olvido. La forma más habitual de hacer esto es enviando un email a usuario con un enlace para establecer la nueva contraseña. Obviamente, debemos incorporar este nuevo dato, la dirección de email, en el proceso de registro de usuarios. No lo vamos a desarrollar, pero puedes consultarlo en las siguientes fuentes:

- https://www.baeldung.com/spring-security-registration-i-forgot-my-password 
- https://stackabuse.com/spring-security-forgot-password-functionality/ 

> **AMPLIACIÓN:** Implementa la opción "He olvidado mi contraseña".

## 2 Cookies

Como hemos visto en los apartados anteriores, la autentificación en la aplicación se realiza mediante cookies, pero de una forma transparente para nosotros, siendo spring-security el encargado de gestionar todo el proceso, incluyendo las cookies involucradas en el mismo. Además de esta funcionalidad, las cookies tienen multitud de usos en nuestras aplicaciones.

### 2.1. Qué son las cookies

Una cookie es un pequeño archivo de texto que es almacenado en nuestro navegador por un sitio web cuando lo visitamos. Podremos tener una cookie por cada sitio web y por cada navegador. Los distintos navegadores de nuestro ordenador no comparten sus cookies. Si tenemos perfiles de usuario dentro del navegador, también distintos perfiles tendrán distintas cookies, en caso contrario, todos los usuarios del mismo ordenador compartirán cookies en cada navegador.

Las cookies pueden contener información para distintos propósitos, siendo estos los más importantes:
* Autentificación de usuarios, como ya hemos visto.
* Guardar preferencias del usuario: por ejemplo, si hemos seleccionado el idioma del sitio web, la moneda en la que visualizar los productos, etc.
* Estado del navegador: por ejemplo, guardar los productos del carrito de la compra para que estén disponibles en la siguiente visita.
* Gestión de ciertos aspectos de seguridad.

En cuanto al uso de las cookies para guardar las preferencias de usuario o el estado del navegador, debemos hacer una puntualización: si un usuario se ha registrado en nuestro sitio web, las cookies no son tan necesarias porque podemos almacenar en la base de datos toda la información aportada por él en su visita al sitio y estará disponible siempre que ese usuario se autentifique, independientemente del dispositivo o navegador desde el que lo haga. Pero, ¿qué ocurre con los visitantes de nuestro sitio que no se registran y de los que queremos guardar información sobre su visita? Ahí es donde las cookies son la mejor opción: guardamos en el navegador las preferencias elegidas y estas estarán disponibles en futuras visitas.

### 2.2. Lectura de cookies

Para leer una cookie en el backend disponemos de la anotación `@CookieValue`. Esta se debe incluir en la firma del método del controlador que recibe la URL. El parámetro debe ser de tipo String, ya que las cookies siempre contienen texto y el atributo value de la anotación contendrá el nombre de la cookie.
```java
@GetMapping("/")
public String readCookie(@CookieValue(value="nombreCookie", required=false) String nombreCookie){
        //lo que sea
}
```

Si no se recibe la cookie y no hemos puesto `required=false`, se produce una excepción. Al indicarlo, en nuestro caso en caso de no recibir una cookie el parámetro simplemente toma el valor `null`.

### 2.3. Añadir cookies

Para enviar una cookie al navegador del usuario podemos emplear la clase Cookie mediante la que la crearemos y configuraremos sus características principales. Luego, mediante el método addCookie de HttpServletResponse, se añadirá a la respuesta de usuario.

El constructor de la clase Cookie recibe dos parámetros de tipo String, el primero será el nombre que tendrá la cookie en el navegador y el segundo es el valor asignado a dicha cookie.

El objeto de tipo HttpServletResponse ha de inyectarse en el método del controlador que enviará la cookie.

```java
@GetMapping("/addCookie")
public String addCookie(HttpServletResponse response){
        Cookie cookie = new Cookie("myCookie", "value");
        response.addCookie(cookie);
        return "indexView";
}
```

### 2.4. Expiración de cookies

Las cookies tienen un tiempo de vida determinado. Si no se especifica lo contrario, la cookie permanece en el navegador del usuario mientras el usuario no cierre el navegador, y es lo que se conoce como "cookie de sesión".

Si se quiere cambiar este comportamiento, para especificar cuanto durará la cookie, se puede hacer mediante el método setMaxAge de la clase Cookie. Mediante este setter se indican los segundos de vida de la misma.
```java
Cookie cookie = new Cookie("myCookie", "value");
cookie.setMaxAge(7 * 24 * 60 * 60); //7 días x 24 horas x 60 minutos x 60 segundos
response.addCookie(cookie);
```
Para borrar una cookie desde el servidor, podemos enviar la misma cookie, con los mismos parámetros, pero con valor cero en el método setMaxAge.

### 2.5. Otros parámetros de las cookies

Al igual que la expiración, podemos configurar otros aspectos de las cookies mediante métodos de la clase Cookie, como por ejemplo:
* `setSecure(true)`: convertimos la cookie en segura, de forma que solo se transmite a través del protocolo encriptado HTTPS.
* `setHttpOnly(true)`: previene ataques a las cookies en el navegador, de forma que la cookie en cuestión no es accesible desde JavaScript. Solo se puede acceder a ella desde el servidor.
* `setPath("/url")`: por defecto, una cookie solo se envía al cliente cuando en el navegador se visita la misma URL en la que se creó. Con setPath cambiamos este comportamiento para que se envíe cuando se visiten URL que comiencen por la ruta indicada como parámetro. Por ejemplo, `setPath("/")` enviaría la cookie en todas sus peticiones.

> **ACTIVIDAD 4:** En MyFavouriteComposer, crea las siguientes cookies y comprueba en el navegador que se comportan de forma adecuada:
> - Implementa un modo claro y un modo oscuro, activables mediante un botón en la cabecera de todas las vistas. Haz una cookie que recuerde la decisión en el navegador.
>       - Cookie 1: Haz que sea una "cookie de sesión" y se envíe en /index.
>       - Cookie 2: Haz que dure un minuto y se envíe en /index.
>       - Cookie 3: Añade una vista que elimine la cookie.
>       - Cookie 4: Haz que se envíe en todas las páginas de la web. 

