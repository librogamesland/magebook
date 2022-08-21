import { writable,derived } from "svelte/store"

const key = "mage-settings"
const lastSettings = JSON.parse(localStorage.getItem(key) || '{}')



export const theme = writable(lastSettings.theme || "light")
export const font = writable(lastSettings.font || "Arial")
export const fontSize = writable(lastSettings.fontSize || "12")
export const pageWidth = writable(lastSettings.pageWidth || "108")
export const pageZoom = writable(lastSettings.pageZoom || "120")
export const titleHighlight = writable(lastSettings.titleHighlight || "2")
export const justifyText = writable(lastSettings.justifyText || "1")


export const lineSpacing = writable(lastSettings.lineSpacing || "140%")
export const lineMargin = writable(lastSettings.lineMargin == null ? "4" : lastSettings.lineMargin)




export const settings = derived([theme, font, fontSize, pageWidth, pageZoom, titleHighlight, lineSpacing, lineMargin, justifyText], 
  ([$theme, $font, $fontSize, $pageWidth, $pageZoom, $titleHighlight, $lineSpacing, $lineMargin, $justifyText]) => ({
    theme: $theme,
    font: $font,
    fontSize: $fontSize,
    pageWidth: $pageWidth,
    pageZoom: $pageZoom,
    titleHighlight: $titleHighlight,
    lineSpacing: $lineSpacing,
    lineMargin: $lineMargin,
    justifyText: $justifyText,
}))


settings.subscribe( $settings => {
  localStorage.setItem(key, JSON.stringify($settings))
})




