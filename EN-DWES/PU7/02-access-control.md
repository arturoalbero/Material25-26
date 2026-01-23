# Access Control

## 1. Authentication and Authorization

By access control we mean both **authentication** (*who you are*) and **authorization* (*what you can do*). Regarding authentication, we will have to handle different tasks such as user registration, the login and logout process, etc. Once a user is identified in the application, we will need to manage their permissions.

Another concept to take into account is the **role**. Roles are groupings of permissions common to several users. Typical roles are regular registered users, users with more privileges, or users with all privileges, usually known as administrators. Thus, we will talk about roles such as USER, MANAGER, ADMIN, etc., and each user will have one or even several of these roles assigned.

A simple way to work is to establish, for each controller mapping route, which roles and therefore which users can access that route. We can even distinguish which HTTP verb can be used to access it and which cannot.

## 2. Sessions

The HTTP protocol is stateless, which means that when a request is sent, nothing is remembered about previous ones. This represents a problem for user authentication, since when browsing an application that requires identification, we would need to send our username and password with every request. Sessions are used to solve this situation.

A session is a mechanism that allows information about a user to be preserved from one request to another within the same website. The data related to that session is stored on the server. The client will store its session data, generally in a ***cookie***, and that cookie is what will be sent with each request. When the request reaches the server, the session identifier received in the ***cookie*** is compared with the session stored on the server itself, and thus the user is authenticated on each request.

> **DID YOU KNOW...**: The origin of the term ***cookie*** dates back to the 1990s, when programmer Lou Montulli, working for Netscape, developed this technology to solve problems in a virtual shopping cart.
>
> The term "***cookie***" comes from the concept of a "magic cookie" in the Unix programming language, which referred to a piece of data that was sent and returned unchanged between programs.
>
> This idea was inspired by fortune cookies, which contain a hidden message inside. Like these cookies, computer cookies carry hidden information that allows the server to identify the user and personalize their online experience.

When the session is closed, the information for that session is deleted on the server, so that cookie will no longer be valid.

This model is valid for classic web applications, such as those we develop with Spring MVC, but when we talk about REST APIs we will use other methods such as JWT (JSON Web Token), since the conventional method will not work.

## 3. Basic Configuration

The Spring framework has a module called **Spring Security** that handles all aspects of security and access control for our applications. It is a very broad module, both in securing against possible attacks and in handling access control.

