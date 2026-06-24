import { Component,OnInit,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatLog } from '../chat-log/chat-log';
import { Topbar } from '../topbar/topbar';
import { SettingsService } from '../settings-service';


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
  public logs = this.settings.logs;

  constructor() {
    this.initBotSettings();
  }

  async initBotSettings() {
    const settings = await this.settings.getLastBotSettings();
    console.log("settings:",settings);
    settings.started = false;
    this.currentSelected.set(settings);

    const settingsAction = await this.settings.getLastBotActionSettings();
    this.currentSelectedActionSettings.set(settingsAction)
  }

  async onStart() {
    console.log(this.currentSelected());
    this.started.update( (x: boolean) => !x );
    if (this.started()) {
      await this.settings.startBot(this.currentSelected());
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
      const playerToFollow = command.split(" ")[1];
      if (playerToFollow) {
        this.onFollowPlayer(playerToFollow);
      }
    }
  }

  async onStopFishing() {
    this.isFollowingPlayer.set(false);
    this.isLookingForWater.set(false);

    this.currentBotTask.set("Nothing");

    await this.settings.stopFishing();
    this.isFishing.set(false);
  }

  async onStartFishing() {
    this.isFollowingPlayer.set(false);
    this.isLookingForWater.set(false);
    this.currentBotTask.set("Fishing");

    this.isFishing.set(true);

    await this.settings.startFishing();
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

    this.currentBotTask.set("Nothing");

    this.settings.stopFollowingPlayer();
    this.isFollowingPlayer.set(false);
  }

  async onFollowPlayer(name: string) {
    if (this.isFollowingPlayer()) {
      return;
    }
    this.currentBotTask.set("Following");
    this.isLookingForWater.set(false);
    this.isFishing.set(false);

    if (!this.isFollowingPlayer()) {
      await this.settings.followPlayer(name);
    }
    this.isFollowingPlayer.set(true);

  }
  ngOnInit(): void {
    this.started.set(this.started());

  }


}
