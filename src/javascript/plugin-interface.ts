import { SvelteComponent } from "svelte";
import { arrayable, mergeable } from "./special-svelte-stores";


export const defaultBookProperties = mergeable<string>()

type PluginPanel = {
  tabs : {
    id : string,
  }[]
  widget : SvelteComponent,
}

export const pluginPanel = arrayable<PluginPanel>()

export const settingsDialog = arrayable<SvelteComponent>()

export const bookFormats = mergeable<any>()