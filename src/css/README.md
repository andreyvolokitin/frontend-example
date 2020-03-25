# Main file

The main file (usually labelled `main.scss`) should be the only Sass file from the whole code base not to begin with an underscore. This file should not contain anything but `@import` and comments.

*Note: when using [Eyeglass](https://github.com/sass-eyeglass/eyeglass) for distribution, it might be a fine idea to name this file `index.scss` rather than `main.scss` in order to stick to [Eyeglass modules specifications](https://github.com/sass-eyeglass/eyeglass#writing-an-eyeglass-module-with-sass-files). See [#21](https://github.com/HugoGiraudel/sass-boilerplate/issues/21) for reference.*

Reference: [Sass Guidelines](http://sass-guidelin.es/) > [Architecture](http://sass-guidelin.es/#architecture) > [Main file](http://sass-guidelin.es/#main-file)

# Things to keep in mind

1. All non-scoped variables (those not declared inside a block) are global and should be defined inside `abstracts/_variables.scss`. The names of these variables SHOULD NOT start with underscore (`_`). If some variables are specifically related to the code block or component, then they should be defined near the component code itself, but their name SHOULD start with an underscore and a BEM block name related to this code (i.e. `_{blockName}-{variableName}`). The leading underscore and the block name should act as a namespace and prevent variables clashing.
2. `abstracts/_mixins.scss` contains (along with other things) abstract BEM definitions which can be used by multiple components. I.e.: `@mixin field`, `@mixin field__label` and `@mixin field__label_placeholder` is a regular BEM notation. These definitions can be themed to create different looks for the same block. Usually, this is implemented with descendant/child selectors, i.e.:

    ```css
    .block_skin1 {}
    .block_skin1 .block__element {}
    .block_skin1 .block__another-element {}
    .block_skin1 .block__some-element {}
    ```
    But mixin name can't contain spaces, thus it should embed all information withing a single "word". When it comes to theming there is a need for multiple modifications for a single ruleset (block or element). I.e. one modifier for a theme, plus one for regular modifier use-cases:
    ```scss
    @mixin block_skin1 {}
    @mixin block__element_skin1 {}
    @mixin block__element_modifier_skin1 {}
    ```
    It causes mixin names to have multiple modifiers which is not a concept of BEM (though it has a concept of key-value modifiers which looks similar: `block__element_key_value`). Consider it a small trade-off.

3. CSS should be compressed (gzip or other) for production because it uses a lot of mixins with the same styles, which gets repeated a lot of times, as well as repeated media queries. There is a `build:compress` npm task for production build with gzip compression
4. For high resolution images support the project uses `postcss-at2x`. This plugin puts `background-image` and `background-size` styles at the bottom of a file so it can override other styles (i.e. those redefined in media queries). See: https://github.com/simonsmith/postcss-at2x/issues/17
