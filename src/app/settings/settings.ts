import { Component,signal,inject,OnInit } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings-service';
import { currentSelectedType,currentSelectedActionType } from '../models/current.model';

@Component({
  selector: 'app-settings',
  imports: [Topbar,FormsModule,CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit{
  public settings = inject(SettingsService);
  public currentSelected = signal<currentSelectedType>({port: 0,username: "Bob",version: "1.21.11",auth: "offline",host: "localhost"});
  public currentSelectedAction = signal<currentSelectedActionType>({playerToFollow: "",waterMaxDistance: 10});
  public versionData = signal([]);
  public formError = signal<boolean>(false);
  public saved = signal<boolean>(false);

  constructor() {
    this.initVersions();
  }

  ngOnInit(): void {
    this.initCurrentSelected();
  }

  initCurrentSelected() {
    const generalSettings = this.settings.getSettings();
    this.currentSelected.set({
      host: generalSettings.host,
      auth: generalSettings.auth,
      version: generalSettings.version,
      username: generalSettings.username,
      port: generalSettings.port,
      started: this.settings.getStarted()
    });

    const actionSettings = this.settings.getActionSettings();
    this.currentSelectedAction.set({
      playerToFollow: actionSettings.playerToFollow,
      waterMaxDistance: actionSettings.waterMaxDistance,
    });
    console.log("settings got:",this.currentSelectedAction());
  }

  onChooseMode() {
    console.log(this.currentSelected().auth);
  }

  async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

  saveBotActionSettings() {
    this.settings.saveActionSettings(this.currentSelectedAction());
  }

  saveBotGeneralSettings() {
    if (!this.currentSelected().host || this.currentSelected().host == "") {
      this.settings.showFormsError("Server ist Pflichtfeld!");
      return;
    } else if (!this.currentSelected().port || this.currentSelected().port == 0 && this.currentSelected().auth == "offline") {
      this.settings.showFormsError("Port ist Pflichtfeld!");
      return;
    } else if (this.currentSelected().username == "") {
      if (this.currentSelected().auth == "offline") {
        this.settings.showFormsError("Please enter a name for the Bot. This can be any name since you selected the offline mode.");
      } else {
        this.settings.showFormsError("Please enter a name for the Bot. This has to be the name of your minecraft account.");
      }
      return;
    }
    if (this.currentSelected().auth == "microsoft") {
      this.currentSelected().port = 0;
    }
    this.saved.set(true);
    this.settings.saveSettings(this.currentSelected());
    console.log("saved",this.currentSelected());
  }
}
