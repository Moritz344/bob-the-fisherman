import { Component,Output,EventEmitter,signal,Injector,OnInit,ElementRef,inject,ViewChild,ViewChildren,QueryList,afterNextRender,effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { SettingsService } from '../settings-service';

// TODO: send minecraft chat messages

interface BotCommand {
  name: string,
  desc: string,
  onlyCli: boolean,
  args: string[]
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
  public currentBotTask = this.settings.currentTask;


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
    this.commandsToUse.set(commands.filter((cmd: BotCommand) => !cmd.onlyCli));
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

    this.foundCommands.set(this.commandsToUse().filter((x: any) => x.name.includes(this.commandInput().trim())));

    if (this.commandInput() == "") {
      this.foundCommands.set([]);
    }
  }


  onCommand() {
    if (!this.started()) {
      return;
    }

    const input = this.commandInput().trim();
    const commandName = input.split(" ")[0];
    const command = input.split(" ");

    switch (commandName) {
      case "!start":
        this.settings.stopCurrentTask(this.currentBotTask());
        this.currentBotTask.set("Fishing");
        this.settings.startFishing();
        break;
      case "!stop":
        this.settings.stopCurrentTask(this.currentBotTask());
        this.currentBotTask.set("Nothing");
        break;
      case "!follow":
        this.settings.stopCurrentTask(this.currentBotTask());
        const splitCommand = this.commandInput().split(" ");
        let player = splitCommand[1];
        if (!player) {
          this.currentBotTask.set("Nothing");
          return;
        }
        this.currentBotTask.set("Following");
        this.settings.followPlayer(player);
        break;
      case "!help":
        this.settings.showHelp();
        break;
      case "!deposit":
        this.settings.stopCurrentTask(this.currentBotTask());
        this.currentBotTask.set("Depositing");
        this.settings.depositLoot();
        break;
      case "!drop":
        this.settings.stopCurrentTask(this.currentBotTask());
        this.currentBotTask.set("Drop");
        this.settings.dropLoot(command[1]);
        break;
      default:
        break;
    }

   this.commandInput.set("");
  }

  ngOnInit(): void {
  }

}
