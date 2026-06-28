import { Component,Output,EventEmitter,signal,Injector,OnInit,ElementRef,inject,ViewChild,ViewChildren,QueryList,afterNextRender,effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { SettingsService } from '../settings-service';

interface BotCommand {
  name: string,
  desc: string,
  onlyCli: boolean
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

  public commandsToUse = signal<BotCommand[]>([]);
  public foundCommands = signal<BotCommand[]>([]);

  public searchValue = signal<string>("");

  constructor() {
    this.initBotCommands();
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

  async initBotCommands() {
    const commands = await this.settings.getBotCommands();
    console.log(commands)
    this.commandsToUse.set(commands.filter((cmd: BotCommand) => !cmd.onlyCli));
    console.log("bot cmd",this.commandsToUse());
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

    this.foundCommands.set(this.commandsToUse().filter((x: any) => x.name.includes(this.commandInput()) ));

    if (this.commandInput() == "") {
      this.foundCommands.set([]);
    }
  }

  onCommand() {
    if (!this.started()) {
      return;
    }

    const input = this.commandInput().trim();
    const cmd = input.split(" ")[0];

    switch (cmd) {
      case "start":
        this.command.emit("start");
        break;
      case "stop":
        this.command.emit("stop");
        break;
      case "follow":
        const splitCommand = this.commandInput().split(" ");
        let player = splitCommand[1];
        if (!player) {
          player = "";
        }
        this.command.emit(cmd + " " + player);
        break;
      case "help":
        this.settings.sendLog("Commands: " + this.commandsToUse());
        break;
      case "deposit":
        this.command.emit("deposit");
        break;
      default:
        break;
    }

   this.commandInput.set("");
  }

  ngOnInit(): void {
  }

}
