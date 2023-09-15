

<script lang="ts">
  import packageJson from "../package.json";
  import { _ } from 'svelte-i18n';
  import { toast } from '@zerodevx/svelte-toast'
  import { urlParam } from '../../../javascript/urls';
  import {
    settingExample,
  } from './Settings.svelte';
  import { nullUntilLoaded } from '../../../javascript/store';


  export let tab = ''   // current PluginPanel tab
  export let w : number // width of the PluginPanel
  export let isResizing : boolean = false
  !w;

  $: console.log(tab)

</script>

{#if tab.startsWith('templateplugin.tabs.')}
  {#if tab === 'templateplugin.tabs.1'}
    <iframe class:pointer-events-none={isResizing} title="test" src="./tools/libreoffice/index.html#magebookplugin=true" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
  {/if}
{/if}

<style type="postcss">


</style>