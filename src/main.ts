import './index.css'
import 'mage-plugins'
import App from './App.svelte'

// App mode
import { isVSCode } from './javascript/vscode.js'


// Multi language support
import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n'
// @ts-ignore
import en from './localizations/en.toml'
// @ts-ignore
import it from './localizations/it.toml'

addMessages('en', en)
addMessages('it', it)

const locale = getLocaleFromNavigator().split('-')[0];
init({ fallbackLocale: 'en', initialLocale: locale })




// Offline support
if ('serviceWorker' in navigator && !isVSCode) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}



new App({
  target: document.body,
})

