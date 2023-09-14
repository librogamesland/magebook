

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
  !w;

  $: console.log(tab)

</script>

{#if tab.startsWith('templateplugin.tabs.')}
  <div class="m-6">
  {#if tab === 'templateplugin.tabs.1'}
    <span class="float-right text-gray-600">v.{packageJson.version}</span>
    <h1 class="text-2xl font-bold mt-8 mb-2">{$_('templateplugin.title')}</h1>
    <p class="text-gray-700"><b>Setting value:</b> {$settingExample}</p>
  {/if}
  </div>
{/if}

<style type="postcss">


</style>