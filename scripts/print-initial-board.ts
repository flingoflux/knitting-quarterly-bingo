import { BingoService } from '../src/app/features/bingo/bingo';
import { BingoStateService } from '../src/app/features/bingo/bingo-state.service';

// Mock StorageService
class DummyStorage {
  getItem() { return null; }
  setItem() {}
}

const bingoService = new BingoService(new DummyStorage() as any);
const stateService = new BingoStateService(bingoService);

console.log('Projekte:', stateService.state.board.getProjects());
console.log('Done:', stateService.state.board.getDone());
console.log('BingoLines:', stateService.state.board.getBingoLines());
