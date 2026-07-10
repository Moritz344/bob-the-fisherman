import { Injectable,inject,signal,computed } from '@angular/core';
import { Subject,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { currentSelectedType,currentSelectedActionType } from './models/current.model';

interface LogMessage {
  msg: string,
  level: 'info' | 'warn' | 'error' | 'loot',
  timestamp: string,

  // loot log
  img?: string | null,
  count?: number,
  name?: string,
  displayName?: string
}

interface SkinData {
  username: string,
  texture: string
}

interface Loot {
  img: string | null,
  count: number,
  name: string,
  displayName: string

}


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  router = inject(Router);
  public started = signal<boolean>(false);
  public currentTab = signal<string>("");
  public currentTask = signal<string>("Nothing");

  public logs = signal<LogMessage[]>([]);
  public error = computed( () => this.logs().filter((log: LogMessage) => log.level == 'error'));
  public loot = signal<LogMessage[]>([]);

  public settingsSelected = signal<currentSelectedType>({
    username: "fishermanbob69",
    host: "localhost",
    version: "1.21.11",
    auth: "offline",
    port: 0,
    started: false
  });

  public skinData = signal<SkinData>({ username: "",texture: ""});

  public settingsActionSelected = signal<currentSelectedActionType>({
    waterMaxDistance: 10,
    playerToFollow: ""
  })



  constructor() {
    this.initGameLogs();
    this.initBotSkinData();
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

  async stopCurrentTask(task: string) {
    return await (window as any).electronAPI.stopCurrentTask(task);
  }

  async followPlayer(name: string) {
    return await (window as any).electronAPI.followPlayer(name);
  }

  async sendMinecraftChatMessage(message: string) {
    return await (window as any).electronAPI.sendMinecraftChatMessage(message);
  }

  async stopFollowingPlayer() {
    return await (window as any).electronAPI.stopFollowing();
  }

  async dropLoot(itemName: string) {
    this.loot.update(list => list.filter(item => item.name !== itemName));
    return await (window as any).electronAPI.dropLoot(itemName);
  }

  async showHelp() {
    return await (window as any).electronAPI.showHelp();
  }

  async findWater() {
    return await (window as any).electronAPI.findWater();
  }

  async depositLoot() {
    return await (window as any).electronAPI.depositLoot();
  }


  async getBotCommands() {
    return await (window as any).electronAPI.getBotCommands();
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
    this.loot.set(unique_items);
  }

  async saveActionSettings(data: currentSelectedActionType) {
    this.settingsActionSelected.set(data);
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

  async updateLootLog(entry: LogMessage) {
      const itemAlreadyExists = this.loot().find((x: any) => x.name == entry.name);
      if (!itemAlreadyExists) {
        entry.img = await this.getItemImage(entry.name || "");
      }
      this.loot.update((list: any) => {
        if (itemAlreadyExists) {
          return list.map((x: any) => x.name == entry.name ? { ...x, count: x.count + 1 } : x);
        }
        return [...list,entry];
      });
  }

  async initBotSkinData() {
    (window as any).electronAPI.botSkinData((data: { texture: string,username: string}) => {
      if (this.settingsSelected().auth == "offline") {
        this.skinData.set({ texture: "404.png",username: data.username});
        return;
      }
      this.skinData.set(data);
    })
  }

  private async initGameLogs() {
      (window as any).electronAPI.log(async(entry: LogMessage) => {
        if (entry.level == "loot") {
          this.updateLootLog(entry);
        }
        if (entry.level == "error") {
          this.started.set(false);
        }
        this.logs.update(list => [...list,entry]);
    });

  }

  public goto(route: string) {
    this.router.navigate([route]);
  }

}
