# REST API Security

As we mentioned at the beginning of this topic, the session model with cookies is valid for browser-oriented websites, such as those we develop with Spring MVC. When we talk about REST APIs, we must be able to respond to different types of clients, and many of them will not work with cookies. For this type of application there are other methods such as JWT (JSON Web Token) or OAuth2. We will work with the first option.

## 1. JSON Web Token

When a user authenticates, instead of creating a session, the server generates a token and sends it to the client. That client, in subsequent requests to the server, will attach that token. How the token is stored on the client depends on the type of device and application. Generally, the token is sent in the request header.

> **DID YOU KNOW...** in computing, a **token** is a **basic unit of information**, a minimal piece that represents useful information within a system. Depending on the context, it can mean:
>
> * **Security:** a digital code or key used to authenticate a user (for example, an access token in an API such as JWT).
> * **Programming:** a minimal element with meaning within the code, such as a keyword, a number, or a symbol (like the word `where`).
> * **Artificial intelligence:** a small portion of text (a word or part of a word) that a model processes to understand or generate language.

When any request arrives, the server will validate that the received token matches the one originally sent and will proceed to send the response. The token does not secure the data or encrypt it; it only guarantees the origin of the data. In a Man-in-the-Middle attack, user information could be obtained. To avoid this, HTTPS encryption should be used.

We will not go into detail, but a JWT consists of three parts: **header**, with the identification and algorithm used to generate the token; **payload**, with the token content formed by data such as the token expiration date and user data; and **signature**, a signature or hash obtained by encoding the token.

## 2. JWT Configuration in the REST API Project

To secure a REST API application using JWT, we must follow several steps, some common to Spring MVC applications and others different, related to building and validating the JWT token. We will describe them step by step using a generic project with several profiles that will have different access levels to the API endpoints.

In the supplementary resources you will find the source code of the project described below, which **can serve as a basis for developing any other**. We start from the Usuario entity, which is the basis for authentication:

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

And its repository:

```java
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Usuario findByNombre(String nombre);

  Boolean existsByNombre(String nombre);

  Boolean existsByEmail(String email);
}
```

These would be the steps to follow, assuming we already have a Usuario entity with the attributes shown previously.

1. Add the `starter-security` dependency in the `pom.xml` file, as in Spring MVC, and additionally three `jsonwebtoken` dependencies.

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

2. Create the SecurityConfig class where all required beans are defined.

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

Remember that requestMatchers also allows specifying the HTTP verb to work with.

```java
.requestMatchers(HttpMethod.POST, "/path").denyAll()
```

3. Create the classes that implement UserDetailsService and UserDetails, which manage the currently authenticated user. The first class accesses the application’s user repository. For simplicity, we will assume each user has only one role.

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
      throw new UsernameNotFoundException("User not found: " + nombre);
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
  public boolean isAccountNonExpired() { return true; }

  @Override
  public boolean isAccountNonLocked() { return true; }

  @Override
  public boolean isCredentialsNonExpired() { return true; }

  @Override
  public boolean isEnabled() { return true; }
}
```

4. Create the classes AuthEntryPointJwt, AuthTokenFilter, and JwtUtils to manage the token and define all its parameters.

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

5. The application will have three DTO classes for user management.

```java
//LoginDTO with the data the user uses to identify themselves in the app
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
//SignupDto with user registration data
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
//JwtResponseDto contains the data sent to the client after successful validation
//of the username and password and access has been granted
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

Note the first attribute of this class: in addition to all user data, the token is sent and must be included in all subsequent requests.

6. Roles can be entities with their own repository implementing CRUD operations or, more simply, a basic enumeration:

```java
public enum Rol {USER, MANAGER, ADMIN}
```

