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

  public currentBotTask = this.settings.currentTask;

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

  onCommand(command: string) {
      console.log("COMMAND:",command);
    if (command == "start" ) {
      this.onStartFishing();
    } else if (command == "stop") {
      this.onStopFollowingPlayer();
      this.onStopFishing();
    } else if (command.includes("follow")) {
      let playerToFollow = command.split(" ")[1];
      console.log(playerToFollow);
      if (playerToFollow == '' || !playerToFollow) {
        playerToFollow = this.currentSelectedActionSettings().playerToFollow;
      }
      this.onFollowPlayer(playerToFollow);
    }
  }

  onStopFishing() {
    if (!this.isFishing()) {
      return;
    }
    this.isFollowingPlayer.set(false);
    this.isLookingForWater.set(false);

    this.settings.stopFishing();
    this.isFishing.set(false);
  }

  async onStartFishing() {
    this.isFollowingPlayer.set(false);
    this.isLookingForWater.set(false);

    await this.settings.startFishing();

    this.isFishing.set(true);
  }

  async onFindWater() {
    this.isFollowingPlayer.set(false);
    this.isFishing.set(false);

    await this.settings.findWater();
    this.isLookingForWater.update( (x: boolean) => !x);
  }

  onStopFollowingPlayer() {
    if (!this.isFollowingPlayer()) {
      return;
    }
    this.isLookingForWater.set(false);
    this.isFishing.set(false);

    this.settings.stopFollowingPlayer();
    this.isFollowingPlayer.set(false);
  }

  async onFollowPlayer(name: string) {
    this.isLookingForWater.set(false);
    this.isFishing.set(false);

    if (!this.isFollowingPlayer()) {
      await this.settings.followPlayer(name);
    }
    this.isFollowingPlayer.set(true);

  }
  ngOnInit(): void {
    console.log("current state",this.currentSelected().started);
    this.started.set(this.started());

  }


}
