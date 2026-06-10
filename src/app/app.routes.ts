import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: "",loadComponent: () => import("./home/home").then(m => m.Home)},
  { path: "settings", loadComponent: () => import("./settings/settings").then(h => h.Settings)},
  { path: "log",loadComponent: () => import("./log/log").then(l => l.Log)},
  { path: "loot",loadComponent: () => import("./loot/loot").then(l => l.Loot)},
];
