import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';
import { bingoGameGuard } from './features/bingo-game/presentation/bingo-game.guard';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'edit',
    loadComponent: () => import('./features/board-configuration/presentation/board-configuration.component').then(m => m.BoardConfigurationComponent),
  },
  {
    path: 'play',
    canActivate: [bingoGameGuard],
    loadComponent: () => import('./features/bingo-game/presentation/bingo-game.component').then(m => m.BingoGameComponent),
  },
];
