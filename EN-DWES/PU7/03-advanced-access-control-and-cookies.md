# Advanced User Control and Cookies

## 1. Advanced User Control

### 1.1 Getting the logged-in user

In many cases, to perform an operation in a service or any other component, we will need to know whether there is a logged-in user and, if so, know their name or the permissions they have.

For example, in the employee CRUD, let’s imagine that only an employee could modify their own data: we would need to check whether the logged-in user is the same as the employee we are trying to modify. To do this, we use the `Authentication` object, which contains all the information related to the logged-in user.

In particular, we can obtain their name using the getName() method and, from there, access the user repository to get all their information. It can be very useful to have a method like this:

```java
public Usuario obtenerUsuarioConectado(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(!auth instanceOf AnonymousAuthenticationToken){
                String nombreUsuarioConectado = auth.getName();
                return usuarioRepository.findByNombre(nombreUsuarioConectado);
        }
        return null; //in case it does not enter the if.
}
```

If what we are interested in is only the role of the logged-in user, we have the `getAuthorities` method, which returns a collection with all of the user’s roles. We could iterate over that collection to look for the desired permission. Since in our case, to simplify, we always assign only one role to each user, we can convert that collection to a String and compare it with that role, but using this syntax: `[ROLE_ADMIN], [ROLE_MANAGER], etc`. We can send this data to the client or, in the case of Thymeleaf, process it directly in the view.

### 1.2 Improving the presentation

Once the entire access control process has been implemented, we can make certain improvements such as showing the username, displaying certain sections of the views only to specific user roles, etc.

Thymeleaf provides tags oriented toward security management, but they are found in an additional dependency:

```xml
<dependency>
        <groupId>org.thymeleaf.extras</groupId>
        <artifactId>thymeleaf-extras-springsecurity6</artifactId>
        <version>3.1.2.RELEASE</version>
</dependency>
```

In the initial `<html>` tag we will include its reference:

```html
<html xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity">
```

Once included, we have these options:

* To display the username `sec:authentication="name"`.
* To display a section only to authenticated users `sec:authorize="isAuthenticated()"`.
* To display a section only to a specific role `sec:authorize="hasRole('ADMIN')"` or multiple roles `sec:authorize="hasAnyRole('ADMIN', 'USER')"`.

> **ACTIVITY 1:** In My Favourite Composer, get the logged-in user and improve the presentation:
>
> * Show the logged-in user at all times.
> * On the home page, make the section with links to the user CRUD forms appear only to the administrator.
> * On the home page, make the section with links to the composer and piece CRUD forms appear only to the administrator and editors.
> * On the search pages, make the links to composer or piece information not appear to visitor users.
> * On the composer or piece pages, make the edit options appear only to administrators and editors.

### 1.3. Custom Login and Logout

If we do not want to use the default login and logout forms, we can create our own, keeping in mind that if we customize one, we must customize the other as well. The process would be as follows:

1. Add two new mappings to an existing controller or to a new one. The first will be a GET to the login form route (for example, `/signin`) and will return a view with that form. The second will be a GET to the logout confirmation view (for example, `/signout`). The links to log in and log out in the views will point to these mappings.

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

2. Register those routes in the configuration bean, in the ***formlogin()*** and ***logout()*** sections.

```java
.formLogin(httpSecurityFormLoginConfigurer->
                httpSecurityFormConfigurer
                        .loginPage("signin") //mapping to show login form
                        .loginProcessingUrl("login") //POST route of /signin
                        .failureUrl("/signin?error") //returns to signin with error message
                        .defaultSuccessUrl("/home", true).permitAll()
                ).logout((logout)-> logout
                        .logoutSuccessUrl("/signin?logout").permitAll() //or another url  
                )
```

3. Create the file ***signinView.html*** in `/templates`, which must meet a series of requirements: the form should include a `csrf token`, but Thymeleaf will do this for us. We cannot change the name attribute of the username and password fields. Finally, the destination of the form must be POST:/login. This would be a basic template that we could later customize:

```html
<body>
        <h2>Enter your credentials</h2>
        <div th:if="${param.error}">Incorrect credentials</div>
        <div th:if="${param.logout}">You have logged out</div>
        <form th:action="@{/login}" method="post">
                <input type="text" name="username" placeholder="Username"/><br/>
                <input type="text" name="password" placeholder="Password"/><br/>
                <input type="submit" value="Log in"/>
        </form>
</body>

```

