import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocalStorageBoardRepository } from './features/board-configuration/infrastructure/local-storage-board.repository';
import { BOARD_DEFINITION_READER } from './features/board-configuration/domain/board-definition.repository';
import { IndexedDbImageRepository } from './core/services/indexed-db-image-repository.service';
import { IMAGE_REPOSITORY } from './shared/ports/image-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: BOARD_DEFINITION_READER, useExisting: LocalStorageBoardRepository },
    { provide: IMAGE_REPOSITORY, useExisting: IndexedDbImageRepository },
  ],
};
