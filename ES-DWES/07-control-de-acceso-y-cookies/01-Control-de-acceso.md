# Control de acceso

## 1. Autentificación y autorización

Entendemos por control de acceso tanto la **autentificación** (*quién eres*) como la **autorización**(*qué puedes hacer*). En cuanto a la autentificación, tendremos que encargarnos de distintas tareas como es el registro de usuarios, el proceso de login y logout de los mismos, etc. Una vez que un usuario esté identificado en la aplicación, tendremos que gestionar sus permisos.

Otro concepto a tener en cuenta es de **rol**. Los roles son agrupaciones de permisos comunes a varios usuarios. Roles típicos son los usuarios registrados sin más, usuarios con más privilegios o usuarios con todos los privilegios, conocidos normalmente como administradores. Así, hablaremos de roles como USER, MANAGER, ADMIN, etc. y cada usuario tendrá asignado uno de estos roles o incluso varios de ellos.

Una forma sencilla de trabajar consistirá en establecer para cada ruta de mapping de controlador qué roles y, por tanto, qué usuarios pueden acceder a esa ruta. Podremos incluso discriminar con qué verbo HTTP puede acceder y con cuál no.

## 2. Sesiones

El protocolo HTTP es un protocolo sin estados, por lo que, cuando se envía una petición, no se recuerda nada de las anteriores. Esto representa un problema para la autentificación de usuarios, ya que al navegar por una aplicación que requiera estar identificados, deberíamos estar enviando nuestro usuario y contraseña en cada petición. Para solucionar esta situación están las sesiones.

Una sesión es un mecanismo que permite conservar información sobre un usuario al pasar de una petición a otra dentro de un mismo sitio web. Los datos referentes a esa sesión se almacenan en el servidor. El cliente almacenará sus datos de sesión, generalmente en una ***cookie***, y es esa cookie lo que se enviará en cada petición. Al llegar al servidor la petición, se compara el identificador de sesión que le llega en la ***cookie*** con la sesión guardada en el propio servidor, y así se autentifica al usuario en cada petición.

> **¿SABÍAS QUÉ...**: El origen del término ***cookie*** se remonta a la década de 1990, cuando el programador Lou Montulli, trabajando para Netscape, desarrolló esta tecnología para solucionar problemas en un carrito de compras virtual. 
> 
> El término "***cookie***" proviene del concepto de "galleta mágica" (magic cookie) en el lenguaje de programación Unix, que se refería a un fragmento de datos que se enviaba y devolvía sin cambios entre programas.
>
> Esta idea se inspiró en las galletas de la fortuna (fortune cookies), que contienen un mensaje oculto dentro. Al igual que estas galletas, las cookies informáticas llevan información escondida que permite al servidor identificar al usuario y personalizar su experiencia en línea.

Cuando se cierre la sesión se elimina la información de esa sesión en el servidor, por lo que esa cookie no tendrá validez ya.

Este modelo es válido para las aplicaciones web clásicas, como las que desarrollamos con Spring MVC, pero cuando hablemos de API REST usaremos otros métodos como JWT(JSON Web Token), ya que el método convencional no servirá.

## 3. Configuración básica

Spring framework possee un módulo llamado **Spring Security** que se encarga de todos los aspectos de seguridad y control de acceso de nuestras aplicaciones. Es un módulo muy amplio, tanto en securización ante posibles ataques como en el tratamiento del control de acceso.

