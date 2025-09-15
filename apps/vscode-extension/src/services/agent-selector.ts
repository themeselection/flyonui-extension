import * as vscode from 'vscode';
import { StorageService } from './storage-service';

export type PreferredAgent = 'ide-chat';

export class AgentSelectorService {
  private static instance: AgentSelectorService;
  private statusbar: vscode.StatusBarItem | undefined;
  private onAgentSelectionChanged:
    | ((agentName: PreferredAgent) => void)
    | undefined;
  private storageService: StorageService = StorageService.getInstance();

  private readonly PREFERRED_AGENT_STORAGE_KEY = 'flyonui.preferredAgent';

  private preferredAgent: PreferredAgent | undefined;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance() {
    if (!AgentSelectorService.instance) {
      AgentSelectorService.instance = new AgentSelectorService();
    }
    return AgentSelectorService.instance;
  }

  public async initialize() {
    this.statusbar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );

    this.statusbar.tooltip =
      'Set the preferred agent you want to use with FlyonUI';
    this.statusbar.command = 'flyonui.setAgent';
    this.updateStatusbarText('FlyonUI agent');
    this.statusbar.show();

    // load the preferred agent from the config
    this.preferredAgent = 'ide-chat';
  }

  public updateStatusbarText(text: string) {
    if (!this.statusbar) {
      return;
    }

    this.statusbar.text = `$(flyonui-icon) ${text}`;
  }

  public async showAgentPicker() {
    const agentPicker = vscode.window.createQuickPick();
    const items: vscode.QuickPickItem[] = [];

    items.push({
      label: '$(chat-editor-label-icon) Forward to IDE Chat',
      description: "Forward your messages to the IDE's chat agent.",
    });

    agentPicker.items = items;
    agentPicker.onDidChangeSelection(() => {
      if (this.onAgentSelectionChanged) {
        void this.setPreferredAgent('ide-chat');
      }
      agentPicker.hide();
    });
    agentPicker.show();
  }

  public onPreferredAgentChanged(
    callback: (agentName: PreferredAgent) => void,
  ) {
    this.onAgentSelectionChanged = callback;
  }

  public getPreferredAgent(): PreferredAgent {
    // TODO Return the agent that's in the config. If no agent is configured, return the stagewise agent.
    return 'ide-chat';
  }

  public async setPreferredAgent(agentName: PreferredAgent) {
    this.preferredAgent = agentName;
    await this.storageService.set(this.PREFERRED_AGENT_STORAGE_KEY, agentName);
    this.onAgentSelectionChanged?.(agentName);
  }
}
