import { ConsoleDataMap } from './types';
import * as vscode from 'vscode';
import { isConsoleLogCorrect } from './utils';
import { isInsideConsoleLog } from './utils/isInsideConsoleLog';

// Remove commented consoles
export const removeDecorations = (
  editor: vscode.TextDocumentChangeEvent,
  consoleDataMap: ConsoleDataMap
) => {
  // Get the file path of the current editor
  const filePath = editor.document.uri.fsPath;

  for (const [file, positionsMap] of consoleDataMap) {
    if (filePath.endsWith(file)) {
      for (const [position] of positionsMap) {
        const line = parseInt(position) - 1;
        const lineText = editor.document.lineAt(line).text;

        // if console.log is commented, delete
        if (!isConsoleLogCorrect(lineText) && positionsMap.has(position)) {
          positionsMap.delete(position);
          continue;
        }

        const change = editor.contentChanges.find((change) => change.range.start.line === line);
        // if no considence change, continue
        if (!change) continue;

        const start = change.range.start.character;
        // if change inside of the console.log, delete
        if (isInsideConsoleLog(lineText, start)) positionsMap.delete(position);
      }
      if (positionsMap.size === 0) consoleDataMap.delete(file);
    }
  }
};
