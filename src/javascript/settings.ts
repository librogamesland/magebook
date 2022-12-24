import { writable,derived, type Writable } from "svelte/store"
import { isVSCode, updateHandlers, vscode } from "./vscode"

const key = "mage-settings"
const lastSettings = window.VSCODESettings || JSON.parse(localStorage.getItem(key) || '{}')


const defaultValues = {
  theme: "light",
  font: "Arial",
  fontSize: "12",
  pageWidth: "108",
  pageZoom: "120",
  titleHighlight: "2",
  justifyText: "1",
  lineSpacing: "140%",
  lineMargin: "4",
  dateFormat: "yyyymmdd-hhmmss",
}


export const s : { [name: string]: Writable<string> } = {}

const registerSetting = (key : string) => {
  const setting = writable(lastSettings[key] ?? defaultValues[key])
  s[key] = setting
  return setting
}

Object.keys(defaultValues).forEach(key => registerSetting(key));


export const settings = derived(Object.values(s), ($s) => {
    const keys = Object.keys(s)
    const r = {}
    for(let i = 0; i < $s.length; i++)  r[keys[i]] = $s[i]
    return r
})


let areVSCodeSettingsUpdated = false

updateHandlers.push( (message) => {
  if(message.settings !== undefined){
    try{
      const updatedSettings = JSON.parse(message.settings)
      Object.keys(defaultValues).forEach(key => 
        s[key].set(updatedSettings[key] ?? defaultValues[key])
      )
    }catch(e){}

    areVSCodeSettingsUpdated = true
  }
})

if(isVSCode){
  vscode.postMessage({ type: 'askSettings' });
}


settings.subscribe( $settings => {
  if(isVSCode){
    if(areVSCodeSettingsUpdated){
      vscode.postMessage({
        type: 'setSettings',
        settings: JSON.stringify($settings)
      })
    }
  }else{
    localStorage.setItem(key, JSON.stringify($settings))
  }
})




