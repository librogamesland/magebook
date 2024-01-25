import * as vscode from 'vscode';
import { MagebookEditorProvider, MagebookSymbolProvider } from './magebookEditor';



export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('magebook.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Magebook!');
	}));

	// Currently not working
	//context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ "pattern": "*.mage.md" }, new MagebookSymbolProvider());
	
	context.subscriptions.push(MagebookEditorProvider.register(context));
}



export function deactivate() {}
