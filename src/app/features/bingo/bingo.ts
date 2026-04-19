import { Injectable } from '@angular/core';

export interface Project {
  title: string;
  cat: string;
  catKey: string;
}

@Injectable({ providedIn: 'root' })
export class BingoService {

  STORAGE_KEY = 'bingo_state_angular';

  lines = [
    [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
    [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
    [0,5,10,15],[3,6,9,12]
  ];

  defaultProjects: Project[] = [
    { title:"Socken stricken",cat:"Basics",catKey:"basics"},
    { title:"Neues Garn",cat:"Challenge",catKey:"challenge"},
    { title:"Zopfmuster",cat:"Technik",catKey:"technik"},
    { title:"Schal",cat:"Accessoire",catKey:"accessoire"},
    { title:"Maschenprobe",cat:"Basics",catKey:"basics"},
    { title:"Färben",cat:"Challenge",catKey:"challenge"},
    { title:"Farbverlauf",cat:"Technik",catKey:"technik"},
    { title:"Spitze",cat:"Technik",catKey:"technik"},
    { title:"Handschuhe",cat:"Accessoire",catKey:"accessoire"},
    { title:"Eigenes Muster",cat:"Challenge",catKey:"challenge"},
    { title:"Rundnadel",cat:"Basics",catKey:"basics"},
    { title:"Intarsia",cat:"Technik",catKey:"technik"},
    { title:"Verschenken",cat:"Challenge",catKey:"challenge"},
    { title:"Restgarn",cat:"Challenge",catKey:"challenge"},
    { title:"Pullover",cat:"Basics",catKey:"basics"},
    { title:"Garn wechseln",cat:"Accessoire",catKey:"accessoire"}
  ];

  load() {
    const s = localStorage.getItem(this.STORAGE_KEY);
    if (s) return JSON.parse(s);
    return {
      projects: [...this.defaultProjects],
      done: new Array(16).fill(false)
    };
  }

  save(state:any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  getBingoLines(done:boolean[]) {
    return this.lines.filter(line => line.every(i => done[i]));
  }

  shuffleBoard() {
    const pool = [...this.defaultProjects];

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return {
      projects: pool.slice(0,16),
      done: new Array(16).fill(false)
    };
  }
}