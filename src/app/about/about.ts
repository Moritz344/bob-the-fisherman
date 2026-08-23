import { Component,inject,signal } from '@angular/core';
import { SettingsService } from '../settings-service'

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private electron = inject(SettingsService);

  public data = signal<any>({});

  constructor() {
    this.initData();
  }

  openGithub() {
    this.electron.openExternal("https://github.com/Moritz344");
  }

  onClose() {
    this.electron.closeAboutWindow();
  }

  async initData() {
    this.data.set(await this.electron.getAboutData());
    console.log(this.data());
  }

}
