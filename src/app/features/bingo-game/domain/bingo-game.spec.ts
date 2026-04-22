import { describe, expect, it } from 'vitest';
import { BingoGame, ChallengeProgress, createPlanSignature } from './bingo-game';

// 4x4 Spielfeld:
//  0  1  2  3
//  4  5  6  7
//  8  9 10 11
// 12 13 14 15

function makeCells(length = 16, imageIds?: (string | undefined)[]) {
  return Array.from({ length }, (_, i) => ({
    name: `C${i}`,
    imageId: imageIds?.[i],
  }));
}

describe('BingoGame.fromDefinition', () => {
  it('überträgt imageId als planningImageId', () => {
    const cells = makeCells(16, ['img-0', undefined, 'img-2']);

    const game = BingoGame.fromDefinition('2026-Q2', cells);

    expect(game.challenges[0].planningImageId).toBe('img-0');
    expect(game.challenges[1].planningImageId).toBeUndefined();
    expect(game.challenges[2].planningImageId).toBe('img-2');
  });

  it('setzt progressImageId initial auf undefined', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16, ['img-0']));

    expect(game.challenges[0].progressImageId).toBeUndefined();
  });

  it('startet mit allen Challenges nicht abgeschlossen', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    expect(game.completed.every(c => !c)).toBe(true);
  });
});

describe('BingoGame.restore', () => {
  it('übernimmt planningImageId aus gespeichertem Fortschritt', () => {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: 'saved-planning-img',
        progressImageId: undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    expect(game.challenges[0].planningImageId).toBe('saved-planning-img');
  });

  it('fällt auf cells[i].imageId zurück wenn planningImageId im Fortschritt fehlt', () => {
    const cells = makeCells(16, ['definition-img']);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    expect(game.challenges[0].planningImageId).toBe('definition-img');
  });

  it('behält progressImageId aus gespeichertem Fortschritt', () => {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: i === 0 ? 'progress-photo' : undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    expect(game.challenges[0].progressImageId).toBe('progress-photo');
    expect(game.challenges[1].progressImageId).toBeUndefined();
  });

  it('startet neu wenn Signatur nicht passt', () => {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: 'outdated-signature',
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    expect(game.completed.every(c => !c)).toBe(true);
  });
});

describe('BingoGame.toggle', () => {
  it('setzt Challenge auf abgeschlossen', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const toggled = game.toggle(0);

    expect(toggled.completed[0]).toBe(true);
  });

  it('zweimaliges Togglen kehrt Zustand zurück', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.toggle(0).toggle(0);

    expect(result.completed[0]).toBe(false);
  });

  it('lässt andere Challenges unberührt', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const toggled = game.toggle(5);

    expect(toggled.completed[4]).toBe(false);
    expect(toggled.completed[6]).toBe(false);
  });

  it('ignoriert ungültigen Index', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.toggle(99);

    expect(result.completed).toEqual(game.completed);
  });
});

describe('BingoGame.resetProgress', () => {
  it('setzt alle abgeschlossenen Challenges zurück', () => {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const reset = game.resetProgress();

    expect(reset.completed.every(c => !c)).toBe(true);
  });

  it('behält planningImageId und progressImageId nach Reset', () => {
    const cells = makeCells(16, ['plan-img']);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: i === 0 ? 'plan-img' : undefined,
        progressImageId: i === 0 ? 'progress-img' : undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const reset = game.resetProgress();

    expect(reset.challenges[0].planningImageId).toBe('plan-img');
    expect(reset.challenges[0].progressImageId).toBe('progress-img');
  });
});

describe('BingoGame.updateProgressImage', () => {
  it('setzt progressImageId für die Challenge', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const updated = game.updateProgressImage(0, 'new-photo');

    expect(updated.challenges[0].progressImageId).toBe('new-photo');
  });

  it('berührt planningImageId nicht', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16, ['plan-img']));

    const updated = game.updateProgressImage(0, 'new-photo');

    expect(updated.challenges[0].planningImageId).toBe('plan-img');
  });

  it('kann progressImageId auf undefined setzen', () => {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: i === 0 ? 'old-photo' : undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const updated = game.updateProgressImage(0, undefined);

    expect(updated.challenges[0].progressImageId).toBeUndefined();
  });

  it('ignoriert ungültigen Index', () => {
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.updateProgressImage(99, 'photo');

    expect(result.challenges).toEqual(game.challenges);
  });
});

describe('BingoGame.bingoCells', () => {
  function makeCompleted(trueIndices: number[], total = 16): boolean[] {
    return Array.from({ length: total }, (_, i) => trueIndices.includes(i));
  }

  function gameWithCompleted(trueIndices: number[]): BingoGame {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: trueIndices.includes(i),
      })),
      startedAt: new Date().toISOString(),
    };
    return BingoGame.restore(cells, saved);
  }

  it('liefert leeres Set ohne Bingo', () => {
    const game = gameWithCompleted([0, 1, 2]);

    expect(game.bingoCells.size).toBe(0);
  });

  it('erkennt Bingo in der ersten Spalte', () => {
    // Spalte 0: Indices 0, 4, 8, 12
    const game = gameWithCompleted([0, 4, 8, 12]);

    expect([0, 4, 8, 12].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(1)).toBe(false);
  });

  it('erkennt Bingo in der zweiten Zeile', () => {
    // Zeile 1: Indices 4, 5, 6, 7
    const game = gameWithCompleted([4, 5, 6, 7]);

    expect([4, 5, 6, 7].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(0)).toBe(false);
  });

  it('erkennt Bingo auf der Hauptdiagonale', () => {
    // Hauptdiagonale: 0, 5, 10, 15
    const game = gameWithCompleted([0, 5, 10, 15]);

    expect([0, 5, 10, 15].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(1)).toBe(false);
  });

  it('erkennt Bingo auf der Nebendiagonale', () => {
    // Nebendiagonale: 3, 6, 9, 12
    const game = gameWithCompleted([3, 6, 9, 12]);

    expect([3, 6, 9, 12].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(0)).toBe(false);
  });

  it('enthält Indices aus mehreren Bingo-Linien', () => {
    // Zeile 0 + Spalte 0 → Index 0 ist in beiden
    const game = gameWithCompleted([0, 1, 2, 3, 4, 8, 12]);

    expect([0, 1, 2, 3].every(i => game.bingoCells.has(i))).toBe(true);
    expect([0, 4, 8, 12].every(i => game.bingoCells.has(i))).toBe(true);
  });
});
