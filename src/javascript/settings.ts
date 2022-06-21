import { writable,derived } from "svelte/store"

const key = "mage-settings"
const lastSettings = JSON.parse(localStorage.getItem(key) || '{}')



export const theme = writable(lastSettings.theme || "light")
export const font = writable(lastSettings.font || "Arial")
export const fontSize = writable(lastSettings.fontSize || "14")
export const editorMargins = writable(lastSettings.editorMargins || "20% - 45px")
export const titleHighlight = writable(lastSettings.titleHighlight || "2")

export const lineSpacing = writable(lastSettings.lineSpacing || "140%")
export const lineMargin = writable(lastSettings.lineMargin === null ? lastSettings.lineMargin : "4")




export const settings = derived([theme, font, fontSize, editorMargins, titleHighlight, lineSpacing, lineMargin], 
  ([$theme, $font, $fontSize, $editorMargins, $titleHighlight, $lineSpacing, $lineMargin]) => ({
    theme: $theme,
    font: $font,
    fontSize: $fontSize,
    editorMargins: $editorMargins,
    titleHighlight: $titleHighlight,
    lineSpacing: $lineSpacing,
    lineMargin: $lineMargin,
}))


settings.subscribe( $settings => {
  localStorage.setItem(key, JSON.stringify($settings))
})




