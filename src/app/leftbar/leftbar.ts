import { Component,signal,OnInit,inject } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-leftbar',
  imports: [],
  templateUrl: './leftbar.html',
  styleUrl: './leftbar.css',
})
export class Leftbar implements OnInit {
  router = inject(Router);
  settings = inject(SettingsService);
  public currentSelectedTab = signal<string>("");

  constructor() {}

  ngOnInit(): void {
  }


  onTab(tab: string) {
    this.currentSelectedTab.set(tab);
    this.settings.goto(tab);
  }


}
