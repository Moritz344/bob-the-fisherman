import { Component,OnInit,signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatLog } from '../chat-log/chat-log';
import { Leftbar } from '../leftbar/leftbar';
import { Settings } from '../settings';

interface currentSelectedType{
  host: string,
  port: number,
  username: string,
  version: string,
  auth: string
}

@Component({
  selector: 'app-home',
  imports: [ChatLog,Leftbar,CommonModule,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  public settings = inject(Settings);

  public started = signal<boolean>(false);
  public currentSelected = signal<currentSelectedType>({port: 0,username: "",version: "",auth: "",host: ""});
  public versionData = signal([]);
  // 36147

  constructor() {
    this.initCurrentSelected();
  }

  onStart() {
    console.log(this.currentSelected());
    this.started.update( (x: boolean) => !x );
    if (this.started()) {
      this.settings.startBot(this.currentSelected());
    } else {
      this.settings.stopBot();
    }
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

  ngOnInit(): void {
    (async () => {
      await this.initVersions();
    })();
  }

  async initVersions() {
    const data = await this.settings.getVersions();
    this.versionData.set(data.reverse());
  }

}
