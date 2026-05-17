import { Component } from '@angular/core';
import { ChatLog } from '../chat-log/chat-log';
import { Leftbar } from '../leftbar/leftbar';

@Component({
  selector: 'app-home',
  imports: [ChatLog,Leftbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
