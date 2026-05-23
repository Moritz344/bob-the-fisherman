import { Component,signal,OnInit,inject } from '@angular/core';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-chat-log',
  imports: [],
  templateUrl: './chat-log.html',
  styleUrl: './chat-log.css',
})
export class ChatLog implements OnInit{
  settings = inject(SettingsService);
  public data = this.settings.logs;

  constructor() {}

  ngOnInit(): void {
    //this.data.set(this.settings.getCurrentLogs());
    //console.log("logs chat c:",this.data());
  }

}
