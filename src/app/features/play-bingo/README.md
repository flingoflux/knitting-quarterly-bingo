# Play-Bingo Feature

Dieses Feature kapselt alle Komponenten und Services fuer den Spielmodus des Bingo-Boards.

- Komponenten: `play-bingo.component.ts`, `components/playable-board.component.ts`
- State-Fassade: `state/play-bingo-state.service.ts`
- Fachliche Domäne: `domain/bingo-game.ts`
- Persistenz: `state/bingo-game-repository.service.ts`
- Guard: `play-bingo.guard.ts`

## Datenfluss

- Der Container `play-bingo.component.ts` liest `projects`, `done` und `bingoCells` aus dem PlayBingo-Context.
- Beim Start wird die Board-Definition aus dem EditBoard-Context geladen.
- Der Spielstand wird getrennt gespeichert und bei geaenderter Board-Signatur automatisch zurueckgesetzt.
- Die Route `/play` ist per Guard geschuetzt und leitet ohne bestehende Board-Definition nach `/edit` um.
