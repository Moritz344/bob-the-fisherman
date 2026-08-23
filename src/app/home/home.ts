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

  public botSkinData = this.settings.skinData;

  constructor() {
    this.initBotSettings();
  }


  async initBotSettings() {
    const settings = await this.settings.getLastBotSettings();
    settings.started = false;
    this.currentSelected.set(settings);

    const settingsAction = await this.settings.getLastBotActionSettings();
    this.currentSelectedActionSettings.set(settingsAction)
  }

  async onStart() {
    this.started.update( (x: boolean) => !x );
    if (this.started()) {
      await this.settings.startBot(this.currentSelected());
    } else {
      await this.settings.stopBot();
    }
  }

  ngOnInit(): void {
    this.started.set(this.started());

  }


}
