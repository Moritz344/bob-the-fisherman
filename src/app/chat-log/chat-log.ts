import { Component,signal,OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-log',
  imports: [],
  templateUrl: './chat-log.html',
  styleUrl: './chat-log.css',
})
export class ChatLog implements OnInit{
  public data = signal<string[]>([]);

  constructor() {}

  ngOnInit(): void {
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
    this.data().push("[Information] Caught 'Salmon'");
  }

}
