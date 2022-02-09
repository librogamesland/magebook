import { writable,derived } from "svelte/store"

const key = "mage-settings"
const lastSettings = JSON.parse(localStorage.getItem(key) || '{}')



export const theme = writable(lastSettings.theme || "light")




export const settings = derived([theme], ([$theme]) => ({
  theme: $theme,
}))


settings.subscribe( $settings => {
  localStorage.setItem(key, JSON.stringify($settings))
})




