import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';
import { bingoGameGuard } from './features/bingo-game/presentation/bingo-game.guard';
import { BingoGameService } from './features/bingo-game/application/bingo-game.service';
import { BoardConfigurationService } from './features/board-configuration/application/board-configuration.service';
import { ArchiveOverviewService } from './features/archive/application/archive-overview.service';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'edit',
    providers: [BoardConfigurationService],
    loadComponent: () => import('./features/board-configuration/presentation/board-configuration.component').then(m => m.BoardConfigurationComponent),
  },
  {
    path: 'play',
    canActivate: [bingoGameGuard],
    providers: [BingoGameService],
    loadComponent: () => import('./features/bingo-game/presentation/bingo-game.component').then(m => m.BingoGameComponent),
  },
  {
    path: 'archive',
    providers: [ArchiveOverviewService],
    loadComponent: () => import('./features/archive/presentation/archive.component').then(m => m.ArchiveComponent),
  },
];
