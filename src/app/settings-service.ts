import { Injectable,inject,signal } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { currentSelectedType } from './models/current.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  router = inject(Router);
  public logs = signal<string[]>([""]);
  public errorLogs = signal<string[]>([""]);
  public started = signal<boolean>(false);
  public currentTab = signal<string>("");

  public settingsSelected = signal<currentSelectedType>({
    username: "fishermanbob69",
    host: "localhost",
    version: "1.21.11",
    auth: "offline",
    port: 46685,
    started: false
  });

  public caughtItems = signal<string[]>([""]);


  constructor() {
    this.initGameLogs();
  }

  async saveSettings(data: any) {
    this.settingsSelected.set(data);
    console.log(this.settingsSelected());
    return await (window as any).electronAPI.saveBotSettings(data);
  }

  public getSettings() {
    return this.settingsSelected();
  }

  public setStarted(value: boolean) {
    console.log("started value",value);
    this.started.set(value);
  }

  public getStarted() {
    return this.started();
  }


  async getLastBotSettings() {
    return await (window as any).electronAPI.getBotSettings();
  }

  async getVersions() {
    return await (window as any).electronAPI.getMinecraftVersions();
  }

  async startBot(data: {host: string,port: number,version: string,auth: string,username: string }) {
    return await (window as any).electronAPI.startBot(data.host,data.port,data.version,data.auth,data.username);
  }

  async stopBot() {
    return await (window as any).electronAPI.stopBot();
  }

  public getCurrentLogs() {
    return this.logs();
  }

  public showFormsError(msg: string) {
  (window as any).electronAPI.showError("Forms Error", msg);
  }

  private async initGameLogs() {
      (window as any).electronAPI.gameLogs((msg: string) => {
        this.logs.update((old: string[]) => [...old,msg]);
      });

      (window as any).electronAPI.botError((msg: string) => {
      (window as any).electronAPI.showError("Bot Error", msg);
              this.logs.update((old: string[]) => [...old, "[ERROR] " + msg   ]);
              this.started.set(false);
      });

      (window as any).electronAPI.loot((msg: string) => {
        const item: any = msg.split("Caught").at(-1);
        this.caughtItems.update( (items: string[]) => [...items,item]);
        this.logs.update( (old: string[]) => [...old,msg]);
        console.log(this.caughtItems());
      });
  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
