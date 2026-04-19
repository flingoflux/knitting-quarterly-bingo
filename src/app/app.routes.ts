import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'edit',
    loadComponent: () => import('./features/edit-board/edit-board.component').then(m => m.EditBoardFeatureComponent),
  },
  {
    path: 'play',
    loadComponent: () => import('./features/play-board/play-board.component').then(m => m.PlayBoardFeatureComponent),
  },
];
