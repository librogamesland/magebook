import * as vscode from 'vscode';
import { MagebookEditorProvider } from './magebookEditor';



export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "magebook" is now active!');


	context.subscriptions.push(vscode.commands.registerCommand('magebook.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Magebook!');
	}));
	context.subscriptions.push(MagebookEditorProvider.register(context));
}



export function deactivate() {}
