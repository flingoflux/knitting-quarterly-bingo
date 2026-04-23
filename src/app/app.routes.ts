import { StartPageComponent } from './features/start-page/presentation/pages/start-page.component';
import { Routes } from '@angular/router';
import { BingoGameService } from './features/bingo-game/application/bingo-game.service';
import { PLAN_QUARTERLY_IN_PORT } from './features/quarterly-plan/application/ports/in/plan-quarterly.in-port';
import { PlanQuarterlyUseCase } from './features/quarterly-plan/application/plan-quarterly.use-case';
import { ArchiveOverviewService } from './features/archive/application/archive-overview.service';

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
  },
  {
    path: 'quarterly',
    providers: [
      BingoGameService,
      PlanQuarterlyUseCase,
      { provide: PLAN_QUARTERLY_IN_PORT, useExisting: PlanQuarterlyUseCase },
    ],
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
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/start-page/presentation/pages/how-it-works.component').then(m => m.HowItWorksComponent),
  },
];
