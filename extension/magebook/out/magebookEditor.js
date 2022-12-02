"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagebookEditorProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class MagebookEditorProvider {
    static register(context) {
        const provider = new MagebookEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(MagebookEditorProvider.viewType, provider);
        return providerRegistration;
    }
    constructor(context) {
        this.context = context;
    }
    /**
     * Called when our custom editor is opened.
     *
     *
     */
    async resolveCustomTextEditor(document, webviewPanel, _token) {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'editor'))],
            portMapping: [{
                    extensionHostPort: 5173,
                    webviewPort: 5173,
                }]
        };
        webviewPanel.webview.html = this.getHtmlDebug(); //this.getHtmlForWebview(webviewPanel);
        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });
        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'add':
                    return;
                case 'delete':
                    this.deleteScratch(document, e.id);
                    return;
            }
        });
        updateWebview();
    }
    getHtmlDebug() {
        const remoteUrl = (fpath) => 'http://localhost:5173' + fpath;
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
			window.ISVSCODE = 'ciaomamma'
			console.log(window.ISVSCODE)
			(function() {
				window.vscode = acquireVsCodeApi();
				console.log('vscode', vscode);
			}())
	
		  </script>
		  <script defer src="https://cdn.jsdelivr.net/npm/@hpcc-js/wasm@1.18.0/dist/index.min.js"></script>
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
    /**
     * Get the static html used for the editor webviews.
     */
    getHtmlForWebview(webviewPanel) {
        const localFile = (fpath) => {
            const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'editor', ...fpath.split('/')));
            return webviewPanel.webview.asWebviewUri(onDiskPath);
        };
        return `
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
		  
		
		  <script defer src="https://cdn.jsdelivr.net/npm/@hpcc-js/wasm/dist/index.min.js"></script>
		  
		  <script type="module" crossorigin src="${localFile('assets/index.0e4ed60e.js')}"></script>
		  <link rel="stylesheet" href="${localFile('assets/index.f2e263b6.css')}">
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
    }
    /**
     * Delete an existing scratch from a document.
     */
    deleteScratch(document, id) {
        const json = this.getDocumentAsJson(document);
        if (!Array.isArray(json.scratches)) {
            return;
        }
        json.scratches = json.scratches.filter((note) => note.id !== id);
        return this.updateTextDocument(document, json);
    }
    /**
     * Try to get a current document as json text.
     */
    getDocumentAsJson(document) {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }
    /**
     * Write out the json to a given document.
     */
    updateTextDocument(document, json) {
        const edit = new vscode.WorkspaceEdit();
        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.MagebookEditorProvider = MagebookEditorProvider;
MagebookEditorProvider.viewType = 'magebook.editor';
//# sourceMappingURL=magebookEditor.js.map