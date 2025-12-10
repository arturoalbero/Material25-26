# Ampliation Activity

> **AMPLIATION ACTIVITY**: Using a `.properties` archive, create a way to have two versions of the page, one in `Castellano` (or `English`) and the other in `Valenciano`.
> - All the messages have to be represented in a `.properties` archive and have to be accessed through a `@Configuration` class.
> - When you add a composer or a musical piece, add a tag that indicates in which language version of the page was added.
> - You can modify the description or biography of the composers or musical pieces depending on the language. You can store the data using a MAP like this:
> ```java
> Map<LanguageEnum, String> descriptions; //LanguageEnum is an Enum with the languages of the webpage, like ES for Spanish, EN for English, RU for Russian, etc.
>```