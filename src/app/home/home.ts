import { Component,OnInit,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatLog } from '../chat-log/chat-log';
import { Topbar } from '../topbar/topbar';
import { SettingsService } from '../settings-service';

// TODO: type in chat-log commands like !start,!stop etc? 

@Component({
  selector: 'app-home',
  imports: [ChatLog,Topbar,CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public settings = inject(SettingsService);

  public started = this.settings.started;
  public currentSelected = this.settings.settingsSelected;
  public currentSelectedActionSettings = this.settings.settingsActionSelected;
  public versionData = signal([]);

  public isFishing = signal<boolean>(false);
  public isFollowingPlayer = signal<boolean>(false);
  public isLookingForWater = signal<boolean>(false);

  public currentMode = signal<string>("");

  constructor() {
    this.initBotSettings();
  }

  async initBotSettings() {
    const settings = await this.settings.getLastBotSettings();
    settings.started = false;
    this.currentSelected.set(settings);

    const settingsAction = await this.settings.getLastBotActionSettings();
    console.log(settingsAction);
    this.currentSelectedActionSettings.set(settingsAction)
  }

  async onStart() {
    console.log(this.currentSelected());
    this.started.update( (x: boolean) => !x );
    if (this.started()) {
      let p = await this.settings.startBot(this.currentSelected());
      console.log("started:",p);
      await this.settings.initLootItems();
    } else {
      await this.settings.stopBot();
    }
  }

  async onStartFishing() {
    if (!this.isFishing()) {
      this.settings.startFishing();
      console.log("fish!");
    }
    this.isFishing.update( (x: boolean) => !x);
  }

  async onFindWater() {
    this.isLookingForWater.update( (x: boolean) => !x);
    if (!this.isLookingForWater()) {

    }

  }

  onSelectMode(mode: string) {
    this.currentMode.set(mode);
    console.log(this.currentMode());

    switch (this.currentMode()) {
      case "fishing":
        this.onStartFishing()
        break;
      case "find_water":
        break;
      case "follow_player":
        break;
      default:
        break;
    }

  }

  async onFollowPlayer() {
    this.isFollowingPlayer.update( (x: boolean) => !x);
    if (!this.isFollowingPlayer()) {

    }

  }


  ngOnInit(): void {
    console.log("current state",this.currentSelected().started);
    this.started.set(this.started());

  }


}
