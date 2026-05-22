import { Component,OnInit,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatLog } from '../chat-log/chat-log';
import { Leftbar } from '../leftbar/leftbar';
import { SettingsService } from '../settings-service';

interface currentSelectedType{
  host: string,
  port: number,
  username: string,
  version: string,
  auth: string,
  started: boolean
}

@Component({
  selector: 'app-home',
  imports: [ChatLog,Leftbar,CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public settings = inject(SettingsService);

  public started = signal<boolean>(false);
  public currentSelected = signal<currentSelectedType>({port: 0,username: "",version: "",auth: "",host: "",started: false});
  public versionData = signal([]);
  // 36147

  constructor() {
  }

  onStart() {
    console.log(this.currentSelected());
    this.started.update( (x: boolean) => !x );
    if (this.started()) {
      this.settings.startBot(this.currentSelected());
    } else {
      this.settings.stopBot();
    }
    this.settings.setStarted(this.started());
  }


  ngOnInit(): void {
    this.currentSelected.set(({
      auth: this.settings.getSettings().auth,
      username: this.settings.getSettings().username,
      host: this.settings.getSettings().host,
      version: this.settings.getSettings().version,
      port: this.settings.getSettings().port,
      started: this.settings.getStarted()
    }))
    this.started.set(this.currentSelected().started);
    console.log("got",this.currentSelected());
  }


}
