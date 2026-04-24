import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { EnsureQuarterRolloverUseCase } from './core/application/ensure-quarter-rollover.use-case';
import { ENSURE_QUARTER_ROLLOVER_IN_PORT } from './core/application/ports/in/ensure-quarter-rollover.in-port';
import { LocalStorageQuarterlyPlanRepository } from './features/quarterly-plan/infrastructure/local-storage-quarterly-plan.repository';
import { QUARTERLY_PLAN_READER, QUARTERLY_PLAN_WRITER } from './features/quarterly-plan/domain/quarterly-plan.repository';
import { LOAD_QUARTERLY_PLAN_OUT_PORT } from './features/quarterly-plan/application/ports/out/load-quarterly-plan.out-port';
import { PERSIST_QUARTERLY_PLAN_OUT_PORT } from './features/quarterly-plan/application/ports/out/persist-quarterly-plan.out-port';
import { LocalStorageBingoGameRepository } from './features/bingo-game/infrastructure/local-storage-bingo-game.repository';
import { BINGO_GAME_REPOSITORY } from './features/bingo-game/domain/bingo-game.repository';
import { LOAD_BINGO_PROGRESS_OUT_PORT } from './features/bingo-game/application/ports/out/load-bingo-progress.out-port';
import { PERSIST_BINGO_PROGRESS_OUT_PORT } from './features/bingo-game/application/ports/out/persist-bingo-progress.out-port';
import { ARCHIVE_REPOSITORY } from './features/archive/domain/archive.repository';
import { LocalStorageArchiveRepository } from './features/archive/infrastructure/local-storage-archive.repository';
import { LOAD_ARCHIVE_ENTRIES_OUT_PORT } from './features/archive/application/ports/out/load-archive-entries.out-port';
import { IndexedDbImageRepository } from './core/infrastructure/indexed-db-image-repository.service';
import { IMAGE_REPOSITORY } from './shared/ports/image-repository';
import { LocalStorageUserSettingsRepository } from './features/user-settings/infrastructure/local-storage-user-settings.repository';
import { USER_SETTINGS_REPOSITORY } from './features/user-settings/domain/user-settings.repository';
import { LOAD_BOARD_VIEW_MODE_OUT_PORT } from './features/user-settings/application/ports/out/load-board-view-mode.out-port';
import { PERSIST_BOARD_VIEW_MODE_OUT_PORT } from './features/user-settings/application/ports/out/persist-board-view-mode.out-port';
import { MANAGE_USER_SETTINGS_IN_PORT } from './features/user-settings/application/ports/in/manage-user-settings.in-port';
import { ManageUserSettingsUseCase } from './features/user-settings/application/manage-user-settings.use-case';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: ENSURE_QUARTER_ROLLOVER_IN_PORT, useExisting: EnsureQuarterRolloverUseCase },
    { provide: QUARTERLY_PLAN_READER, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: QUARTERLY_PLAN_WRITER, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: LOAD_QUARTERLY_PLAN_OUT_PORT, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: PERSIST_QUARTERLY_PLAN_OUT_PORT, useExisting: LocalStorageQuarterlyPlanRepository },
    { provide: BINGO_GAME_REPOSITORY, useExisting: LocalStorageBingoGameRepository },
    { provide: LOAD_BINGO_PROGRESS_OUT_PORT, useExisting: LocalStorageBingoGameRepository },
    { provide: PERSIST_BINGO_PROGRESS_OUT_PORT, useExisting: LocalStorageBingoGameRepository },
    { provide: ARCHIVE_REPOSITORY, useExisting: LocalStorageArchiveRepository },
    { provide: LOAD_ARCHIVE_ENTRIES_OUT_PORT, useExisting: LocalStorageArchiveRepository },
    { provide: IMAGE_REPOSITORY, useExisting: IndexedDbImageRepository },
    { provide: USER_SETTINGS_REPOSITORY, useExisting: LocalStorageUserSettingsRepository },
    { provide: LOAD_BOARD_VIEW_MODE_OUT_PORT, useExisting: LocalStorageUserSettingsRepository },
    { provide: PERSIST_BOARD_VIEW_MODE_OUT_PORT, useExisting: LocalStorageUserSettingsRepository },
    { provide: MANAGE_USER_SETTINGS_IN_PORT, useExisting: ManageUserSettingsUseCase },
  ],
};
