import { Component,inject,OnInit } from '@angular/core';
import { Leftbar } from '../leftbar/leftbar';
import { SettingsService } from '../settings-service';

@Component({
  selector: 'app-loot',
  imports: [Leftbar],
  templateUrl: './loot.html',
  styleUrl: './loot.css',
})
export class Loot implements OnInit {
  public settings = inject(SettingsService);
  public items = this.settings.caughtItems;

  constructor() {
  }


  ngOnInit() {
    console.log(this.items());

  }

}
