import { Component,Output,EventEmitter,signal,Injector,OnInit,ElementRef,inject,ViewChild,ViewChildren,QueryList,afterNextRender,effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { SettingsService } from '../settings-service';

interface Command {
  command: string,
  description: string
}

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
  @ViewChildren("msg") messagesList!: QueryList<ElementRef>;
  @Output() command = new EventEmitter<string>;

  public timeMsg: string = "";
  public msg: string = "";
  public commandInput = signal<string>("");
  public started = this.settings.started;

  public commandsToUse = signal<Command[]>(
    [
      { command: "start",description: "Bot starts fishing" , },
      { command: "stop",description: "Stop Bot Task" , },
      { command: "follow",description: "Bot follows given player" , },
      { command: "deposit",description: "deposit loot" , },
  ]
  );
  public foundCommands = signal<Command[]>([]);

  public searchValue = signal<string>("");

  constructor() {
    effect(() => {
      this.data();
      this.scrollToBottom();
    })
    afterNextRender(() => this.scrollToBottom(), { injector: this.injector });
    afterNextRender(() => this.input.nativeElement.focus(), { injector: this.injector });

  }

  clear() {
    this.data.set([]);
  }

  scrollToBottom() {
   if (!this.messages) { return; }
   const element = this.messages.nativeElement;
   if (element) {
    element.scrollTop = element.scrollHeight
   }
  }

  generateTestLogs() {
    for (let i=0;i<50;i++) {
      this.data.update( (x: any) => [...x, {msg: "test" + i,time: "",type: "info"}])
    }
  }

  onSearchLogs() {
    const firstMatch = this.messagesList.find(el =>
      el.nativeElement.classList.contains('mark')
    );
    if (firstMatch) {
      firstMatch.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onPasteCommand(command: string) {
    this.foundCommands.set([]);
    this.commandInput.set(command);
  }

  onFindCommand() {
    if (!this.started()) {
      return;
    }

    this.foundCommands.set(this.commandsToUse().filter((x: any) => x.command.includes(this.commandInput()) ));

    if (this.commandInput() == "") {
      this.foundCommands.set([]);
    }
  }

  onCommand() {
    if (!this.started()) {
      return;
    }

    if (this.commandInput().trim() == "start") {
      this.command.emit("start");
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
      this.settings.sendLog("Available commands: " + this.commandsToUse());
    } else if (this.commandInput().trim() == "deposit") {
      this.command.emit("deposit");
    }
    this.commandInput.set("");
  }

  ngOnInit(): void {
  }

}
