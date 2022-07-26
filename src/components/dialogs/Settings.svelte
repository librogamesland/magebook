<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { font, fontSize, editorMargins, titleHighlight, justifyText, lineMargin, lineSpacing } from '../../javascript/settings'

  export let params : null
  export let callback : (value: any) => void

  const fontCheck = new Set([
    // Others
    'EB Garamond', 'Garamond',
    // Windows 10
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
    // macOS
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
  ].sort());

  const listFonts = () => {
    const fontAvailable = new Set();

    for (const font of fontCheck.values()) {
      if (document.fonts.check(`12px "${font}"`)) {
        fontAvailable.add(font);
      }
    }

    return [...fontAvailable.values()];
  }

  !params;
</script>

<div class="dialog">
  <h3>Settings</h3>
  <table>
    <tr>
      <th>font-family:</th>
      <td>
        <input type="text" bind:value={$font} list="fonts">
        <datalist id="fonts">
          {#each listFonts() as font}
            <option value={font}>
          {/each}
        </datalist>
    
      </td>
    </tr>
    <tr>
      <th>font-size:</th>
      <td><input type="number" bind:value={$fontSize}  min="2" max="50"></td>
    </tr>
    <tr>
      <th>editor-margins:</th>
      <td><input type="text" bind:value={$editorMargins}></td>
    </tr> 
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

  </table>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
</div>

<style>
  .dialog {
    text-align: center;
  }


  button {
    margin-right: 0;
  }

  table {
    width: 100%;
    text-align: left;
  }
  td > *{
    width: 100%;
  }

  td > input[type="range"]{
    width: 40px;
  }
</style>