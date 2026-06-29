import { Component,signal,inject,OnInit } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { SettingsService } from '../settings-service';
import { currentSelectedType,currentSelectedActionType } from '../models/current.model';
import {form, FormField, FormRoot,required} from '@angular/forms/signals';

@Component({
  selector: 'app-settings',
  imports: [Topbar,FormField,FormRoot],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit{
  public settingsModel = signal<currentSelectedType>({
    port: 0,
    username: "Bob",
    version: "1.21.11",
    auth: "offline",
    host: "localhost",
    started: false
  })
  public settings = inject(SettingsService);

  public currentSelectedAction = signal<currentSelectedActionType>({playerToFollow: "",waterMaxDistance: 10});

  public versionData = signal<string[]>([]);
  public formError = signal<boolean>(false);
  public saved = signal<boolean>(false);

  public settingsForm = form(this.settingsModel, (field) => {
    required(field.host, { message: 'Please enter a hostname!' });
    required(field.username, { message: 'Please enter a username!' });
  });

  constructor() {
  }

  ngOnInit(): void {
    this.initCurrentSelected();
    this.initVersions();
  }

  initCurrentSelected() {
    const generalSettings = this.settings.getSettings();
    this.settingsModel.set({
      host: generalSettings.host,
      auth: generalSettings.auth,
      version: generalSettings.version,
      username: generalSettings.username,
      port: generalSettings.port,
      started: this.settings.getStarted()
    });

    //const actionSettings = this.settings.getActionSettings();
    //this.currentSelectedAction.set({
    //  playerToFollow: actionSettings.playerToFollow,
    //  waterMaxDistance: actionSettings.waterMaxDistance,
    //});
  }

   async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

  saveBotActionSettings() {
    this.settings.saveActionSettings(this.currentSelectedAction());
  }

  saveBotGeneralSettings() {
    if (this.settingsForm().invalid()) {
      return;
    }

    this.saved.set(true);
    this.settings.saveSettings(this.settingsModel());
  }
}
