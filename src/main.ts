import App from './App.svelte'

// App mode
import {get} from 'svelte/store'
import { isApp } from './javascript/appMode.js'

// Multi language support
import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n'
import en from './localizations/en.toml'
import it from './localizations/it.toml'

const locale = getLocaleFromNavigator().split('-')[0];
addMessages('en', en)
addMessages('it', it)
init({ fallbackLocale: 'en', initialLocale: locale })  



// Offline support
if ('serviceWorker' in navigator && !get(isApp)) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}



new App({
  target: document.body,
})

