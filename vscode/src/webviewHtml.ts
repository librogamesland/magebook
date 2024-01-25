import * as vscode from 'vscode';
import * as path from 'path';



const IS_DEBUG = false;


const getDefaultValues = async (context : vscode.ExtensionContext) : Promise<string> =>`
  window.VSCODESettings = ${await context.globalState.get('magebook.settings') }
  window.VSCODEMageversion = '1.2.13'
  `;



export const getMagebookHTML =  async (webviewPanel: vscode.WebviewPanel, context : vscode.ExtensionContext) : Promise<string> => {
    const remoteUrl = (fpath : string) : string => 'http://localhost:5173' + fpath;
            
    if(IS_DEBUG){
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="module" src="${remoteUrl('/@vite/client')}"></script>

    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width,initial-scale=1'>

    <title>Magebook web editor</title>
  <link rel="manifest" href="/magebook/editor/pwa/manifest.json">
  <meta name="theme-color" content="#333">
  <meta name="description" content="Magebook è un editor online per la scrittura di librogame e app interattive, sviluppato da Luca Fabbian e interamente curato dalla community di LGL">

    <link rel='icon' type='image/png' href='${remoteUrl('/assets/img/icons/icon-128x128.png')}'>
  <link rel='stylesheet' href='${remoteUrl('/assets/fontello/css/fontello-embedded.css')}'>
  <script>
    window.ISVSCODE = 'true';
    ${await getDefaultValues(context)}
  </script>
  <script defer src="${remoteUrl('/hpcc-js/dist/index.min.js')}"></script>
  <script defer type="module" src="${remoteUrl('/main')}"></script>
</head>
<body>

  <noscript>
    <div style="text-align: center; font-size: 20px;">
      <p>
        <br><br>
        Magebook is an online gamebook editor, <br>developed by <b>Luca Fabbian</b> and supported by
        <a href="http://librogame.net" rel="noopener" target="_blank" >LGL community</a>.
        <br><br>Enable javascript to try it now!<br><br>
      </p>
      <img alt="Magebook logo" src="./static/img/logo.png" width="200px">
    </div>
  </noscript>
</body>
</html>`;
    }

    const localFile = (fpath : string) => {
        const onDiskPath = vscode.Uri.file(
            path.join(context.extensionPath, 'editor', ...fpath.split('/'))
        );
    return webviewPanel.webview.asWebviewUri(onDiskPath);
    };

    return  `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>

  <title>Magebook web editor</title>
  <link rel="manifest" href="/magebook/editor/pwa/manifest.json">
  <meta name="theme-color" content="#333">
  <meta name="description" content="Magebook è un editor online per la scrittura di librogame e app interattive, sviluppato da Luca Fabbian e interamente curato dalla community di LGL">

  <link rel='icon' type='image/png' href='./assets/icon-128x128.ade524a6.png'>


  <script defer src="${localFile('/hpcc-js/dist/index.min.js')}"></script>
  <script>
    window.ISVSCODE = 'true';
    ${await getDefaultValues(context)}
  </script>
  <script type="module" crossorigin src="${localFile('assets/index.js')}"></script>
  <link rel="stylesheet" href="${localFile('assets/index.css')}">
</head>
<body>
  <noscript>
    <div style="text-align: center; font-size: 20px;">
      <p>
        <br><br>
        Magebook is an online gamebook editor, <br>developed by <b>Luca Fabbian</b> and supported by
        <a href="http://librogame.net" rel="noopener" target="_blank" >LGL community</a>.
        <br><br>Enable javascript to try it now!<br><br>
      </p>
      <img alt="Magebook logo" src="./static/img/logo.png" width="200px">
    </div>
  </noscript>
</body>
</html>		
`;

    


};
