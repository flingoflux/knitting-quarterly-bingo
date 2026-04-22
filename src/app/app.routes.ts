import { StartPageComponent } from './features/start-page/presentation/pages/start-page.component';
import { Routes } from '@angular/router';
import { BingoGameService } from './features/bingo-game/application/bingo-game.service';
import { QuarterlyPlanService } from './features/quarterly-plan/application/quarterly-plan.service';
import { ArchiveOverviewService } from './features/archive/application/archive-overview.service';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'quarterly',
    providers: [BingoGameService, QuarterlyPlanService],
    loadComponent: () => import('./features/quarter-lifecycle/presentation/pages/quarterly-view-page.component').then(m => m.QuarterlyViewPageComponent),
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
