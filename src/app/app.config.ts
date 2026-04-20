import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocalStorageBoardRepository } from './features/board-configuration/infrastructure/local-storage-board.repository';
import { BOARD_DEFINITION_READER, BOARD_DEFINITION_WRITER } from './features/board-configuration/domain/board-definition.repository';
import { LocalStorageBingoGameRepository } from './features/bingo-game/infrastructure/local-storage-bingo-game.repository';
import { BINGO_GAME_REPOSITORY } from './features/bingo-game/domain/bingo-game.repository';
import { IndexedDbImageRepository } from './core/services/indexed-db-image-repository.service';
import { IMAGE_REPOSITORY } from './shared/ports/image-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: BOARD_DEFINITION_READER, useExisting: LocalStorageBoardRepository },
    { provide: BOARD_DEFINITION_WRITER, useExisting: LocalStorageBoardRepository },
    { provide: BINGO_GAME_REPOSITORY, useExisting: LocalStorageBingoGameRepository },
    { provide: IMAGE_REPOSITORY, useExisting: IndexedDbImageRepository },
  ],
};