To include Spring Security in a Spring Boot project, it is enough to add the starter-security dependency to the pom.xml file.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifcactId>spring-boot-starter-security</artifactId>
</dependency>
```

By simply including the dependency, without any additional configuration, by default we will obtain the following benefits:

* **Prevents different types of attacks** [**CSRF**](https://www.youtube.com/watch?v=eWEgUcHPle0).
* **Protects access to the application**, preventing any unauthenticated user from invoking any route of our controller methods and therefore accessing the application.
* **Generates a login form** at the route: /login and a logout page at the route /logout.
* **Registers a filter** called springSecurityFilterChain that is responsible for protecting passwords, redirecting to the login form when necessary, etc.

It would then be enough to add the following two lines to the `application.properties` file so that only the specified user could access the application.

```sh
spring.security.user.name = user
spring.security.user.password =1234
```

When the user tries to access any URL of the application, Spring Boot and the HTTP Security Filter will redirect the user to the identification form /login, where they will be asked to enter their username and password to proceed. This form is created automatically.

> **ACTIVITY 1:** Implement Spring Security within the My Favourite Composer application. Check authentication.

This very restrictive mechanism may be sufficient for small single-user applications where access only needs to be restricted in a general way, but it is very limited in applications where there are sections accessible to the general public and others that are protected.

To start configuring security, we will remove the previous two lines from `application.properties` and create a class annotated with `@EnableWebSecurity` and `@EnableMethodSecurity` with the desired configuration. We can create it anywhere below the root package, but it is usually placed in the `security` or `config` package.

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

This would be a first example, with simple in-memory user authentication, with a single user `user1`, who would have a basic role called `USER` and an encrypted password `1234`. Later we will replace in-memory users with real users stored in a database.

We should note that we create three beans to control security:

* AuthenticationManager
* PassWordEncoder
* UserDetailsService

We can replace the UserDetailsService with another one that adds two users, the current user1 and a new user and role (admin1 / ADMIN):

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

Now comes the most interesting part, where we indicate the access behavior of the different routes of our controller mappings and therefore define who can access which part of the application. We will do this in the same file, in a new bean called SecurityFilterChain:

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
                        .permitAll() // for routes: /css, /js /images
                        // .requestMatchers("/h2-console/**").hasRole("ADMIN")
                        .requestMatchers(PathRequest.toH2Console()).hasRole("ADMIN")
                        .requestMatchers("/**").permitAll() // by id, findByName...
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

> **NOTE:** It looks very complex at first glance, since it has a large number of nested method calls. However, it is simpler and more mechanical than it initially appears, and almost always the same methods are used, so with a bit of practice it is easy to get used to. Besides, you can always rely on [**the official documentation**](https://docs.spring.io/spring-security/reference/index.html) to consult it at any time.

It can be configured in different ways, but this would be the simplest one. To do this, we use the requestMatchers method, to which we pass as a parameter the route or routes whose access we want to manage, and then indicate who has permission: permitAll(), hasRole(ROLE), etc.

* `requestMatchers("/").permitAll()`: public access to the root route.
* `requestMatchers("nuevo/**").hasRole("USER")`: access to the /new route for authenticated users with the "USER" role. The two asterisks `/**` indicate that these permissions extend to subroutes below the indicated route, for example /new/submit.
* `requestMatchers("/editar/**", "/borrar/**").hasRole("ADMIN")`: access to the /editar route and its derivatives, as well as /borrar and its derivatives, only for administrators.
* After the requestMatchers we include anyRequest() only once to indicate who has access to the rest of the routes, those not indicated in the requestMatchers, in this case only authenticated users (it could be permitAll() to make them public).
* Next, we allow access to the routes that handle authentication and logout to the general public.
* In the last line (exceptionHandling) we indicate the route to which we redirect users who do not have sufficient permissions to access a certain part of the application. We must then add a method in a controller with @GetMapping("/accessError") to handle it.
* In this example we have only included routes, but requestMatchers also supports a format in which the HTTP verb we want to work with is also passed:

```java
.requestMatchers(HttpMethod.POST, "/path").denyAll();
```

* Finally, in the application views we must include the links for login and logout. The controllers and views for these links are generated by Spring Security for us:

```html
<a th:href="@{/login}">Login</a> | <a th:href="@{/logour}">Logout</a>
```

Things to keep in mind:

* The requestMatchers rules are evaluated in order: as soon as a route matches, its permissions are determined based on that line and the following ones are not evaluated, so the order in which they are placed is important. If the first one included a `/**`, no subroute would be evaluated.
* Care must be taken not to repeat the same route in two requestMatchers, since only the first one would be taken into account.
* Since Spring follows this way of securing applications, it would be interesting to rethink the routes we give to controller mappings in order to group them according to access. For example, it would be very convenient if all public access routes without registration were under the same path, for example /public, so we could use /public/** for all of them.
* If a route has a PathVariable, it would be a subroute of the base route, since the system cannot distinguish it.

> **ACTIVITY 2:** Using the previous method, implement the security of the My Favorite Composer application with several roles, USER and ADMIN, in such a way that only ADMIN can add, update, or delete content, and only USER can view it. All users will be able to access the home page. Group the addresses to manage it in the simplest possible way.

## 4. User Management

In an application, it is usual to have different users, and for them to be created dynamically and stored in a database table.

To manage users through a database, the first thing we must do is decide which user profiles or roles we will have in the application and which routes each one will be able to access. The steps to follow would be:

1. We must have a SecurityConfig class as we saw in the previous example, but removing the UserDetails bean, since it is replaced by the component we will create later and based on database users. We will continue including requestMatchers.
2. We must store in the database, for each user, the attributes for access management: a login name, a password, and the data related to the permissions the user has. To do this, we can create a specific class with this data or extend the class that maintains the users of the application by adding, in addition to all the attributes it needs for the correct functioning of the application, the mentioned attributes.

```java
@Entity
public class Usuario{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nombre;
    private String password;
    private Rol rol; // we will use an enum to define the roles. There is a class called Role, but this is simpler.
}
```

3. We have to create a bean that implements the ***UserDetailsService*** interface, which is responsible for managing the user who logs into the application. This class must implement the loadUserByUserName(String username) method of the interface, which returns an object of type UserDetails. In case of error, it throws a UserNameNotFoundException.

We assume that we have the necessary elements for user CRUD: views, a controller with RequestMapping("/usuarios"), service and repository, including in the latter the derived-by-name method: findByNombre(String nombre).

```java
@Component
public class UserDetailsServiceImpl implements UserDetailsService{
        @Autowired
        private UsuarioRepository usuarioRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
                Usuario usuario = usuarioRepository.findByNombre(username);

                if (usuario == null) throw (new UsernameNotFoundException("User not found"));
                return User.withUsername(username)
                        .roles(usuario.getRol()).toString()
                        .password(usuario.getPassword())
                        .build();
        }
}
```

4. In the user creation form, we will need to add a password and one of the predefined roles. We must verify that the name is unique (or the attribute we have chosen as the identifier from a security standpoint). We could enter the password in two different form fields and check that both fields are equal, but this would be more of a front-end task than a back-end one.

We must also encrypt the password, and to do this we will use the passwordEncoder defined in the security configuration class.

```java
public Usuario addUser(Usuario usuario){
        if(usuarioRepositorio.findByNombre(usuario.getNombre()) != null) return null;
        String passCrypted = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passCrypted);
        return usuarioRepositorio.save(usuario);
}
```

Duplicate checking can also be done at the database level. We can use several approaches; the simplest would be to add `@Column(unique = true)` to the attribute in question in the Usuario entity and handle the ***DataIntegrityViolationException*** exception via try..catch, which would be thrown in case of inserting a duplicate.

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

5. When editing a user, we must also verify that if the name is changed, the new name is not duplicated either:

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

6. Optionally, password changes can be separated from the editing process, so it would be advisable to create a DTO for editing that does not include the password, and another specific one for password changes. In addition, since the password is encrypted in the database, it is not passed to the view in edit forms, as happens with the rest of the fields.

7. If we want user management to be performed only by users with the administrator role, we must restrict the routes of the user controller.

8. In order to start the application, it is necessary to have a first user with the administrator role. We would do this in the CommandLineRunner.

9. Finally, note that Spring offers many other authentication methods, for example via LDAP, using a Google user, etc.

> **ACTIVITY 3:** Starting from My Favourite Composer, configure security as follows:
>
> * Create an enumeration that contains the three roles we will have in the system: administrator, editor, and the rest of identified users.
> * Create a Usuario entity (with autogenerated id, non-duplicated name, and a password of at least 4 characters, as well as the role). You must also create the implementation of the UserDetailService interface.
> * In the home view, create a link for user management, and login and logout buttons.
> * The permissions for each role are as follows:
>   - **Administrator**: Full access to the application. It will be necessary to have a first administrator-type user created by default in order to access that CRUD.
>   - **Editor**: Has full access to the CRUD of composers and pieces, but not to users.
>   - **User**: Has access to all information about composers and pieces.
>   - **Visitor**: Only has access to the home page and to listings obtained through search, but not to the information of each composer or piece.
