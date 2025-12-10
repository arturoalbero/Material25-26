# Activity

## 5.1. The Domain Model: Entities. Use of Lombok. Logging

> **ACTIVITY 1:** Redesign the *My Favourite Composer* application with an entity-oriented approach. I recommend creating a new project from scratch, adding the necessary dependencies and including Lombok.
>
>   - Group the packages correctly.
>   - Differentiate the objects that are entities (Composer, Music Piece, etc.) from the DTOs (objects for collecting form data).
>   - Create the classes again, using Lombok.
>   - Reuse the views and controllers that you can.
>   - Eliminate all the business logic you put in the controllers and transfer it to different services that interact with the entities (you may have already done this).

---

> **ACTIVITY 2:**
> Add logs to the application.
>
>   - An info log for each controller, to know when they are accessed.
>   - An info log for the services, to check that what we want is being carried out.
>   - A warning log if:
>       - The added composer lived or lives for more than 100 years.
>       - If the piece added to a composer premiered after their date of death.
>   - Add an error log every time a controlled exception is thrown.
>       - Add one more case to not allow adding a piece: That its premiere is earlier than the composer's birth.

---

## 5.2 Repositories. CRUD with in-memory repositories

> **ACTIVITY 1** Carry out work analogous to the previous example in the new version of My Favourite Composer. Keep in mind that it is similar to what you already did in the previous version, but with a slightly different approach.
> – Organize the entities using repositories
> – Create the CRUD methods and any others you consider necessary to work with the repositories in their corresponding services.
> – Adapt the views you already had, or create new ones, to support those methods. Use clear and concise URI naming. Use `@PathVariable`.
> – Initialize the data from the .csv file using CommandLineRunner.
> You can adapt the practice already done to this format, or do it again.

---

> **ACTIVITY 2** Create the DTOs (Data Transfer Objects) for the forms using records and the domain model entities using Lombok.

---

> **ACTIVITY 3:** Reprogram the filters you had (by name, by nationality, by genre for the pieces) to adapt them to the established format.
> - At least one text filter and one filter by list element.

---

## 5.3 Hidden attributes in forms and parameters in archives

> **ACTIVITY 1**: Read about **records** on *this web page* and answer the following questions:
> * Which methods are automatically generated in a record?
> * Why can’t setters be used?
> * What does it mean that the attributes are final?
> * What particularity do the automatically generated getters have?

> **ACTIVITY 2**: Modify the forms and their corresponding controller methods to demonstrate the three alternatives we have for managing hidden attributes. You may modify the classes to add some hidden attribute if needed:
>
> 1. Manually assigning the hidden attribute.
> 2. Using a hidden field.
> 3. Using an ad-hoc DTO (with record)

> **ACTIVITY 3:** Redo the newsletter email-sending process you designed, storing the messages in a configuration file named `email.properties`.

> **ACTIVITY 4:** Create another configuration file in which you store messages that you will later send to the view through the controllers:
> * Error messages
> * Welcome messages

> **ACTIVITY 5:** Create another configuration file in which we store the web application version `version = 1`. Then, add in one of the classes a parameter indicating in which version of the application it was created. That parameter must also be stored in the corresponding `.csv`.