Similarly, to perform logout, the method annotated with `GetMapping("/signout")` will serve a view called ***signoutView.html*** that will offer the user a form to confirm that they want to log out. Submitting this form will take us to /logout via POST, which represents the actual logout. It could be something like this:

```html
<body>
        <h2>Are you sure you want to log out</h2>
        <form th:action="@{logout}" method="post">
                <input type="submit" value="Logout">
        </form>
</body>
```

For the logout operation, we would have another option, which would be to log out directly without going through the confirmation view. With CSRF enabled, the /logout route via POST performs the actual logout, so in the views it would be enough to add the code that performs that POST:

```html
<form th:action="@{logout}" method="post">
        <input type="submit" value="Logout">
</form>
```

When pressing the button, it would return us directly to the page served by the route specified in the configuration bean, specifically in the parameter: logoutSuccessUrl.

> **ACTIVITY 2:** Create a custom login and logout for MyFavouriteComposer.

### 1.4. Other authentication options

#### 1.4.1 User self-registration

For an unauthenticated user to be able to register, we should create a new entry in the main menu, a new controller, and views, all of this similar to user management but more limited, since the assigned role will be the most basic one and the user will not be able to select it. We must grant everyone permission to access this new URL.

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/registro/nuevo/**").permitAll()
        )
}
```

On the other hand, in many cases it will be advisable for the user to provide an email address and for the user to be validated when a confirmation email is sent. We leave this part out of this manual, although the process would be as follows:

1. Add the email address to the Usuario class and a new field of type boolean called "active" or similar. When the user registers, it would have the value false and they would not be able to authenticate.
2. During the registration process, an email would be sent to that address for the user to validate their account. We would have a controller that receives the link sent by email and sets the active field to true, allowing authentication.

Another option would be to have a table of unconfirmed users where they would be stored during the self-registration process. Once the confirmation email is received, the user would be moved to the real users table. This way, we avoid having to take into account the boolean "active" field mentioned in the first point in all operations.

#### 1.4.2 "Remember me" option

Every time a user visits our application that requires authentication, they must log in again, and this can become tedious. The "Remember me" functionality is a mechanism to solve this so that if, once identified, we leave the site without logging out, our credentials will be remembered for a certain time and thus, when we visit the site again, we will not need to log in again. Obviously, this mechanism has security issues if someone else gains access to our browser.

Spring offers two ways to implement this: via cookies or via persistence. In this manual we will only look at the first one. When we authenticate, a cookie called JSESSIONID is normally stored with the data of our session. This cookie expires when the browser is closed. In any case, when we log out of the application, this cookie will no longer work, so it is not necessary to explicitly delete it.

With the additional "Remember me" option, a new cookie will also be stored that has a longer validity than the session (by default two weeks), which will allow us to stay logged in without needing to authenticate again. This cookie obviously stores the username and password, so it can be dangerous if intercepted. All we need to do is add the rememberMe option to the SecurityFilterChain bean:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.headers(
                headersConfigurer -> headersConfigurer
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("...").hasAnyRole(...) //whatever...
                        (...)
                .rememberMe(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults());
                /// COMPLETE AS FOLLOWS
        )
}
```

With just this operation, all the management of the cookie that will remember our logged-in user and their password will be handled. It also automatically modifies the default login form, adding the checkbox that the user must check if they want their credentials to be saved. If we have developed a custom login form, we must add this checkbox ourselves, and its name property must be as shown below:

```html
<input type='checkbox' name='remember-me' />Remember me on this computer
```

To view cookies in Google Chrome, open the developer tools (Ctrl + Shift + I) and in the Application tab, in the side menu, Storage >> Application >> Cookies.

> **ACTIVITY 3:** Implement user self-registration and the "Remember me" option in MyFavouriteComposer. Check that the cookies are correct.

> **AMPLIATION ACTIVITY:** Implement confirmation of registered users.

#### 1.4.3 "I forgot my password" option

Another aspect that may be interesting to incorporate into our system is an option to reset the password in case it is forgotten. The most common way to do this is by sending an email to the user with a link to set a new password. Obviously, we must incorporate this new data, the email address, into the user registration process. We are not going to develop it, but you can consult it in the following sources:

* [https://www.baeldung.com/spring-security-registration-i-forgot-my-password](https://www.baeldung.com/spring-security-registration-i-forgot-my-password)
* [https://stackabuse.com/spring-security-forgot-password-functionality/](https://stackabuse.com/spring-security-forgot-password-functionality/)

> **AMPLIATION ACTIVITY:** Implement the "I forgot my password" option.

## 2 Cookies

As we have seen in the previous sections, authentication in the application is carried out using cookies, but in a way that is transparent to us, with spring-security being responsible for managing the entire process, including the cookies involved. In addition to this functionality, cookies have many uses in our applications.

### 2.1. What cookies are

A cookie is a small text file that is stored in our browser by a website when we visit it. We can have one cookie per website and per browser. The different browsers on our computer do not share their cookies. If we have user profiles within the browser, different profiles will also have different cookies; otherwise, all users of the same computer will share cookies in each browser.

Cookies can contain information for different purposes, the most important being:

* User authentication, as we have already seen.
* Storing user preferences: for example, if we have selected the website language, the currency in which to display products, etc.
* Browser state: for example, saving the products in the shopping cart so that they are available on the next visit.
* Management of certain security aspects.

Regarding the use of cookies to store user preferences or browser state, we should make a clarification: if a user has registered on our website, cookies are not so necessary because we can store in the database all the information provided by them during their visit to the site, and it will always be available whenever that user authenticates, regardless of the device or browser they use. But what happens with visitors to our site who do not register and from whom we want to store information about their visit? That is where cookies are the best option: we store the chosen preferences in the browser, and they will be available in future visits.

### 2.2. Reading cookies

To read a cookie in the backend, we have the `@CookieValue` annotation. This should be included in the signature of the controller method that receives the URL. The parameter must be of type String, since cookies always contain text, and the value attribute of the annotation will contain the name of the cookie.

```java
@GetMapping("/")
public String readCookie(@CookieValue(value="nombreCookie", required=false) String nombreCookie){
        //whatever
}
```

If the cookie is not received and we have not set `required=false`, an exception will occur. By indicating it, in our case, if the cookie is not received, the parameter will simply take the value `null`.

### 2.3. Adding cookies

To send a cookie to the user’s browser, we can use the Cookie class, through which we will create it and configure its main characteristics. Then, using the addCookie method of HttpServletResponse, it will be added to the user response.

The constructor of the Cookie class receives two parameters of type String: the first will be the name that the cookie will have in the browser, and the second is the value assigned to that cookie.

The HttpServletResponse object must be injected into the controller method that will send the cookie.

```java
@GetMapping("/addCookie")
public String addCookie(HttpServletResponse response){
        Cookie cookie = new Cookie("myCookie", "value");
        response.addCookie(cookie);
        return "indexView";
}
```

### 2.4. Cookie expiration

Cookies have a specific lifetime. If nothing else is specified, the cookie remains in the user’s browser as long as the user does not close the browser, which is known as a "session cookie".

If we want to change this behavior, to specify how long the cookie will last, we can do so using the setMaxAge method of the Cookie class. Through this setter, we indicate the lifetime of the cookie in seconds.

```java
Cookie cookie = new Cookie("myCookie", "value");
cookie.setMaxAge(7 * 24 * 60 * 60); //7 days x 24 hours x 60 minutes x 60 seconds
response.addCookie(cookie);
```

To delete a cookie from the server, we can send the same cookie, with the same parameters, but with a value of zero in the setMaxAge method.

### 2.5. Other cookie parameters

Just like expiration, we can configure other aspects of cookies using methods of the Cookie class, such as:

* `setSecure(true)`: we make the cookie secure, so that it is only transmitted through the encrypted HTTPS protocol.
* `setHttpOnly(true)`: prevents attacks on cookies in the browser, so that the cookie in question is not accessible from JavaScript. It can only be accessed from the server.
* `setPath("/url")`: by default, a cookie is only sent to the client when the same URL where it was created is visited in the browser. With setPath, we change this behavior so that it is sent when URLs that start with the path indicated as a parameter are visited. For example, `setPath("/")` would send the cookie on all requests.

> **ACTIVITY 4:** In MyFavouriteComposer, create the following cookies and check in the browser that they behave correctly:
>
> * Implement a light mode and a dark mode, activated by a button in the header of all views. Create a cookie that remembers the choice in the browser.
>   - Cookie 1: Make it a "session cookie" and send it on /index.
>   - Cookie 2: Make it last one minute and send it on /index.
>   - Cookie 3: Add a view that deletes the cookie.
>   - Cookie 4: Make it be sent on all pages of the website.
