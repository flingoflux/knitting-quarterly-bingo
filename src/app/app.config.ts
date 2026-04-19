import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BoardDefinitionRepositoryService } from './features/board-studio/state/board-definition-repository.service';
import { BOARD_DEFINITION_READER } from './shared/ports/board-definition-reader';
import { IndexedDbImageRepository } from './core/services/indexed-db-image-repository.service';
import { IMAGE_REPOSITORY } from './shared/ports/image-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: BOARD_DEFINITION_READER, useExisting: BoardDefinitionRepositoryService },
    { provide: IMAGE_REPOSITORY, useExisting: IndexedDbImageRepository },
  ],
};
