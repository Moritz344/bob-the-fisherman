import { Component,inject,OnInit,signal } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { SettingsService } from '../settings-service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-loot',
  imports: [Topbar,NgOptimizedImage],
  templateUrl: './loot.html',
  styleUrl: './loot.css',
})
export class Loot implements OnInit {
  public settings = inject(SettingsService);
  public items = this.settings.loot;
  public started = this.settings.started;

  constructor() {
  }

  async onDrop(name: any) {
    await this.settings.dropLoot(name);
  }



  ngOnInit() {
      this.settings.initLootItems();

  }

}
