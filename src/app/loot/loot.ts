import { Component,inject,OnInit,signal } from '@angular/core';
import { Leftbar } from '../leftbar/leftbar';
import { SettingsService } from '../settings-service';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-loot',
  imports: [Leftbar,NgOptimizedImage],
  templateUrl: './loot.html',
  styleUrl: './loot.css',
})
export class Loot implements OnInit {
  public settings = inject(SettingsService);
  public items = this.settings.caughtItems;

  constructor() {
  }



  ngOnInit() {
    console.log("loot:",this.items());

  }

}
