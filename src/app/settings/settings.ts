import { Component,signal,inject,OnInit } from '@angular/core';
import { Leftbar } from '../leftbar/leftbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../settings-service';
import { currentSelectedType } from '../models/current.model';

@Component({
  selector: 'app-settings',
  imports: [Leftbar,FormsModule,CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit{
  public settings = inject(SettingsService);
  public currentSelected = signal<currentSelectedType>({port: 3000,username: "Bob",version: "1.21.11",auth: "offline",host: "localhost"});
  public versionData = signal([]);

  constructor() {
    this.initVersions();
  }

  ngOnInit(): void {
    this.initCurrentSelected();
  }

  initCurrentSelected() {
    this.currentSelected.set({
      host: this.settings.getSettings().host,
      auth: this.settings.getSettings().auth,
      version: this.settings.getSettings().version,
      username: this.settings.getSettings().username,
      port: this.settings.getSettings().port,
      started: this.settings.getStarted()
    });
    console.log("settings got:",this.currentSelected());
  }

  onChooseMode() {
    console.log(this.currentSelected().auth);
    // 46685



  }

  async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

  save() {
    this.settings.saveSettings(this.currentSelected());
  }
}
