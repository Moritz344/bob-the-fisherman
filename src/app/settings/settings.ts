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
  public formError = signal<boolean>(false);
  public saved = signal<boolean>(false);

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



  }

  async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

  save() {
    if (!this.currentSelected().host || this.currentSelected().host == "") {
      this.settings.showFormsError("Server ist Pflichtfeld!");
      return;
    } else if (!this.currentSelected().port || this.currentSelected().port == 0) {
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
    this.saved.set(true);
    this.settings.saveSettings(this.currentSelected());
  }
}
