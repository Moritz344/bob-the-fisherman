import { Component,inject,effect } from '@angular/core';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  settings = inject(SettingsService);
  public botError = this.settings.error;
  constructor() {
     effect(() => {
       console.log("error");
       console.log("ALERT",this.botError());
    });
  }

  onClose() {
    this.botError.set({title: '',msg: '',error: false});
  }

  ngOnInit() {
  }

}
