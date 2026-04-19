import { Injectable } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { shuffleArray } from '../../shared/utils/array-utils';

export interface Project {
  title: string;
  cat: string;
  catKey: string;
}

@Injectable({ providedIn: 'root' })
export class BingoService {
  STORAGE_KEY_EDITABLE = 'bingo_editable_board';
  STORAGE_KEY_PLAYABLE = 'bingo_playable_board';
  constructor(private storage: StorageService) {}

  lines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12],
  ];

  defaultProjects: Project[] = [
    { title: 'Socken stricken', cat: 'Basics', catKey: 'basics' },
    { title: 'Neues Garn', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Zopfmuster', cat: 'Technik', catKey: 'technik' },
    { title: 'Schal', cat: 'Accessoire', catKey: 'accessoire' },
    { title: 'Maschenprobe', cat: 'Basics', catKey: 'basics' },
    { title: 'Färben', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Farbverlauf', cat: 'Technik', catKey: 'technik' },
    { title: 'Spitze', cat: 'Technik', catKey: 'technik' },
    { title: 'Handschuhe', cat: 'Accessoire', catKey: 'accessoire' },
    { title: 'Eigenes Muster', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Rundnadel', cat: 'Basics', catKey: 'basics' },
    { title: 'Intarsia', cat: 'Technik', catKey: 'technik' },
    { title: 'Verschenken', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Restgarn', cat: 'Challenge', catKey: 'challenge' },
    { title: 'Pullover', cat: 'Basics', catKey: 'basics' },
    { title: 'Garn wechseln', cat: 'Accessoire', catKey: 'accessoire' },
  ];

  loadEditable() {
    return this.storage.getItem<{ projects: Project[]; done: boolean[] }>(
      this.STORAGE_KEY_EDITABLE,
      () => ({
        projects: [...this.defaultProjects],
        done: new Array(16).fill(false),
      })
    );
  }

  saveEditable(state: { projects: Project[]; done: boolean[] }) {
    this.storage.setItem(this.STORAGE_KEY_EDITABLE, state);
  }

  loadPlayable() {
    return this.storage.getItem<{ projects: Project[]; done: boolean[] }>(
      this.STORAGE_KEY_PLAYABLE,
      () => ({
        projects: [...this.defaultProjects],
        done: new Array(16).fill(false),
      })
    );
  }

  savePlayable(state: { projects: Project[]; done: boolean[] }) {
    this.storage.setItem(this.STORAGE_KEY_PLAYABLE, state);
  }

  getBingoLines(done: boolean[]) {
    return this.lines.filter((line) => line.every((i) => done[i]));
  }

  shuffleBoard() {
    const shuffled = shuffleArray(this.defaultProjects);
    return {
      projects: shuffled.slice(0, 16),
      done: new Array(16).fill(false),
    };
  }
}