Para incluir Spring Security en un proyecto Spring Boot basta con incorporar la dependencia starter-security en el archivo pom.xml.
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifcactId>spring-boot-starter-security</artifactId>
</dependency>
```

Por solo incluir la dependencia, sin ninguna configuración adicional, de manera predeterminada obtendremos los siguientes beneficios:
- **Previene distintos tipos de ataques** [**CSRF**](https://www.youtube.com/watch?v=eWEgUcHPle0).
- **Protege el acceso a la aplicación**, impidiendo que ningún usuario no identificado pueda invocar a cualquier ruta de los métodos de nuestros controladores y por tanto acceder a la aplicación.
- **Genera un formulario de login** en la ruta: /login y una página de logout en la ruta /logout.
- **Registra un filtro** llamado springSecurityFilterChain que se encarga de proteger las contraseñas, redirigir al formulario de login cuando es necesario, etc.

Bastaría entonces con añadir en el archivo `application.properties` las dos lineas siguientes para que solo el usuario indicado pudiese acceder a la aplicación.
```sh
spring.security.user.name = user
spring.security.user.password =1234
```

Cuando el usuario intente acceder a cualquier URL de la aplicación, Spring Boot y el Security Filter de HTTP redirigirán al usuario al formulario de identificación /login, donde solicitará al usuario que inserte su nombre y contraseña para proceder. Este formulario se crea de forma automática.

> **ACTIVIDAD 1:** Implementa Spring Security dentro de la aplicación My Favourite Composer. Comprueba la autenticación.

Este mecanismo tan restrictivo podría ser suficiente para pequeñas aplicaciones monousuario donde solo se necesita restringir el acceso de forma general, pero queda muy reducido en aplicaciones en que hay secciones accesibles al público general y otras protegidas.

Para comenzar a configurar la seguridad, eliminaremos las dos líneas anteriores de `application.properties` y crearemos una clase anotada con `@EnableWebSecurity` y `@EnableMethodSecurity` con la configuración deseada. Podemos crearla en cualquier punto debajo del paquete raíz, pero lo habitual será tenerla en el paquete `security` o `config`.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
        @Bean
        public UserDetailsService users(PasswordEncoder passwordEncoder) {
                UserDetails user = User.builder()
                                .username("user1")
                                .password(passwordEncoder.encode("1234"))
                                .roles("USER")
                                .build();
                return new InMemoryUserDetailsManager(user);
```
Este sería un primer ejemplo, con una sencilla autentificación de usuarios en memoria, con un solo usuario `user1`, que tendría un rol básico llamado `USER` y una contraseña encriptada `1234`. Más adelante sustituiremos los usuarios en memoria por usuarios reales en base de datos.

Debemos fijarnos en que creamos tres beans para controlar la seguridad:

* AuthenticationManager
* PassWordEncoder
* UserDetailsService

Podemos sustituir el UserDetailsService por otro que añada dos usuarios, el user1 actual y añadir un nuevo usuario y rol (admin1 / ADMIN):

