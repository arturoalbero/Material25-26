Perfecto 💪 — usar **Spring Boot** es una decisión excelente:
es moderno, ligero, funciona con **Tomcat embebido**, se **empaqueta fácilmente en Docker** y se **despliega sin complicaciones en Koyeb**.
Además, cubre perfectamente todos los criterios del resultado de aprendizaje.

Te propongo entonces desarrollar el **tema completo del RA3** centrado en **Spring Boot**, con enfoque práctico y coherente con NGINX, Docker y Koyeb.

---

## 🧩 Tema:

### **Despliegue de una aplicación web Spring Boot en un servidor de aplicaciones embebido (Tomcat) mediante Docker y publicación en la nube (Koyeb)**

---

### 🎯 Objetivo general

Implantar una aplicación web desarrollada con Spring Boot en un servidor de aplicaciones embebido (Tomcat), configurando su funcionamiento seguro y desplegándola en un entorno virtualizado con Docker y en la nube (Koyeb).

---

## 🧱 Estructura del tema

---

### **1. Introducción a los servidores de aplicaciones y a Spring Boot**

* Qué es un servidor de aplicaciones (Tomcat, GlassFish, WildFly...)
* Diferencia entre servidor web y servidor de aplicaciones.
* Ventajas de Spring Boot:

  * Tomcat embebido (no necesita WAR ni instalación aparte)
  * Configuración automática
  * Producción lista con `java -jar`
* Estructura básica de una app Spring Boot:

  * `src/main/java` → código
  * `src/main/resources` → configuración (`application.properties`)
  * `pom.xml` o `build.gradle` → dependencias y plugins

**Evalúa:** a), b)

---

### **2. Creación de una aplicación web con Spring Boot**

**Actividad práctica: “Hola Mundo con Spring Boot”**

1. Crear proyecto con Spring Initializr ([https://start.spring.io](https://start.spring.io))

   * Dependencias: *Spring Web*, *Thymeleaf* (opcional)
2. Ejemplo de controlador:

   ```java
   @RestController
   public class HelloController {
       @GetMapping("/")
       public String hello() {
           return "Hola desde Spring Boot y Tomcat embebido!";
       }
   }
   ```
3. Ejecutar:

   ```bash
   mvn spring-boot:run
   ```

   o

   ```bash
   java -jar target/miapp.jar
   ```
4. Acceder en navegador → `http://localhost:8080`

**Evalúa:** e), f)

---

### **3. Configuración y seguridad**

* Archivo `application.properties`:

  ```properties
  server.port=8080
  server.error.include-message=always
  ```
* Activar HTTPS con un certificado autofirmado:

  ```bash
  keytool -genkeypair -alias miapp -keyalg RSA -keysize 2048 \
          -keystore keystore.p12 -storetype PKCS12 -validity 3650
  ```

  Configurar:

  ```properties
  server.ssl.enabled=true
  server.ssl.key-store=classpath:keystore.p12
  server.ssl.key-store-password=123456
  server.port=8443
  ```
* Uso de *Spring Security* para proteger rutas:

  ```java
  @Configuration
  @EnableWebSecurity
  public class SecurityConfig {
      @Bean
      public SecurityFilterChain security(HttpSecurity http) throws Exception {
          http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
              .httpBasic();
          return http.build();
      }
  }
  ```

**Evalúa:** d)

---

### **4. Integración con NGINX (como proxy inverso)**

* NGINX recibirá peticiones HTTP y las redirigirá al contenedor de Spring Boot:

  ```nginx
  server {
      listen 80;
      server_name midominio.com;

      location / {
          proxy_pass http://springboot:8080;
      }
  }
  ```
* Beneficios:

  * Balanceo de carga
  * Terminación SSL
  * Servir contenido estático
  * Seguridad adicional (ocultar backend)

**Evalúa:** c)

---

### **5. Contenerización con Docker**

**Dockerfile**:

```Dockerfile
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/miapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml**:

```yaml
version: '3'
services:
  springboot:
    build: .
    container_name: springboot-app
    ports:
      - "8080:8080"

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - springboot
```

Ejecutar:

```bash
docker compose up --build
```

Y probar en `http://localhost`.

**Evalúa:** f), g), i)

---

### **6. Despliegue en la nube con Koyeb**

1. Subir imagen a Docker Hub:

   ```bash
   docker tag miapp usuario/miapp
   docker push usuario/miapp
   ```
2. En Koyeb:

   * Crear nuevo servicio → “Deploy from Docker Hub”
   * Indicar `usuario/miapp`
   * Puerto de exposición: `8080`
3. Probar la app con la URL pública generada por Koyeb.

**Evalúa:** i), g)

---

### **7. Documentación técnica y administración**

Elaborar un documento con:

* Descripción del sistema y componentes.
* Pasos de instalación y despliegue (local, Docker, Koyeb).
* Comandos de administración (`docker logs`, `docker exec`, `docker stop`).
* Recomendaciones de seguridad:

  * Variables de entorno para contraseñas.
  * Desactivar endpoints sensibles.
  * Uso de HTTPS y proxy inverso.
* Pruebas de rendimiento con `curl` o `ab`.

**Evalúa:** h), g)

---

### ✅ Entregables del tema:

1. Código fuente del proyecto Spring Boot.
2. `Dockerfile` y `docker-compose.yml`.
3. Configuración de NGINX.
4. Capturas de:

   * Aplicación en local.
   * Contenedores funcionando.
   * Despliegue en Koyeb.
5. Documento técnico con explicación de configuración y seguridad.

---

### 🧾 Evaluación:

| Criterio | Evidencia                                            | Instrumento                    |
| -------- | ---------------------------------------------------- | ------------------------------ |
| a, b     | Explicación del servidor y estructura de Spring Boot | Cuestionario / informe técnico |
| c        | Configuración proxy NGINX                            | Docker Compose + NGINX         |
| d        | Seguridad SSL y roles                                | Código y configuración         |
| e, f     | Ejecución y configuración de la app                  | Código funcional               |
| g        | Pruebas de despliegue                                | Capturas / logs                |
| h        | Documentación final                                  | Informe                        |
| i        | Uso de Docker y Koyeb                                | Dockerfile + despliegue online |

---

¿Quieres que te lo redacte ahora **como unidad didáctica completa** (con introducción, objetivos específicos, contenidos, actividades, evaluación y recursos) lista para incluir en una programación del módulo **Despliegue de Aplicaciones Web** (DAW2)?
Puedo generarla con formato docente oficial (RA, CE, actividades, temporalización, etc.).
