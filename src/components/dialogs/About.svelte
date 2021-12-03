<script>
  import { _ } from 'svelte-i18n'
  import manifest from '../../../package.json'

  export let params
  export let callback

  if(params){ }
</script>

<div class="dialog">
  <h3>Magebook - v. {manifest.version}</h3>
  <img src="./static/img/logo.png" alt="Magebook logo">
  <br>
  <p>{@html $_('about.text')}</p>
  <p>{$_('about.contact')}: <a target="_blank" rel="noopener" href="mailto:luca.fabbian.1999@gmail.com?subject=Magebook%20-%20Segnalazione">luc.fabbian@gmail.com</a></p>
  <button class="ok" on:click={() => callback(true)}>{$_('dialogs.ok')}</button>
</div>

<style>
  .dialog {
    width: 440px;
    max-width: calc(100vw - 30px);
    text-align: center;
  }

  p {
    line-height: 1.4rem;
  }

  img {
    width: 200px;
    max-width: calc(100vw - 90px);
  }

  button {
    margin-right: 0;
  }
</style>