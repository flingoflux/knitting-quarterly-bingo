import { StartPageComponent } from './start-page.component';
import { Routes } from '@angular/router';
import { BingoGameService } from './features/bingo-game/application/bingo-game.service';
import { BoardConfigurationService } from './features/board-configuration/application/board-configuration.service';
import { ArchiveOverviewService } from './features/archive/application/archive-overview.service';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'quarterly',
    providers: [BingoGameService, BoardConfigurationService],
    loadComponent: () => import('./shared/ui/templates/quarterly-view/quarterly-view.component').then(m => m.QuarterlyViewComponent),
  },
  {
    path: 'play',
    redirectTo: 'quarterly',
    pathMatch: 'full',
  },
  {
    path: 'edit',
    redirectTo: 'quarterly',
    pathMatch: 'full',
  },
  {
    path: 'archive',
    providers: [ArchiveOverviewService],
    loadComponent: () => import('./features/archive/presentation/archive.component').then(m => m.ArchiveComponent),
  },
];
