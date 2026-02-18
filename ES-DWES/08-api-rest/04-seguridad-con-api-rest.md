# Seguridad en API REST

Como comentamos al principio de este tema, el modelo de sesión con cookies es válido para webs orientadas a navegadores, como las que desarrollamos con Spring MVC. Cuando hablamos de API REST, debemos ser capaces de dar respuesta a distintos tipos de clientes y muchos de ellos no trabajarán con cookies. Para este tipo de aplicaciones existen otros métodos como JWT (JSON Web Token) o OAuth2. Vamos a trabajar con la primera opción

## 1. JSON Web Token

Cuando un usuario se identifica, en vez de crear una sesión, el servidor genera un token y se lo envía al cliente. Dicho cliente, en las sucesivas peticiones que haga al servidor, adjuntará dicho token. Para almacenar el token en el cliente, dependerá del tipo de dispositivo y aplicación. Generalmente, el token se envía en la cabecera de la petición.

> **SABÍAS QUE...** en informática, un **token** es una **unidad básica de información**, una pieza mínima que representa información útil dentro de un sistema. Según el contexto, puede significar:
>
> * **Seguridad:** un código o clave digital que sirve para autenticar a un usuario (por ejemplo, un token de acceso en una API como los de JWT).
> * **Programación:** un elemento mínimo con significado dentro del código, como una palabra clave, un número o un símbolo (como la palabra `where`).
> * **Inteligencia artificial:** una pequeña porción de texto (palabra o fragmento de palabra) que un modelo procesa para entender o generar lenguaje.

Al llegar cualquier petición, el servidor validará que el token recibido corresponde con el enviado inicialmente y procederá a enviar la respuesta. El token no securiza los datos, no los encripta, solo garantiza el origen de los datos. Ante un ataque de tipo Man in the middle se podría obtener información del usuario, para evitar esto deberíamos emplear encriptado HTTPS.

No vamos a entrar en detalle, pero diremos que un JWT se compone de tres partes: **header**, con la identificación y algoritmo empleado para generar el token; **payload**, con el contenido del token formado por datos propios como la fecha de expiración  del token y los datos de usuario; y **signature**, firma o hash obtenido al codificar el token.

## 2. Configuración JWT en el proyecto API REST

Para securizar una aplicación API REST mediante JWT debemos seguir varios pasos, algunos comunes a los de las aplicaciones Spring MVC, pero otros diferentes, referentes a la construcción y la validación del token JWT. Vamos a describirlos paso a paso sobre un proyecto genérico con varios perfiles que dispondrán de diversos niveles de acceso a los endpoints de la API.

En los recursos complementarios se encuentra el código fuente del proyecto que se describe a continuación y **puede servir de base para la realización de cuaqluier otro**. Partimos de la entidad Usuario, base para la autenticación:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "nombre"),
    @UniqueConstraint(columnNames = "email")
})
public class Usuario {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Size(max = 20)
  private String nombre;

  @NotBlank
  @Size(max = 50)
  @Email
  private String email;

  @NotBlank
  private String password;

  private Rol rol;
}

