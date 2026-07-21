import { Component,signal,OnInit,inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  router = inject(Router);
  settings = inject(SettingsService);
  public currentSelectedTab = this.settings.currentTab;

  constructor() {}

  ngOnInit(): void {
  }

  onClose() {
    this.settings.exit();
  }

  onTab(tab: string) {
    this.currentSelectedTab.set(tab);
    this.settings.goto(tab);
  }


}