7. Create the controller responsible for both user registration (/signup) and login (/signin). We will not create a logout controller because the session ends when the token expires.

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
          .body(new MessageResponse("Error: A user with that name already exists"));
    }

    if (usuarioRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: A user with that email already exists"));
    }

    // Create new user's account
    Usuario user = new Usuario(null, signUpRequest.getNombre(),
        signUpRequest.getEmail(),
        encoder.encode(signUpRequest.getPassword()),
        Rol.valueOf(signUpRequest.getRol()));
    usuarioRepository.save(user);
    return ResponseEntity.ok(new MessageResponse("User registered successfully"));
  }
}
```

8. Controllers and services with business logic must be added to the application. A simple test example could be:

```java
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {
  @GetMapping("/all")
  public String showContentForAll() {
    return "{\"content\":\"Public content\"}";
  }

  @GetMapping("/user")
  public String showContentForUsers() {
    return "{\"content\":\"Content for users\"}";
  }

  @GetMapping("/manager")
  public String showContentForManager() {
    return "{\"content\":\"Content for managers\"}";
  }

  @GetMapping("/admin")
  public String showContentForAdmins() {
    return "{\"content\":\"Content for administrators\"}";
  }
}
```

9. To complete the project we would need the User class and its UserRepository, the MessageResponse class, and CORS configuration.

```java
@Getter
@Setter
@AllArgsConstructor
public class MessageResponse{
    private String message;
}
```

In previous chapters we discussed CORS configuration, but allowed any traffic. Since the client application is not yet deployed, we cannot restrict request origins, but we can restrict allowed HTTP verbs and request types:

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

> **ACTIVITY 1:** Implement JWT in the REST API version of MyFavouriteComposer. Use Postman (or another equivalent application) to test it.
>
> * Register a new user using the corresponding DTO.
> * Log in with that user (returns the assigned token, which must be included in subsequent requests).
> * Request a restricted area, adding the token in the Authorization field, preceded by the word Bearer and a space.
> * Regenerate the token if it has expired so the client can continue working without sending credentials again.

## 3. Client Access with JWT Authentication

As an example, here is how a JavaScript client would consume an API that requires prior JWT authentication. We will use the fetch technique with async/await. The first step is the authentication function, which receives a username and password and returns the JWT token.

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
    console.error('Error retrieving data:', error);
    return false;
  }
}
```

Once the token is received, it must be stored (for example as a global variable or in LocalStorage) and included in subsequent requests to the server. Below is an example of modifying an employee resource (PUT) by ID:

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
    console.error('Error modifying data:', error);
    return false;
  }
}
```

> **ACTIVITY 2:** Create a small client application using JavaScript to perform the same tests as in Activity 1.

## 4. Security in a Mixed Application with MVC and REST API

In this chapter we have seen how to secure a REST API application using JWT. In the previous one we saw how to do the same in an MVC application based on browser sessions. To secure an application that has both an MVC part (with views and Thymeleaf) and a REST API part, we can follow this process:

1. The MVC and API URLs must be clearly separated. A simple approach is to have all API routes start with `/api`.
2. For both parts, follow all the steps explained in their respective sections.
3. The UserDetailImpl class is not implemented the same way. We must use the approach shown in this chapter, as it works for both schemes.
4. One of the most notable differences between both schemes is the content of the `SecurityFilterChain` bean defined in `SecurityConfig`. The solution for mixed applications is to create two different beans, specifying for the REST API bean the URLs it applies to (those starting with `/api`).

**Remember to review the project code provided in the unit**. For this point, projects 0912, 0913, and 0914 are relevant.

> **ACTIVITY 3:** Integrate the Spring MVC application and the REST API application of MyFavouriteComposer. You can make the APIs start with `/api` routes to avoid controller collisions. Manage security in a hybrid way. No other changes are required for either the MVC part or the REST API part (except URI changes if collisions occur).

> **AMPLIATION ACTIVITY:** Integrate the Spring MVC application and the REST API application of MyFavouriteComposer. The difference from the previous activity is that now the MVC part must consume the API to obtain the information.
