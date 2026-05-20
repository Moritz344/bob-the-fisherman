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
  auth: string
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
  public currentSelected = signal<currentSelectedType>({port: 0,username: "",version: "",auth: "",host: ""});
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
  }


  ngOnInit(): void {
    this.currentSelected.set(this.settings.getSettings());
    console.log("got",this.currentSelected());
  }


}
