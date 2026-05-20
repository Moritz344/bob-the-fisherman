import { Injectable,inject,signal } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

interface currentSelectedType{
  host: string,
  port: number,
  username: string,
  version: string,
  auth: string
}
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  router = inject(Router);
  public logs = new Subject<any>;

  public settingsSelected = signal<currentSelectedType>({
    username: "",
    host: "",
    version: "",
    auth: "",
    port: 0
  });

  constructor() {
    this.initGameLogs();
  }

  public saveSettings(data: any) {
    this.settingsSelected.set(data);
    console.log(this.settingsSelected());
  }

  public getSettings() {
    return this.settingsSelected();
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

  private async initGameLogs() {
    (window as any).electronAPI.gameLogs((logs: string) => {
      this.logs.next(logs);
    });
  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