```

Y su repositorio:
```java
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Usuario findByNombre(String nombre);

  Boolean existsByNombre(String nombre);

  Boolean existsByEmail(String email);
}
```
Estos serían los pasos a seguir, suponiendo que ya tenemos una entidad Usuario, con atributos mostrados previamente.

1. Incorporar la dependencia `starter-security` en el archivo `pom.xml`, al igual que en Spring MVC y, adicionalmente, tres dependencias `jsonwebtoken`.
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

2. Crear la clase SecurityConfig en la que se crean todos los beans necesarios.
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Autowired
  UserDetailsService userDetailsService;

  @Autowired
  private AuthEntryPointJwt authEntryPointJwt;

  @Bean
  public AuthTokenFilter authenticationJwtTokenFilter() {
    return new AuthTokenFilter();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPointJwt))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/test/all").permitAll()
            .requestMatchers("/api/test/user").hasAnyRole("USER", "MANAGER", "ADMIN")
            .requestMatchers("/api/test/manager").hasAnyRole("MANAGER", "ADMIN")
            .requestMatchers("/api/test/admin").hasAnyRole("ADMIN"));
    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    http.cors(Customizer.withDefaults());
    return http.build();
  }
}

```
Recordemos que requestMarchers admite también que se le pase el verbo HTTP sobre el que queremos trabajar.
```java
.requestMatchers(HttpMethod.POST, "/path").denyAll()
```
3. Crear las clases que implementan UserDetailsService y UserDetails, que gestionan el usuario que está conectado en este momento. La primera clase accede al repositorio de usuarios de la aplicación. Para simplificarlo, vamos a considerar que cada usuario tiene un solo rol.
```java
//UserDetailsServiceImpl.java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  @Autowired
  UsuarioRepository usuarioRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String nombre) throws UsernameNotFoundException {
    Usuario usuario = usuarioRepository.findByNombre(nombre);
    if (usuario == null)
      throw new UsernameNotFoundException("Usuario no encontrado: " + nombre);
    return UserDetailsImpl.build(usuario);
  }

}

```
```java
//UserDetailsImpl.java
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")

public class UserDetailsImpl implements UserDetails {
  private Long id;

  private String username;

  private String email;

  @JsonIgnore
  private String password;

  private Collection<? extends GrantedAuthority> authorities;

  public static UserDetailsImpl build(Usuario user) {
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRol().name()));
    return new UserDetailsImpl(
        user.getId(),
        user.getNombre(),
        user.getEmail(),
        user.getPassword(),
        authorities);
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}

```
4. Debemos crear las clases AuthEntryPointJwt, AuthTokenFilter y JwtUtils para la gestión del token en la que fijamos todos sus parámetros.

```java
//AuthEntryPointJwt
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

  private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
      throws IOException, ServletException {
    logger.error("Unauthorized error: {}", authException.getMessage());

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

    final Map<String, Object> body = new HashMap<>();
    body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
    body.put("error", "Unauthorized");
    body.put("message", authException.getMessage());
    body.put("path", request.getServletPath());

    final ObjectMapper mapper = new ObjectMapper();
    mapper.writeValue(response.getOutputStream(), body);
  }

}
```
```java
//AuthTokenFilter
public class AuthTokenFilter extends OncePerRequestFilter {
  @Autowired
  private JwtUtils jwtUtils;

  @Autowired
  private UserDetailsServiceImpl userDetailsService;

  private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      String jwt = parseJwt(request);
      if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
        String username = jwtUtils.getUserNameFromJwtToken(jwt);

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
    } catch (Exception e) {
      logger.error("Cannot set user authentication: {}", e);
    }

    filterChain.doFilter(request, response);
  }

  private String parseJwt(HttpServletRequest request) {
    String headerAuth = request.getHeader("Authorization");

    if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
      return headerAuth.substring(7);
    }

    return null;
  }
}
```
```java
//JwtUtils
@Component
public class JwtUtils {
  private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
  private String jwtSecret = "abc123==abc123==abc123==abc123==abc123==abc123==abc123==abc123==abc123==abc123==abc123==abc123==";
  private int jwtExpirationMs = 86400000;

  public String generateJwtToken(Authentication authentication) {

    UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

    return Jwts.builder()
        .setSubject((userPrincipal.getUsername()))
        .setIssuedAt(new Date())
        .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
        .signWith(key(), SignatureAlgorithm.HS256)
        .compact();
  }

  private Key key() {
    return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
  }

  public String getUserNameFromJwtToken(String token) {
    return Jwts.parserBuilder().setSigningKey(key()).build()
        .parseClaimsJws(token).getBody().getSubject();
  }

  public boolean validateJwtToken(String authToken) {
    try {
      Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
      return true;
    } catch (MalformedJwtException e) {
      logger.error("Invalid JWT token: {}", e.getMessage());
    } catch (ExpiredJwtException e) {
      logger.error("JWT token is expired: {}", e.getMessage());
    } catch (UnsupportedJwtException e) {
      logger.error("JWT token is unsupported: {}", e.getMessage());
    } catch (IllegalArgumentException e) {
      logger.error("JWT claims string is empty: {}", e.getMessage());
    }
    return false;
  }
}

```
5. La aplicación tendrá tres clases dto para la gestión de usuarios
```java
//LoginDTO con los datos con los que el usuario se identifica en la app
@Getter
@Setter
public class LoginDto {
	@NotBlank
	private String nombre;

	@NotBlank
	private String password;
}
```
```java
//SingupDto con los datos de registro de usuario
@Getter
@Setter

public class SignupDto {
  @NotBlank
  @Size(min = 3, max = 20)
  private String nombre;

  @NotBlank
  @Size(max = 50)
  @Email
  private String email;

  private String rol;

  @NotBlank
  @Size(min = 6, max = 40)
  private String password;

}
```
```java
//JwtResponseDto son los datos que se envían al cliente cuando se ha validad correctamente
//el usuario y contraseña y se ha permitido el acceso
@Data
@AllArgsConstructor

public class JwtResponseDto {
  private String accessToken;
  private String tokenType;     // "Bearer"
  private Long id;
  private String nombre;
  private String email;
  private String rol;
}

```
Hay que fijarse en el primer atributo de esta clase, además de todos los datos del usuario, se envía el token que tendrá que ser añadido a todas las peticiones siguientes.

