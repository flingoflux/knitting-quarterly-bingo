import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocalStorageQuarterlyPlanRepository } from './features/quarterly-plan/infrastructure/local-storage-quarterly-plan.repository';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from './features/quarterly-plan/domain/quarterly-plan.repository';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from './features/quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from './features/quarterly-plan/application/ports/out/persist-quarterly-plan.out-port';
import { LocalStorageBingoGameRepository } from './features/bingo-game/infrastructure/local-storage-bingo-game.repository';
import { BINGO_GAME_REPOSITORY } from './features/bingo-game/domain/bingo-game.repository';
import { ARCHIVE_REPOSITORY } from './features/archive/domain/archive.repository';
import { LocalStorageArchiveRepository } from './features/archive/infrastructure/local-storage-archive.repository';
import { IndexedDbImageRepository } from './core/infrastructure/indexed-db-image-repository.service';
import { IMAGE_REPOSITORY } from './shared/ports/image-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: QUARTERLY_PLAN_READER, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: QUARTERLY_PLAN_WRITER, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: LOAD_QUARTERLY_PLAN_OUT_PORT, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: PERSIST_QUARTERLY_PLAN_OUT_PORT, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: BINGO_GAME_REPOSITORY, useExisting: LocalStorageBingoGameRepository },
    { provide: ARCHIVE_REPOSITORY, useExisting: LocalStorageArchiveRepository },
    { provide: IMAGE_REPOSITORY, useExisting: IndexedDbImageRepository },
  ],
};
