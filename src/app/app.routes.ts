import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Settings } from './settings/settings';
import { Loot } from './loot/loot';

export const routes: Routes = [
  { path: "",component: Home},
  { path: "settings",component: Settings},
  { path: "loot",component: Loot}
];
