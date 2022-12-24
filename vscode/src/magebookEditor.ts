import * as vscode from 'vscode';
import * as path from 'path';
import { getMagebookHTML } from './webviewHtml';
import { decode } from 'js-base64';


// reads a file as a string
const readFile = async(uri: vscode.Uri): Promise<string> =>
 (uri.scheme === 'untitled') ? '' : (await vscode.workspace.fs.readFile(uri)).toString();



 export class MagebookSymbolProvider implements vscode.DocumentSymbolProvider {
    constructor() {}

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
        const symbols = [document.getText()];

        const symbolsList :  vscode.ProviderResult<vscode.SymbolInformation[]> = [];
        for (let symbol of symbols) {
            // Construct location information here (for go-to feature).
			/*
            let startRow = ...;
            let endRow = ...;
            let startColumn = ...;
            let endColumn = ...;
            let range = new Range(startRow, startColumn, endRow, endColumn);
            let location = new Location(Uri.file(symbol.source), range);
            var description = ...;
            const kind = translateSymbolKind(symbol.kind);
            let info = new SymbolInformation(symbol.name, kind, description, location);
            symbolsList.push(info);*/
        }

        return symbolsList;
    };
};



/**
 * Define the document (the data model) used for paw draw files.
 */
class MagebookDocument implements vscode.CustomDocument {

	public text = '';
	public readonly uri: vscode.Uri;

	constructor(uri: vscode.Uri, initialContent: string	) {
		this.uri = uri;
		this.text = initialContent;
	}

	get uint8data () { return new TextEncoder().encode(this.text);	}

	dispose(): void {}

}






export class MagebookEditorProvider implements vscode.CustomEditorProvider<MagebookDocument> {

	// SETUP EDITOR
	private static readonly viewType = 'magebook.editor';

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			MagebookEditorProvider.viewType,
			new MagebookEditorProvider(context),
			{
				webviewOptions: { retainContextWhenHidden: true, },
				supportsMultipleEditorsPerDocument: false,
				
			});
	}

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }


	async openCustomDocument(
		uri: vscode.Uri, openContext: { backupId?: string },
		_token: vscode.CancellationToken
	): Promise<MagebookDocument> {
		// read file into a MagebookDocument object
		return new MagebookDocument(
			uri, 
			await readFile(typeof openContext.backupId === 'string' ? vscode.Uri.parse(openContext.backupId) : uri)
		);
	}



	async resolveCustomEditor(
		document: MagebookDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {

		// Setup initial content for the webview
		webviewPanel.webview.options = { enableScripts: true };
		webviewPanel.webview.html = await getMagebookHTML(webviewPanel, this.context);


		const updateWebviewText = async () => {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.text,
			});
		};


		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(async (e) => {
			switch (e.type) {
				case 'askUpdate':
					updateWebviewText();
					return;

				case 'askSettings':
					webviewPanel.webview.postMessage({
						type: 'update',
						settings: await this.context.globalState.get('magebook.settings'),
					});
					return;


				case 'setSettings':
					this.context.globalState.update('magebook.settings', e.settings);
					return;

				case 'updateBook':
					document.text = e.book;
					return;

				case 'addUndo':
					this._onDidChangeCustomDocument.fire({
						document,
						async undo(){  await webviewPanel.webview.postMessage({	type: 'undo'}); },
						async redo(){  await webviewPanel.webview.postMessage({	type: 'redo'}); },
					
					});
					return;

				case 'saveFile':
					if(document.uri.fsPath){
						const name = document.uri.path.substring(document.uri.path.lastIndexOf('/'), document.uri.path.lastIndexOf('.mage.md'));
						const fileUri = vscode.Uri.file(vscode.Uri.joinPath(document.uri, `../${name}${e.suffix.replace(/[^0-9a-z\.\-\_]/gi, '')}`).path);
						
						if(e.data){
							await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(e.data));
							await vscode.env.openExternal(fileUri);
						}else if(e.blob){
							// https://stackoverflow.com/questions/12168909/blob-from-dataurl
							const dataURI = e.blob;
							// convert base64 to raw binary data held in a string
							// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
							var byteString = decode(dataURI.split(',')[1]);

							// separate out the mime component
							var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

							const ia = Uint8Array.from(byteString, c => c.charCodeAt(0));



							await vscode.workspace.fs.writeFile(fileUri,ia);
							require("fs").writeFile(fileUri.fsPath, dataURI.split(',')[1], 'base64', function() {
								vscode.env.openExternal(fileUri);
							  });
							  
						

						}
					}
					return;
			}
		});




	}

	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<MagebookDocument>>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	public saveCustomDocument(document: MagebookDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		return vscode.workspace.fs.writeFile(document.uri, document.uint8data);
	}

	public saveCustomDocumentAs(document: MagebookDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
		//if (cancellation.isCancellationRequested)	return;
		return vscode.workspace.fs.writeFile(destination, document.uint8data);
	}

	public async revertCustomDocument(document: MagebookDocument, cancellation: vscode.CancellationToken): Promise<void> {
		return ;//document.revert(cancellation);
	}

	public async backupCustomDocument(document: MagebookDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
	
		await this.saveCustomDocumentAs(document, context.destination, cancellation);

		return {
			id: context.destination.toString(),
			delete: async () => {
				try {
					await vscode.workspace.fs.delete(context.destination);
				} catch {
					// noop
				}
			}
		};

	}


}