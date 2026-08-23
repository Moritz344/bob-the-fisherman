import { Component, EventEmitter,Output,inject } from '@angular/core';
import { SettingsService } from '../../settings-service';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  @Output() close = new EventEmitter<void>();

  private settings = inject(SettingsService);

  constructor() {}

  onClose() {
    this.close.emit();
  }

  onAbout() {
    this.settings.openAbout();
  }

  onExitProgram() {
    this.settings.exit();
  }

}
