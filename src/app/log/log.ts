import { Component } from '@angular/core';
import { Leftbar } from '../leftbar/leftbar';
import { ChatLog } from '../chat-log/chat-log';

// TODO: Search for logs

@Component({
  selector: 'app-log',
  imports: [Leftbar,ChatLog],
  templateUrl: './log.html',
  styleUrl: './log.css',
})
export class Log {

}
