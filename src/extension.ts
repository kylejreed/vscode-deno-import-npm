// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fetch from "node-fetch";
import { TextDecoder, TextEncoder } from "util";
import { NPM_BASE_URL } from "./constants";
import { NpmPackageResponse } from "./types";
import { moveToFront } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("deno-import-npm.add-package", async () => {
    const packageName = await vscode.window.showInputBox({ title: "Package name: " });

    const url = `${NPM_BASE_URL}/${packageName}`;
    const response = await fetch(url);
    if (response.status !== 200) {
      vscode.window.showErrorMessage(`${packageName} does not exist on NPM`);
      return;
    }

    const json = (await response.json()) as NpmPackageResponse;
    const allVersions = Object.keys(json.versions)
      .sort((a, b) => (a < b ? 1 : -1))
      .slice(0, 50);
    const { latest, next } = json["dist-tags"];
    moveToFront(allVersions, latest, next);

    const version = await vscode.window.showQuickPick(allVersions, {
      title: "Select a version",
      placeHolder: json["dist-tags"].latest,
    });

    if (!version) {
      return;
    }

    const wsUri = vscode.workspace.workspaceFolders![0].uri;
    const importMapUrl = vscode.Uri.joinPath(wsUri, "import_map.json");
    let hasImportMap = true;
    updateImportMap: try {
      await vscode.workspace.fs.stat(importMapUrl);
      const importMapContentsArray = await vscode.workspace.fs.readFile(importMapUrl);
      const importMapContents = new TextDecoder().decode(importMapContentsArray);
      const importMapJson = JSON.parse(importMapContents);

      if (importMapJson?.imports?.[json.name]) {
        break updateImportMap;
      }

      importMapJson.imports ??= {};
      importMapJson.imports[json.name] = `npm:${json.name}@${version}`;

      vscode.workspace.fs.writeFile(importMapUrl, new TextEncoder().encode(JSON.stringify(importMapJson, null, 2)));
    } catch (e) {
      hasImportMap = false;
    }

    let importIdx = 0;
    while (vscode.window.activeTextEditor?.document.lineAt(importIdx).text.startsWith("import")) {
      ++importIdx;
    }

    if (!vscode.window.activeTextEditor) {
      return;
    }

    const from = hasImportMap ? json.name : `npm:${json.name}@${version}`;
    await vscode.window.activeTextEditor?.edit((e) => {
      e.insert(new vscode.Position(importIdx, 0), `import ${json.name} from "${from}";`);
    });
    vscode.window.activeTextEditor.selection = new vscode.Selection(
      new vscode.Position(importIdx, 7),
      new vscode.Position(importIdx, 7 + json.name.length)
    );

    await vscode.commands.executeCommand("deno.cache");

    vscode.window.showInformationMessage(`${json.name}@${version} added`);
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
