import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Settings } from './settings/settings';
import { Loot } from './loot/loot';
import { Log } from './log/log';

export const routes: Routes = [
  { path: "",component: Home},
  { path: "settings",component: Settings},
  { path: "log",component: Log},
  { path: "loot",component: Loot},
];
