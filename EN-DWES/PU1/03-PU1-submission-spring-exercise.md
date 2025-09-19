# Introduction to Web Development in a Server Environment

## Submission

Submit both projects, as well as a report containing screenshots of the entire process, explaining what is being done at each step. The report must include:

* Cover page.
* Table of contents.
* Explanatory text (well-written) and screenshots.
* Possible issues encountered.
* Documentation on the use of different resources available as an annex, if applicable (for example, the use of a chatbot to translate from Spanish to English).

## Exercise 1: Static Website with the built-in spring boot initializr

Create a Spring Boot project using the [**VSC spring boot intializr**](https://code.visualstudio.com/docs/java/java-spring-boot) or the [IntelliJ assistant](https://www.jetbrains.com/help/idea/your-first-spring-application.html#create-new-spring-boot-project). Include the dependencies starter spring-Web, starter-Thymeleaf, and DevTools, in Java 25, packaged as a jar. Configure it to listen on port 9000 and to only contain an index.html page with the heading "Hello World". Run the application and verify in the browser that it works correctly.

## Exercise 2: Static Website with start.spring.io

Create a second project using [https://start.spring.io](https://start.spring.io) with the same features as the previous one. In this case, it will consist of a static website about Frédéric Chopin.

* **index.html** with a general biography (you can extract information from [Wikipedia](https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Chopin) and summarize it). Include details about his birth and death, as well as the places where he carried out his professional activity. Talk about his partner George Sand and his time in Mallorca, as well as any other important or curious information.
* **repertorio.html** with a list of the composer’s most relevant works. Add links to selected sheet music available on [imslp.org](https://imslp.org/wiki/Category:Chopin,_Fr%C3%A9d%C3%A9ric), as well as video performances on YouTube or IMSLP for each piece.
* **galeria-imagenes.html** with relevant photos and paintings. You can extract them from Wikipedia.
* **enlaces-externos.html** with relevant links for the website. You may add links to his Wikipedia page, imslp.org, as well as any articles you find online.

The page content can be in Spanish, although you may use a chatbot or a translator to translate it into English.

## Exercise 3: Java Review

### Home Automation v.1 - Review of Classes and Interfaces

Develop the following console applications:

> The goal is to develop a program that manages the home automation devices of a building. For this, we will use an `ArrayList` that initially contains 3 elements: one for the heating thermostat, another for the elevator, and another for the radio dial of the background music system. In the future, we might have more elements.
>
> The thermostat has a lastInspectionDate, an integer value in degrees Celsius: minimum 15, maximum 80, and the initial temperature is 20. The elevator has a currentFloor, from 0 to 8. The initial floor is 0. Finally, the radio dial goes from 88.0 to 104.0, advancing by tenths, with the initial value being 88.0.
>
> Each element, as well as any future ones, must be able to perform the following functions:
>
> * `increment()`: increases the home automation element by one unit. Returns `true` if the operation is successful, `false` if a problem occurs (such as reaching the maximum).
> * `decrement()`: decreases the home automation element by one unit. Returns `true` if the operation is successful, `false` if a problem occurs (such as reaching the minimum).
> * `reset()`: returns the home automation element to its original state.
> * `getStatus()`: returns a `String` with the type of home automation element as well as its current state.
>   Additionally, the thermostat must include a method `inspect()` to set the lastInspectionDate to the current date.
>
> Once the system is defined, create a program that initializes an `ArrayList` with one instance of each of the 3 devices, and then, through a menu, allows the user to perform all operations (0 to exit, 1 to increment a device, 2 to decrement a device, 3 to reset a device, and 4 to inspect the thermostat), and then select which element we want to work on (making sure it is a value between 0 and the size of the `ArrayList - 1`).
>
> The menu, in addition to the options, must always display the status of the devices.

### Home Automation with CRUD Operations

**CRUD Operations:**

* C - Create (Insert)
* R - Read (Select)
* U - Update
* D - Delete

#### Home Automation v.2 - Files

> Create a second version of the program, but this time allow storing and loading the home automation elements from a `.csv` (comma separated values) file included in the project resources.
>
> Add an option that allows adding a home automation element of any type, another to delete it, and another to edit it.

#### Home Automation v.3 - Database

> Create an alternative version of the previous program, but make it work with a SQLite database (or any other) instead of the file. You only need to rewrite the methods responsible for reading and writing data so that they operate with the database instead.
>
> * [SQLite Tutorial](https://www.sqlitetutorial.net/sqlite-java/)
> * [Maven Repository](https://central.sonatype.com/artifact/org.xerial/sqlite-jdbc)



