import { writable,derived } from "svelte/store"

const key = "mage-settings"
const lastSettings = JSON.parse(localStorage.getItem(key) || '{}')



export const theme = writable(lastSettings.theme || "light")
export const font = writable(lastSettings.font || "Arial")
export const fontSize = writable(lastSettings.fontSize || "14")
export const editorMargins = writable(lastSettings.editorMargins || "20% - 45px")
export const titleHighlight = writable(lastSettings.titleHighlight || "2")
export const justifyText = writable(lastSettings.justifyText || "1")


export const lineSpacing = writable(lastSettings.lineSpacing || "140%")
export const lineMargin = writable(lastSettings.lineMargin === null ? "4" : lastSettings.lineMargin)




export const settings = derived([theme, font, fontSize, editorMargins, titleHighlight, lineSpacing, lineMargin, justifyText], 
  ([$theme, $font, $fontSize, $editorMargins, $titleHighlight, $lineSpacing, $lineMargin, $justifyText]) => ({
    theme: $theme,
    font: $font,
    fontSize: $fontSize,
    editorMargins: $editorMargins,
    titleHighlight: $titleHighlight,
    lineSpacing: $lineSpacing,
    lineMargin: $lineMargin,
    justifyText: $justifyText,
}))


settings.subscribe( $settings => {
  localStorage.setItem(key, JSON.stringify($settings))
})




