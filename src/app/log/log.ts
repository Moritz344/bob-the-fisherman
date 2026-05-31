import { Component } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { ChatLog } from '../chat-log/chat-log';

// TODO: Search for logs

@Component({
  selector: 'app-log',
  imports: [Topbar,ChatLog],
  templateUrl: './log.html',
  styleUrl: './log.css',
})
export class Log {

}
