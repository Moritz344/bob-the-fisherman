import { Component,Input,effect,signal,Injector,OnInit,ElementRef,inject,ViewChild,afterNextRender } from '@angular/core';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-chat-log',
  imports: [],
  templateUrl: './chat-log.html',
  styleUrl: './chat-log.css',
})
export class ChatLog implements OnInit{
  private injector = inject(Injector);
  settings = inject(SettingsService);
  public data = this.settings.logs;
  @ViewChild("container") container!: ElementRef;
  @ViewChild("messages") messages!: ElementRef;
  @Input() top = "70%";

  constructor() {
    afterNextRender( () => {
      this.container.nativeElement.style.top = this.top
    });

    effect(() => {
      this.data();
      afterNextRender(() => this.scrollToBottom(), { injector: this.injector });
    });


  }

  clear() {
    this.data.set([""]);
  }

  scrollToBottom() {
   const element = this.messages.nativeElement;
   if (element) {
    element.scrollTop = element.scrollHeight
   }
  }
  generateTestLogs() {
    for (let i=0;i<30;i++) {
      this.data.update( (x: any) => [...x, i])
    }
  }


  ngOnInit(): void {
  }

}