6. Los roles pueden ser entidades con su propio repositorio implementando un CRUD sobre el mismo o, de forma más sencilla, una simple enumeración:
```java
public enum Rol {USER, MANAGER, ADMIN}
```
7. Debemos crear el controlador que se encargará tanto del registro de usuarios /singup como del login de los mismos /signin. No crearemos controlador para logout, ya que la sesión finaliza al expirar el token.
```java
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UsuarioRepository usuarioRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDto loginDto) {

    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(loginDto.getNombre(), loginDto.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);
    String jwt = jwtUtils.generateJwtToken(authentication);

    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    String rol = userDetails.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("ERROR");

    return ResponseEntity.ok(new JwtResponseDto(jwt, "Bearer",
        userDetails.getId(),
        userDetails.getUsername(),
        userDetails.getEmail(),
        rol));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupDto signUpRequest) {
    if (usuarioRepository.existsByNombre(signUpRequest.getNombre())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Ya existe un usuario con ese nombre"));
    }

    if (usuarioRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Ya existe un usuario con ese email"));
    }

    // Create new user's account
    Usuario user = new Usuario(null, signUpRequest.getNombre(),
        signUpRequest.getEmail(),
        encoder.encode(signUpRequest.getPassword()),
        Rol.valueOf(signUpRequest.getRol()));
    usuarioRepository.save(user);
    return ResponseEntity.ok(new MessageResponse("Usuario registrado correctamente"));
  }
}
```
8. Habría que añadir a la aplicación los controladores y servicios con la lógica de negocio. Un ejemplo de prueba podría ser este:
```java
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {
  @GetMapping("/all")
  public String showContentForAll() {
    return "{\"contenido\":\"Contenido público\"}";    //formato JSON
  }

  @GetMapping("/user")
  public String showContentForUsers() {
    return "{\"contenido\":\"Contenido para usuarios\"}";  //formato JSON
  }

  @GetMapping("/manager")
  public String showContentForManager() {
    return "{\"contenido\":\"Contenido para managers\"}";  //formato JSON
  }

  @GetMapping("/admin")
  public String showContentForAdmins() {
    return "{\"contenido\":\"Contenido para administradores\"}";  //formato JSON
  }
}
```
9. Para completar el proyecto necesitaríamos la clase User y su repositorio UserRepository, la clase MessageResponse y la configuración de CORS.
```java
@Getter
@Setter
@AllArgsConstructor
public class MessageResponse{
    private String message;
}
```
En capítulos anteriores ya habíamos hablado de la configuración CORS, pero permitíamos cualquier tipo de tráfico. En este momento aún no tenemos desplegada la aplicación cliente, por lo que no podemos limitar el origen de las peticiones, pero sí podemos restringir los verbos HTTP permitidos y el tipo de peticiones:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("Content-Type", "Authorization", "Origin", "Accept");
            }
        };
    }
}
```

> **ACTIVIDAD 1:** Implementa JWT en la versión API REST de MyFavouriteComposer. Utiliza Postman (u otra aplicación equivalente) para probarlo.
> - Registro de un nuevo usuario, usando el DTO correspondiente.
> - Login con dicho usuario (devuelve el token asignado y debemos incluirlo en las siguientes peticiones)
> - Petición a zona restringida, añadiendo en el campo Authorization el token, precedida de la petición Bearer y un espacio en blanco.
> - Regenera el token en caso de que haya expirado, para que el cliente pueda seguir trabajando sin tener que enviar sus credenciales de nuevo.

## 3. Acceso desde el cliente con autentificación JWT

Mostramos, a modo de ejemplo, como se consumiría desde JavaScript una API con una autentificación previa mediante JWT. Emplearemos la técnica de fetch con async/await. El primer paso sería la función de autentificación que recibiría un usuario y contraseña y devolvería el token JWT.
```javascript
async function api_signin(loginURL, username, pass) {
  const credenciales = {
    nombre: username,
    password: pass
  };
  try {
    const response = await fetch(BASE_URL + loginURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credenciales),
    });
    if (!response.ok) {
      const textErr = await response.text();
      throw new Error(textErr);
    }
    const { accessToken } = await response.json();
    return accessToken;
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return false;
  }
}
```
Una vez recibido el token, éste deberá ser guardado (bien como variable global en el script, bien en LocalStorage, etc) e incorporarlo en las siguientes peticiones al servidor. Ponemos como ejemplo lo que sería una modificación de un recurso (PUT) de tipo empleado a través de su id:
```javascript
async function api_put(putURL, id, data, token) {
  try {
    const response = await fetch(BASE_URL + putURL + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const textErr = await response.text();
      throw new Error(textErr);
    }
    return true;
  } catch (error) {
    console.error('Error al modificar datos:', error);
    return false;
  }
}
```

> **ACTIVIDAD 2:** Realiza una pequeña aplicación de cliente usando javascript para poder realizar las mismas pruebas que hiciste en la actividad 1.

## 4. Seguridad en una aplicación mixta con MVC y API REST

En este capítulo hemos visto como securizar una aplicación API REST mediante JWT. En el anterior habíamos visto cómo hacer lo mismo en una aplicación MVC basándonos en sesiones del navegador. Para llevar a cabo este proceso de securización en una aplicación que tenga una parte MVC con vistas y Thymeleaf, así como otra parte con endpoints de tipo API REST, podemos seguir el siguiente proceso:

1. Las URL de la parte MVC y API deben estar claramente delimitadas. Una forma sencilla de hacerlo es que todas las rutas de la API comiencen por `/api`.
2. Tanto para una parte como para la otra debemos seguir todos los pasos tal cual se han explicado en sus respectivas secciones.
3. La clase UserDetailImpl no se implementa igual. Debemos usar la forma que hemos visto en este capítulo, ya que es válida para ambos esquemas.
4. Una de las diferencias más notables entre ambos esquemas es el contenido del bean `SecurityFilterChain` definido en la clase `SecurityConfig`. La solución para estas aplicaciones mixtas será crear dos beans distintos, indicando sobre el referente a API REST las URL a las que afecta, que serán las que comiencen por `/api` según comentamos en el primer punto de este apartado.

**Recuerda consultar los códigos de los proyectos añadidos en la unidad**. Para este punto son relevantes el 0912, el 0913 y el 0914.

> **ACTIVIDAD 3:** Integra la aplicación Spring MVC y la aplicación API REST de MyFavouriteComposer. Puedes hacer que las api empiecen por rutas con `/api` para que no haya colisiones entre los controladores. Gestiona la seguridad de forma híbrida. No hace falta que cambies nada más de la parte MVC ni de la parte API REST (excepto las URI en caso de colisión).

> **ACTIVIDAD DE AMPLIACIÓN:** Integra la aplicación Spring MVC y la aplicación API REST de MyFavouriteComposer. La diferencia con la actividad anterior es que, ahora, la parte MVC debe consumir la API para obtener la información.


