import { Component,Output,EventEmitter,signal,Injector,OnInit,ElementRef,inject,ViewChild,afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-chat-log',
  imports: [CommonModule,FormsModule],
  templateUrl: './chat-log.html',
  styleUrl: './chat-log.css',
})
export class ChatLog implements OnInit{
  private injector = inject(Injector);
  settings = inject(SettingsService);
  public data = this.settings.logs;
  @ViewChild("container") container!: ElementRef;
  @ViewChild("messages") messages!: ElementRef;
  @ViewChild("inputBox") input!: ElementRef;
  @Output() command = new EventEmitter<string>;

  public timeMsg: string = "";
  public msg: string = "";
  public commandInput = signal<string>("");
  public started = this.settings.started;

  constructor() {
    this.data();
    afterNextRender(() => this.scrollToBottom(), { injector: this.injector });
    afterNextRender(() => this.input.nativeElement.focus(), { injector: this.injector });

    console.log("data",this.data());

  }

  clear() {
    this.data.set([]);
  }

  scrollToBottom() {
   const element = this.messages.nativeElement;
   if (element) {
    element.scrollTop = element.scrollHeight
   }
  }
  generateTestLogs() {
    for (let i=0;i<10;i++) {
      this.data.update( (x: any) => [...x, {msg: "test" + i,time: "",type: "info"}])
    }
  }

  onCommand() {
    if (!this.started()) {
      return;
    }

    if (this.commandInput().trim() == "start") {
      this.command.emit("start");
      this.settings.startFishing();
    } else if (this.commandInput().trim() == "stop") {
      this.command.emit("stop");
    } else if (this.commandInput().split(" ")[0] == "follow") {
      const splitCommand = this.commandInput().split(" ");
      let player = splitCommand[1];
      if (!player) {
        player = "";
      }
      this.command.emit(splitCommand[0] + " " + player);
    } else if (this.commandInput().trim() == "help") {
      this.settings.sendLog("Available commands: start,stop,follow <name>");
    }
    this.commandInput.set("");
  }

  ngOnInit(): void {
  }

}
