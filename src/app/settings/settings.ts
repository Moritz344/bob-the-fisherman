import { Component,signal,inject } from '@angular/core';
import { Leftbar } from '../leftbar/leftbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings-service';

interface currentSelectedType{
  host: string,
  port: number,
  username: string,
  version: string,
  auth: string
}

@Component({
  selector: 'app-settings',
  imports: [Leftbar,FormsModule,CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  public settings = inject(SettingsService);
  public currentSelected = signal<currentSelectedType>({port: 0,username: "",version: "",auth: "",host: ""});
  public versionData = signal([]);

  constructor() {
    this.initCurrentSelected();
    this.initVersions();
  }

  initCurrentSelected() {
    this.currentSelected.set({
      host: "localhost",
      auth: "offline",
      version: "1.21.11",
      username: "Bob",
      port: 3000
    });
  }

  async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

  save() {
    this.settings.saveSettings(this.currentSelected());
  }
}
