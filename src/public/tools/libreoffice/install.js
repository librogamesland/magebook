
// Retrieve url where the extension is loaded from
const mainUrl = mageapi.extensionURL.replace('install.js', '')


mageapi.iframeExtensions.extend({
  id: 'libreoffice-helper',
  icon: mainUrl + 'icon.png',
  src: mainUrl + 'index.html#magebookplugin=true'
})