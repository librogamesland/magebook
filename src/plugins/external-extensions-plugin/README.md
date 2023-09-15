# magebook-plugin-template
A plugin template for the [magebook editor](https://magebook.github.io).
To enable, make a copy in the same folder and rename it removing the `disabled-` prefix

## Setup
This plugin is intended as a subfolder inside the magebook project. Install it using the instruction on magebook docs.

## Project structure

```bash
package.json  # javascript dependencies
src/
  assets/             # put images and so on here
  localizations/      # put here english and italian localizations
  Settings.svelte     # this will be added to the settings dialog in magebook
  Widget.svelte       # this will be added to the sidebar.
  main.js             # plugin entry point
```

## Automatic deployment

Check the github action under `.github/workflow/main.yml`
Or just submit to the main branch of magebook!


## License and authors
This software is licensed under the MIT License.

Main author: Luca Fabbian <luca.fabbian.1999@gmail.com>
