import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Settings } from './settings/settings';

export const routes: Routes = [
  { path: "",component: Home},
  { path: "settings",component: Settings}
];
