import { Injectable,inject,signal } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { currentSelectedType,currentSelectedActionType } from './models/current.model';

// TODO: track currentMode across routes

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  router = inject(Router);
  public logs = signal<{msg: string,time: string,type: string}[]>([]);
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

  public settingsActionSelected = signal<currentSelectedActionType>({
    waterMaxDistance: 10,
    playerToFollow: ""
  })

  public caughtItems = signal<{displayName: string,name: string,count: number,img: string}[]>([]);


  constructor() {
    this.initGameLogs();
  }

  async startFishing() {
    return await (window as any).electronAPI.startFishing();
  }

  async initLootItems() {
    const items = await (window as any).electronAPI.initLoot();
    const unique_items: any = [];
    items.forEach( (x: any) => {
      const exists = unique_items.find( (b: any) => b.name == x.name);
      if (exists) {
        const index = unique_items.indexOf(exists);
        unique_items[index].count = exists.count + x.count;
      }
      if (!exists) {
        unique_items.push(x);
      }
    })
    this.caughtItems.set(unique_items);
  }

  async saveActionSettings(data: currentSelectedActionType) {
    this.settingsActionSelected.set(data);
    console.log(this.settingsActionSelected());
    return await (window as any).electronAPI.saveBotActionSettings(data);
  }

  async getItemImage(name: string) {
    console.log("img for",name);
    const url = "https://atlas.playcdu.co/search/first/minecraft/" + name;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      return response.url;
  
    } catch (err) {
      console.log("Error getting img for item",err);
      return "";
    }
  
  }


  async saveSettings(data: any) {
    this.settingsSelected.set(data);
    console.log(this.settingsSelected());
    return await (window as any).electronAPI.saveBotSettings(data);
  }

  public getSettings() {
    return this.settingsSelected();
  }

  public getActionSettings() {
    return this.settingsActionSelected();
  }

  public setStarted(value: boolean) {
    console.log("started value",value);
    this.started.set(value);
  }

  public getStarted() {
    return this.started();
  }


  async getLastBotActionSettings() {
    return await (window as any).electronAPI.getActionSettings();
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
        const match = msg.match(/^(\d{2}:\d{2}:\d{2})\s+(.*)/);
        const time = match![1];
        const message = match![2];
        this.logs.update((old: {msg: string,time: string,type:string}[]) => [...old,{msg:message,time:time,type: "info"}]);
      });

      (window as any).electronAPI.botError((msg: string) => {
              this.logs.update((old: {msg: string,time: string,type:string}[]) => [...old, {msg: msg,time: "",type: "error"}]);
              this.started.set(false);
      (window as any).electronAPI.showError("Bot Error", msg);
      });

      (window as any).electronAPI.loot(async(loot: { name: string,displayName: string,count: number,img: string}) => {
        console.log("loot",loot);
          const exists = this.caughtItems().find(x => x.name === loot.name);
          if (!exists) {
            loot.img = await this.getItemImage(loot.name);
            console.log("new loot get img for item! ");
          }

        this.caughtItems.update( (items: {displayName: string,name: string,count: number,img: string}[]) => {
          const found = items.find( (x: any) => x.name == loot.name);
          console.log("loot exists",exists);
          if (found) {
            return items.map((x) =>
              x.name === loot.name ? { ...x,count: x.count + 1 }: x,
            );
          }

          return [...items,loot];
        });
        console.log(this.caughtItems());
      });
  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
