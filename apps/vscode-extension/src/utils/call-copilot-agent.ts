import type { PromptRequest } from '@stagewise/extension-toolbar-srpc-contract';
import * as vscode from 'vscode';

export async function callCopilotAgent(request: PromptRequest): Promise<void> {
  const prompt =
    `${request.prompt}` +
    `${request.files ? `\n\n use the following files: ${request.files.join('\n')}` : ''}` +
    `${request.images ? `\n\n use the following images: ${request.images.join('\n')}` : ''}`;

  await vscode.commands.executeCommand('workbench.action.chat.openagent');
  await vscode.commands.executeCommand('workbench.action.chat.sendToNewChat', {
    inputValue: prompt,
  });
}
