import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';
import { playBingoGuard } from './features/play-bingo/play-bingo.guard';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'edit',
    loadComponent: () => import('./features/board-studio/board-studio.component').then(m => m.BoardStudioFeatureComponent),
  },
  {
    path: 'play',
    canActivate: [playBingoGuard],
    loadComponent: () => import('./features/play-bingo/play-bingo.component').then(m => m.PlayBingoFeatureComponent),
  },
];
