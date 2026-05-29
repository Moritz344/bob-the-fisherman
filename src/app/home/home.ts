import { Component,OnInit,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatLog } from '../chat-log/chat-log';
import { Leftbar } from '../leftbar/leftbar';
import { SettingsService } from '../settings-service';

// TODO: type in chat-log commands like !start,!stop etc? 

@Component({
  selector: 'app-home',
  imports: [ChatLog,Leftbar,CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public settings = inject(SettingsService);

  public started = this.settings.started;
  public currentSelected = this.settings.settingsSelected;
  public versionData = signal([]);

  constructor() {
    this.initBotSettings();
  }

  async initBotSettings() {
    const settings = await this.settings.getLastBotSettings();
    settings.started = false;
    this.currentSelected.set(settings);
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


  ngOnInit(): void {
    console.log("current state",this.currentSelected().started);
    this.started.set(this.started());

  }


}
