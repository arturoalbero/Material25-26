# My Favourite Composers 2.0

Enhance "My Favourite Composer" with the following features:
* A **form for adding new composers**, which validates that the dates are correct.
    * In the composer, differentiate between the real name (**nombre**) and the stage name (or artistic name). We will use the stage name as the key. *Franz Liszt* is the real name, but *Liszt* is the stage name. *Johannes Chrysostomus Wolfgangus Theophilus Mozart* is the real name, but *Wolfgang Amadeus Mozart* is the stage name. If an artistic or real name is not specified, it is assumed that the two values match, and we act accordingly (copying the value).
* Create a **form that allows you to introduce a musical piece**, assigning it to a composer, based on the practice from the previous unit. Therefore, use the `MusicalPiece` class as a *commandObject*, or a specific class that, in addition to the musical piece, includes the composer.
    * The composer to be selected must have been introduced previously.
    * The composer to be selected must appear in a dropdown list.
    * The instrumentation must be created using an enumerator with the categories PIANO, SOLO, CHAMBER, ORCHESTRA, VOCAL, STAGE, OTHER.
    * SOLO pieces are for a single instrument that is not the piano.
    * A chamber piece is one that involves several instrumentalists but is not quite an orchestra.
    * We call "Vocal" pieces with only voices (choral or not) and "Stage Piece" to opera-like pieces (voice and orchestra).
    * Store the new musical piece in the `.csv`.
    * For each musical piece, add a list of alternative names. For example, Beethoven's *Piano Sonata No. 14 in C-sharp minor, Op. 27 No. 2 Quasi una fantasia* is also known as *Sonata No. 14 in C-sharp minor* or *Claro de luna* or *Moonlight Sonata*.
* Separate **forms to EDIT** existing composers and/or pieces. Keep in mind that this would allow reassigning pieces to other composers (but not duplicating them).
* The ability to delete a piece.
* The ability to delete a composer (and all their pieces).
* Improve **searchComposerView** to allow searching with partial names using **regular expressions**. For example, if you include *Franz Liszt* and *Franz Peter Schubert* and you search for *Franz*, both should appear.
* A **searchMusicalPieceView** view to search for musical pieces by name. Implement regular expressions for partial matches.
* Optimize the code that handles collections using **functional programming**.
* Create a **loadComposersView** view that allows uploading a `.csv` file and provides the option to either replace the existing one or merge them. When merging, keep in mind that if there are two composers with the same primary key (stage name), we will update the data. Organize the `.csv` data based on the stage name.

## ENHANCEMENT:

* Regarding the **form for adding** new musical pieces to registered composers.
    * Next to the composers section, add a text box that allows adding the name of an unregistered composer. The box is activated with a checkbox.
    * If active, you can type in it but not choose a composer from the list.
    * If not active, you can only choose composers from the list.
    * When you click submit, you must launch the add composer form with the name of the unregistered composer and allow adding that composer and, finally, adding the registered work to the new composer.

> **DELIVERY FORMAT AND OTHER CONSIDERATIONS:**
> * One zip called PU3[student-name].zip.
>   * Inside the pdf with the memory and a folder with the project called `My favourite Composer v2`. Include an extra project with the `practice exercices`, such as the ***functional programming*** ones.
> * Make your project listen to the port `8080`.
> * The code of the project has to be properly **documented with javadoc**.
> * For the memory, use the documents you have been preparing during the previous assestments as *source material*.
> * The memory requires having a **front page and an index**. As this practice is composed of several mini entries (the previous assestments) and it will be longer than usual, **it is crucial to deliver it in a proper format** to be evaluated.
> * **Document the issues and the extra resources** you use in the elaboration of the assestment, such as external sources or even artificial intelligence assistants. Add this parts in the annex or in each entry, as you think is better.
> * The previous assestments **can improve** your grade up to 1 point (from 10).
> * Remember that the assestment is one delivery and the enhaced assestment is a different one (though the later is optional).
