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
  public started = signal<boolean>(false);

  public settingsSelected = signal<currentSelectedType>({
    username: "fishermanbob69",
    host: "localhost",
    version: "1.21.11",
    auth: "offline",
    port: 46685,
    started: false
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

  public setStarted(value: boolean) {
    console.log("started value",value);
    this.started.set(value);
  }

  public getStarted() {
    return this.started();
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

  private async initGameLogs() {
    (window as any).electronAPI.gameLogs((msg: string) => {
      this.logs.update((old: string[]) => [...old,msg]);
    });
  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
