"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const magebookEditor_1 = require("./magebookEditor");
function activate(context) {
    console.log('Congratulations, your extension "magebook" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('magebook.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Magebook!');
    }));
    context.subscriptions.push(magebookEditor_1.MagebookEditorProvider.register(context));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map