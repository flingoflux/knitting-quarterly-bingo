import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';
import { playBoardGuard } from './features/play-board/play-board.guard';

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
    canActivate: [playBoardGuard],
    loadComponent: () => import('./features/play-board/play-board.component').then(m => m.PlayBoardFeatureComponent),
  },
];
