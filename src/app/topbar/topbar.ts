import { Component,signal,OnInit,inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings-service';
import { Menu } from './menu/menu';


@Component({
  selector: 'app-topbar',
  imports: [Menu],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  router = inject(Router);
  settings = inject(SettingsService);
  public currentSelectedTab = this.settings.currentTab;
  public menuSelected = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
  }

  async onMinimize() {
    await this.settings.minimizeWindow();
  }

  onMenu() {
    this.menuSelected.update(x => !x);
  }

  onClose() {
    this.settings.exit();
  }

  onTab(tab: string) {
    this.currentSelectedTab.set(tab);
    this.settings.goto(tab);
  }


}
