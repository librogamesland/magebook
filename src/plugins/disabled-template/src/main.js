import widget from './Widget.svelte'
import settings from './Settings.svelte'
import { defaultBookProperties, pluginPanel, settingsDialog } from '../../../javascript/plugin-interface'

// Multi language support
import { addMessages } from 'svelte-i18n'
import en from './localizations/en.toml'
import it from './localizations/it.toml'
import logo from './assets/logo.png'

addMessages('en', en)
addMessages('it', it)


defaultBookProperties.extend({

})

pluginPanel.extend({
  tabs : [
    {id: 'templateplugin.tabs.1', icon: `<img src="${logo}" alt="Template logo" style="width: 40px;">` },
  ],
  widget,
})

settingsDialog.extend(settings)

