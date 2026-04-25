import { StartPageComponent } from './features/start-page/presentation/start-page.component';
import { Routes } from '@angular/router';
import { PLAY_BINGO_IN_PORT } from './features/bingo-game/application/ports/in/play-bingo.in-port';
import { PlayBingoUseCase } from './features/bingo-game/application/play-bingo.use-case';
import { PLAN_QUARTERLY_IN_PORT } from './features/quarterly-plan/application/ports/in/plan-quarterly.in-port';
import { PlanQuarterlyUseCase } from './features/quarterly-plan/application/plan-quarterly.use-case';
import { START_BINGO_FROM_PLAN_IN_PORT } from './features/bingo-game/application/ports/in/start-bingo-from-plan.in-port';
import { StartBingoFromPlanUseCase } from './features/bingo-game/application/start-bingo-from-plan.use-case';
import { SHOW_ARCHIVE_OVERVIEW_IN_PORT } from './features/archive/application/ports/in/show-archive-overview.in-port';
import { ShowArchiveOverviewUseCase } from './features/archive/application/show-archive-overview.use-case';
import { ShowQuarterlyProgressUseCase } from './features/start-page/application/show-quarterly-progress.use-case';
import { SHOW_QUARTERLY_PROGRESS_IN_PORT } from './features/start-page/application/ports/in/show-quarterly-progress.in-port';

export const routes: Routes = [
  {
    path: '',
    providers: [
      ShowQuarterlyProgressUseCase,
      { provide: SHOW_QUARTERLY_PROGRESS_IN_PORT, useExisting: ShowQuarterlyProgressUseCase },
    ],
    component: StartPageComponent,
  },
  {
    path: 'quarterly',
    providers: [
      PlayBingoUseCase,
      { provide: PLAY_BINGO_IN_PORT, useExisting: PlayBingoUseCase },
      PlanQuarterlyUseCase,
      { provide: PLAN_QUARTERLY_IN_PORT, useExisting: PlanQuarterlyUseCase },
      StartBingoFromPlanUseCase,
      { provide: START_BINGO_FROM_PLAN_IN_PORT, useExisting: StartBingoFromPlanUseCase },
    ],
    loadComponent: () => import('./features/quarter-lifecycle/presentation/quarterly-view-page.component').then(m => m.QuarterlyViewPageComponent),
  },
  {
    path: 'quarterly-print',
    providers: [
      PlayBingoUseCase,
      { provide: PLAY_BINGO_IN_PORT, useExisting: PlayBingoUseCase },
    ],
    loadComponent: () => import('./features/bingo-game/presentation/print/bingo-board-print.component').then(m => m.BingoBoardPrintComponent),
  },
  {
    path: 'quarterly/print',
    redirectTo: 'quarterly-print',
    pathMatch: 'full',
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
    providers: [
      ShowArchiveOverviewUseCase,
      { provide: SHOW_ARCHIVE_OVERVIEW_IN_PORT, useExisting: ShowArchiveOverviewUseCase },
    ],
    loadComponent: () => import('./features/archive/presentation/archive.component').then(m => m.ArchiveComponent),
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/start-page/presentation/pages/how-it-works.component').then(m => m.HowItWorksComponent),
  },
];
