# My Favourite Composers 2.0

Improve "My Favourite Composer" with the following features:

* A **form to add new composers**, validating that the dates are correct.

  * For the composer, distinguish between real name and stage name. The stage name will be used as the key. *Franz Liszt* is the real name, but *Liszt* is the stage name. *Johannes Chrysostomus Wolfgangus Theophilus Mozart* is the real name, but *Wolfgang Amadeus Mozart* is the stage name. If no stage or real name is specified, assume both values are the same and act accordingly (copying the value).
* Create a **form that allows you to enter a musical piece**, assigning it to a composer, based on the previous unit’s practice. Therefore, use the `MusicalPiece` class as the *commandObject*, or a specific class that, in addition to the musical piece, includes the composer.

  * The composer to be selected must have been previously entered.
  * The composer to be selected must appear in a dropdown list.
  * The instrumentation must be created using an enumerator with the categories PIANO, SOLO, CHAMBER, ORCHESTRA, VOCAL, STAGE, OTHER.
  * SOLO pieces are for a single instrument other than piano.
  * A chamber piece involves several performers but does not reach orchestral size.
  * “Vocal” refers to pieces with only voices (choral or not), and “Stage Piece” refers to operatic works (voice and orchestra).
  * Store the new musical piece in the `.csv` file.
  * For each musical piece, add a list of alternative titles. For example, Beethoven’s *Piano Sonata No. 14 in C-sharp minor, Op. 27 No. 2 Quasi una fantasia* is also known as *Sonata No. 14 in C-sharp minor* or *Clair de lune* or *Moonlight Sonata*.
* Separate **forms to EDIT** existing composers and/or musical pieces. Note that this would allow reassigning pieces to other composers (but not duplicating them).
* Implement **form validation** in the add and edit forms for musical pieces and composers. Validate that dates are valid, names are not empty (except where allowed), and that entered data is within acceptable limits. Also include error messages and CSS error classes. Modify model classes with the appropriate annotations.
* The ability to delete a piece.
* The ability to delete a composer (and all their pieces).
* Improve **searchComposerView** to allow partial name searches using **regular expressions**. For example, if you include *Franz Liszt* and *Franz Peter Schubert* and search for *Franz*, both should appear.
* A **searchMusicalPieceView** to search for musical pieces by name. Implement regular expressions for partial matches.
* Optimize the code handling collections using **functional programming**.

## EXTENSION:

* Regarding the **form to add** new musical pieces to registered composers:

  * Next to the composer section, add a text field that allows entering the name of an unregistered composer. The field is activated with a checkbox.
  * If active, it can be written in but not selected from the list.
  * If not active, you can only choose composers from the list.
  * When submitting, the add composer form should be launched with the unregistered composer’s name, allowing the addition of that composer, and finally, the registration of the work under the new composer.
