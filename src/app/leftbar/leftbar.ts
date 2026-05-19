import { Component,signal,OnInit } from '@angular/core';

@Component({
  selector: 'app-leftbar',
  imports: [],
  templateUrl: './leftbar.html',
  styleUrl: './leftbar.css',
})
export class Leftbar implements OnInit {
  public currentSelectedTab = signal<string>("");

  constructor() {}

  ngOnInit(): void {
  }

  onTab(tab: string) {
    this.currentSelectedTab.set(tab);
  }

}
