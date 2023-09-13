<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { s } from '../../javascript/settings'
  import { settingsDialog } from '../../javascript/plugin-interface'
  import type { SvelteComponent } from 'svelte';

  const {font, fontSize, pageWidth, pageZoom, titleHighlight, justifyText, lineMargin, lineSpacing, dateFormat, singleChapterMode, countChars} = s

  export let params : null
  export let callback : (value: any) => void



  type PluginCallback = (bool : boolean) => void

  // https://stackoverflow.com/questions/64545260/svelte-using-bindthis-inside-each-block
  let _pluginCallbacks  : any[] = []
  $: pluginCallbacks = _pluginCallbacks.filter(Boolean)


  const fontCheck = new Set([
    // Others
    'EB Garamond', 'Garamond', 'Roboto',
    // Windows 10
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
    // macOS
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
  ].sort());



  const listFonts : Promise<string[]> = new Promise( (resolve) => setTimeout( () => {
    const fontAvailable = new Set<string>();

    for (let thisFont of fontCheck.values()){
      if (window.document.fonts.check(`12px "${thisFont}"`)) {
        fontAvailable.add(thisFont);
      }
    }

    resolve([...fontAvailable.values()]);
  }))





  !params;
</script>

<div class="dialog w-[600px] h-[600px] max-h-[90vh] flex flex-col">
  <h3>Settings</h3>
  <div class="settings flex-1">
    <table class="min-w-[300px] overflow-x-auto">
      <tr>
        <th>single-chapter-mode:</th>
        <td><input type="range" bind:value={$singleChapterMode} min="1" max="2"></td>
      </tr>
      <tr>
        <th>count-chars:</th>
        <td><input type="range" bind:value={$countChars} min="1" max="2"></td>
      </tr>
      <tr>
        <th>font-family:</th>
        <td>
          <input type="text" bind:value={$font} list="fonts">
          <datalist id="fonts">
            {#await listFonts}
              <!-- nothing -->
            {:then fonts}
            {#each fonts as font}
              <option value={font}>
            {/each}
            {/await}
          </datalist>

        </td>
      </tr>
      <tr>
        <th>font-size (pt):</th>
        <td><input type="number" bind:value={$fontSize}  min="2" max="50"></td>
      </tr>
      <tr style="height: 15px;"></tr>
      <tr>
        <th>page-width (mm):</th>
        <td><input type="number" bind:value={$pageWidth} min="1" max="400"></td>
      </tr>
      <tr>
        <th>page-zoom (%):</th>
        <td><input type="number" bind:value={$pageZoom} min="10" max="400"></td>
      </tr>
      <tr style="height: 15px;"></tr>
      <tr>
        <th>line-spacing:</th>
        <td><input type="text"  bind:value={$lineSpacing} ></td>
      </tr>
      <tr>
        <th>line-margin:</th>
        <td><input type="number" bind:value={$lineMargin} min="0" max="15"></td>
      </tr>
      <tr>
        <th>title-highlight:</th>
        <td><input type="range" bind:value={$titleHighlight} min="1" max="2"></td>
      </tr>
      <tr>
        <th>justify-text:</th>
        <td><input type="range" bind:value={$justifyText}  min="1" max="2"></td>
      </tr>
      <tr>
        <th>date-format:</th>
        <td><input type="text"  bind:value={$dateFormat} ></td>
      </tr>
      <tr style="height: 15px;"></tr>

      {#each $settingsDialog.entries() as [index, settings]}
        {#if settings}
          <svelte:component this={settings} bind:callback={_pluginCallbacks[index]}/>
          <tr style="height: 15px;"></tr>
        {/if}
      {/each}
    </table>
  </div>
  <div>
    <button class="ok" on:click={() => {
      Object.values(pluginCallbacks).forEach( call => call(true))
      callback(true)

    }}>{$_('dialogs.ok')}</button>
  </div>
</div>

<style>
  .dialog {
    text-align: center;
  }


  button {
    margin-right: 0;
  }
  .settings {
    overflow-y: auto;
  }

  table {
    text-align: left;
    width: 100%;
  }
  table :global(td > *){
    width: 100%;
  }

  table :global(td > input[type="range"]){
    width: 40px;
  }
</style>