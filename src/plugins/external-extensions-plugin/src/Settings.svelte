<script context="module">
import {storable} from '../../../javascript/special-svelte-stores'


/*
  Main settings of the plugin and other temporary
  data that should be cached on the local storage.
*/
const key = 'extensions-plugin-settings'

export const {
  settingExample
} = storable(key,{
  settingExample: 'change me in the settings',
})


</script>

<script>
  import { _ } from 'svelte-i18n'

  $: currentSettingExample = $settingExample
  export let callback = (result = false)  => {
    if(!result) return
    // Register change to
    if(currentSettingExample != $settingExample) $settingExample = currentSettingExample
  }
</script>


  <tr>
    <th>templateplugin-settingExample:</th>
    <td><input bind:value={currentSettingExample} type="text" class="flex-grow" /></td>
  </tr>