```java
        @Bean
        public UserDetailsService users(PasswordEncoder passwordEncoder) {
                UserDetails user = User.builder()
                                .username("user1")
                                .password(passwordEncoder.encode("1234"))
                                .roles("USER")
                                .build();

                UserDetails admin = User.builder()
                                .username("admin1")
                                .password(passwordEncoder.encode("1234"))
                                .roles("USER", "ADMIN")
                                .build();
                return new InMemoryUserDetailsManager(user, admin);
        }
```
Ahora vendría la parte más interesante, en la que indicamos el comportamiento de acceso de las distintas rutas de los mappings de nuestros controladores y, por tanto, definimos quién puede acceder a qué parte de la aplicación. Lo haremos en el mismo archivo, en un nuevo bean llamado SecurityFilterChain:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http)
                throws Exception {
        http.headers(
                headersConfigurer -> headersConfigurer
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));

                http.authorizeHttpRequests(auth -> auth.requestMatchers("/", "/list").permitAll()            
                        .requestMatchers("/nuevo/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers("/editar/**", "/borrar/**").hasRole("ADMIN")
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations())
                        .permitAll() // para rutas: /css, /js /images
                        // .requestMatchers("/h2-console/**").hasRole("ADMIN")
                        .requestMatchers(PathRequest.toH2Console()).hasRole("ADMIN")
                        .requestMatchers("/**").permitAll() // por id, findByName...
                        .anyRequest().authenticated())
                        .formLogin(formLogin -> formLogin
                                .defaultSuccessUrl("/", true)
                                .permitAll())
                        .logout(logout -> logout
                                .permitAll())
                        // .csrf(csrf -> csrf.disable())
                        .csrf(csrf -> csrf
                                .ignoringRequestMatchers(AntPathRequestMatcher.antMatcher("/h2-console**")))
                        .httpBasic(Customizer.withDefaults());
                http.exceptionHandling(exceptions -> exceptions.accessDeniedPage("/accessError"));
                return http.build();
        }
}
```

> **NOTA:** Resulta muy complejo a simple vista, ya que tiene una gran cantidad de llamadas a métodos anidadas. Sin embargo, es más sencillo y mecánico de lo que parece a priori, y casi siempre se manejan los mismos métodos por lo que, con un poco de práctica, es fácil de mecanizar. Aparte, siempre cuentas con [**la documentación oficial**](https://docs.spring.io/spring-security/reference/index.html) para poder consultarla en cualquier momento.

Se puede configurar de distintas formas, pero esta sería la más sencilla. Para ello usamos el método requestMatchers, al que pasaremos como parámetro la ruta o rutas sobre las que gestiona su acceso y, a continuación, indicar quién tiene permiso: permitAll(), hasRole(ROLE), etc.
* `requestMatchers("/").permitAll()`: acceso público a la ruta raíz.
* `requestMatchers("nuevo/**").hasRole("USER")`: acceso a la ruta /new a aquellos usuarios autentificados y con rol "USER". Los dos asteriscos `/**` indican que se extienden esos permisos a las subrutas debajo de la ruta indicada, por ejemplo /new/submit.
* `requestMatchers("/editar/**", "/borrar/**").hasRole("ADMIN")`: acceso a la ruta /editar y derivadas, así como a /borrar y derivadas solo a administradores.
* Después de los requestMatchers incluimos una sola vez anyRequest() para indicar quién tiene acceso al resto de rutas, las no indicadas en los requestMatchers, en este caso, solo a usuarios autentificados(podría ser permitAll() para que fuesen públicas).
* A continuación, permitimos el acceso a las rutas que gestionan la autentificación y desconexión a todo el público.
* En la última línea (exceptionHandling) indicamos la ruta a la que redirigimos a los usuarios que no tengan permisos suficientes para acceder a algún determinado punto de la aplicación. Debemos añadir entonces un método en un controlador con @GetMapping("/accessError") con su tratamiento.
* En este ejemplo solo hemos incluido las rutas, pero requestMatchers admite un formato en el que también se le pase el verbo HTTP sobre le que queremos trabajar:
```java
.requestMatchers(HttpMethod.POST, "/path").denyAll();
```
* Finalmente, en las vista de la aplicación deberemos incluir los enlaces para login y logout. Los controladores y vistas para estos enlaces los genera Spring Security por nosotros:
```html
<a th:href="@{/login}">Login</a> | <a th:href="@{/logour}">Logout</a>
```
A tener en cuenta:
* Las reglas de los requestMatchers se evalúan por orden: en cuanto una ruta encaja, se determinan sus permisos en función de esa línea y ya no se evalúan las siguientes, por lo que es importante el orden en que se sitúan. Si la primera incluyera un `/**`, no se evaluaría ninguna subruta.
* Hay que tener cuidado de no repetir la misma ruta en dos requestMatchers, ya que solo se tendría en cuenta el primero.
* Ya que Spring sigue esta forma de securizar las aplicaciones, sería interesante repensar las rutas que le damos a los mappings de los controladores para agruparlos según su acceso. Por ejemplo, sería muy cómodo que todas las rutas de acceso público sin registrarse estuviesen bajo una misma ruta, por ejemplo /public, así podríamos usar /public/** para todas ellas.
* Si una ruta tiene PathVariable sería una subruta de la ruta base, ya que el sistema no puede distinguirlo.

> **ACTIVIDAD 2:** Usando el método anterior, implementa la seguridad de la aplicación My Favorite Composer con varios roles, USER y ADMIN, de tal forma que solo el ADMIN pueda añadir, actualizar o borrar contenido, y solo el USER pueda consultarlo. Todos los usuarios podrán acceder a la página de inicio. Agrupa las direcciones para gestionarlo de la manera más sencilla posible.

## 4. Gestión de usuarios

En una aplicación, lo habitual es que haya distintos usuarios y que estos se creen dinámicamente y sean almacenados en una tabla de base de datos.

Para hacer una gestión de usuarios mediante base de datos, lo primero que debemos hacer es decidir qué perfiles o roles de usuarios tendremos en la aplicación y a qué rutas accederán cada uno de ellos. Los pasos a seguir serían:

1. Debemos tener una clase SecurityConfig como vimos en el ejemplo anterior, pero eliminando el bean UserDetails, ya que es sustituido por el componente que crearemos más adelante y basado en los usuarios de base de datos. Seguiremos incluyendo los requestMatchers.
2. Debemos guardar en base de datos, para cada usuario, los atributos para la gestión de acceso: serían un nombre de acceso, una contraseña y los datos referentes a los permisos que tiene el usuario. Para ello, podemos crear una clase específica con esos datos o bien ampliar la clase que mantiene los usuarios de la aplicación añadiendo, además de todos los atributos que necesite para el correcto funcionamiento de la aplicación, los atributos mencionados.
```java
@Entity
public class Usuario{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nombre;
    private String password;
    private Rol rol; //usaremos un enum para definir los roles. Existe una clase llamada Role, pero es más sencillo así.
}
```
3. Tenemos que crear un bean que implemente la interfaz ***UserDetailsService*** wue se encarga de la gestión del usuario que se identifica en la aplicación. Esta clase deberá implementar el método loadUserByUserName(String username) de la interfaz, que devuelve un objeto de tipo UserDetails. En caso de error, lanza una excepción UserNameNotFoundException.

Consideramos que disponemos de los elementos necesarios para el CRUD de usuarios: vistas, controlador con RequestMapping("/usuarios"), servicio y repositorio, incluyendo este último el método derivado por nomnbre: findByNombre(String nombre).

```java
@Component
public class UserDetailsServiceImpl implements UserDetailsService{
        @Autowired
        private UsuarioRepository usuarioRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
                Usuario usuario = usuarioRepository.findByNombre(username);

                if (usuario == null) throw (new UsernameNotFoundException("Usuario no encontrado"));
                return User.withUsername(username)
                        .roles(usuario.getRol()).toString()
                        .password(usuario.getPassword())
                        .build();
        }
}
```

4. En el formulario de alta de usuarios habrá que añadir una contraseña y uno de los roles predefinidos. Debemos verificar que el nombre es único (o el atributo que hayamos elegido como identificador en cuanto a seguridad se refiere). Podríamos introducir la contraseña en dos campos del formulario distintos y comprobar que los dos campos son iguales, pero esto sería más una tarea de front end que de back end.

También debemos encriptar la contraseña y, para ello, usaremos el passwordEncoder definido en la clase de configuración de seguridad.
```java
public Usuario addUser(Usuario usuario){
        if(usuarioRepositorio.findByNombre(usuario.getNombre()) != null) return null;
        String passCrypted = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passCrypted);
        return usuarioRepositorio.save(usuario);
}
```
El control de duplicados también se puede hacer a nivel de base de datos. Podemos emplear varias formas, la más sencilla sería añadir `@Column(unique = true)` al atributo en cuestión en la entidad Usuario y controlando mediante try..catch la excepción ***DataIntegrityViolationException*** que se produciríoa en caso de introducir el duplicado.
```java
public Usuario addUser(Usuario usuario){
        String passCrypted = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passCrypted);
        try{
                return usuarioRepositorio.save(usuario);
        }catch(DataIntegrityViolationException e){
                e.printStackTrace();
                return null;
        }
}
```
5. En la edición de usuario también hay que verificar que, si se cambia el nombre, que el nuevo nombre no esté duplicado tampoco:
```java
public Usuario editar(Usuario usuario){
        String passCrypted = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passCrypted);
        try{
                return usuarioRepositorio.save(usuario);
        }catch(DataIntegrityViolationException e){
                e.printStackTrace();
                return null;
        }
}
```

6. Opcionalmente, el cambio de contraseña puede desligarse del proceso de edición, por lo que sería recomendable hacer un dto para la edición, que no incluyese la contraseña, y otro específico para el cambio de contraseña. Además, como la contraseña está encriptada en la base de datos, en los formularios de edición no se traslada a la vista, como ocurre con el resto de campos.

7. Si queremos que la gestión de usuarios pueda ser realizada solo por usuarios con rol de administrador, tenemos que restringir las rutas del controlador de usuario.

8. Para poder iniciar la aplicación, es necesario tener un primer usuario con rol de administrador. Lo haríamos en el CommandLineRunner.

9. Por último, decir que Spring ofrece muchos otros medios de autenticación, por ejemplo, por LDAP, mediante usuario de Google, etc.

> **ACTIVIDAD 3:** A partir de My Favourite composer, configura la seguridad de la siguiente forma:
> - Crea una enumeración que contenga los tres roles que tendremos en el sistema: administrador, editor y el resto de usuarios identificados.
> - Crea una entidad Usuario (con id autogenerado, nombre sin repetidos y contraseña de mínimo 4 caracteres, así como el rol). También deberás crear la implementación de la interfaz UserDetailService.
> - En la vista de inicio, crea un enlace para la gestión de usuarios, botón de login y logout.
> - Los permisos de cada rol son los siguientes:
>       - **Administrador**: Acceso total a la aplicación. Hará falta tener un primer usuario  de tipo administrador creado por defecto para poder acceder a ese CRUD.
>       - **Editor**: Tiene acceso total al CRUD de compositores y piezas, pero no al de usuarios.
>       - **Usuario**: Tiene acceso a toda la información de los compositores y las piezas
>       - **Visitante**: Solo tiene acceso al inicio y a los listados obtenidos mediante búsqueda, pero no a la información de cada compositor o pieza.

