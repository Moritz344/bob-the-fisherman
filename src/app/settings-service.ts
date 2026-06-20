import { Injectable,inject,signal } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { currentSelectedType,currentSelectedActionType } from './models/current.model';


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  router = inject(Router);
  public logs = signal<{msg: string,time: string,type: string}[]>([]);
  public started = signal<boolean>(false);
  public currentTab = signal<string>("");
  public currentTask = signal<string>("Nothing");
  public error = signal<{title: string,msg: string,error: boolean}>({title: "",msg: "",error: false});

  public settingsSelected = signal<currentSelectedType>({
    username: "fishermanbob69",
    host: "localhost",
    version: "1.21.11",
    auth: "offline",
    port: 0,
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

  getLogTime() {
    const date = new Date();
    return date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") ;
}
  async startFishing() {
    return await (window as any).electronAPI.startFishing();
  }

  async stopFishing() {
    return await (window as any).electronAPI.stopFishing();
  }

  async followPlayer(name: string) {
    return await (window as any).electronAPI.followPlayer(name);
  }

  async stopFollowingPlayer() {
    return await (window as any).electronAPI.stopFollowing();
  }

  async findWater() {
    return await (window as any).electronAPI.findWater();
  }

  sendLog(msg: string,type?: string) {
    this.logs.update( (x: any) => [...x,{msg: msg,time: this.getLogTime(),type: (type) ? type : ""}])
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
        if (msg.includes("died")) {
          this.currentTask.set("Nothing");
        } else if (msg.includes("No fishing rod")) {
          this.currentTask.set("Nothing");
        }
        const match = msg.match(/^(\d{2}:\d{2}:\d{2})\s+(.*)/);
        let time = match![1];
        if (!time) {
          time = "";
        }
        let message = match![2];
        if (!message) {
          message = "";
        }
        this.logs.update((old: {msg: string,time: string,type:string}[]) => [...old,{msg:message,time:time,type: "info"}]);
      });

      (window as any).electronAPI.botError((msg: string) => {
        this.logs.update((old: {msg: string,time: string,type:string}[]) => [...old, {msg: msg,time: this.getLogTime(),type: "error"}]);
        this.currentTask.set("Nothing");
        this.started.set(false);
      });


      (window as any).electronAPI.loot(async(loot: { name: string,displayName: string,count: number,img: string}) => {
          this.logs.update((old: {msg: string,time: string,type:string}[]) => [...old,{msg:"Caught " + loot.displayName + "!" + " (" + loot.count   + ")",time:this.getLogTime(),type: "info"}]);
          const exists = this.caughtItems().find(x => x.name === loot.name);
          if (!exists) {
            loot.img = await this.getItemImage(loot.name);
          }

        this.caughtItems.update( (items: {displayName: string,name: string,count: number,img: string}[]) => {
          if (exists) {
            return items.map((x) =>
              x.name === loot.name ? { ...x,count: x.count + 1 }: x,
            );
          }

          return [...items,loot];
        });
      });
  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
