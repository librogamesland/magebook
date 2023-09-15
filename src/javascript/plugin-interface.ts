import { type ComponentType, SvelteComponent } from "svelte";
import { arrayable, mergeable } from "./special-svelte-stores";


export const defaultBookProperties = mergeable<string>()

type PluginPanel = {
  tabs : {
    id : string,
    label: string,
    icon: string,
  }[]
  widget : ComponentType<SvelteComponent<any>>,
}

export const pluginPanel = arrayable<PluginPanel>()

export const settingsDialog = arrayable<ComponentType<SvelteComponent<any>>>()

export const bookFormats = mergeable<any>()