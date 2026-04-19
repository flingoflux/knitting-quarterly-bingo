# Play-Board Feature

Dieses Feature kapselt alle Komponenten und Services für den Spielmodus des Bingo-Boards.

- Komponenten: `play-board.component.ts`, `components/playable-board.component.ts`
- State-Fassade: `state/play-board-state.service.ts`
- Guard: `play-board.guard.ts`
- Zentrale Datenquelle: `core/services/board-store.service.ts`

## Datenfluss

- Der Container `play-board.component.ts` liest `projects`, `done` und `bingoCells` aus dem zentralen Board-Store (via State-Service).
- Togglen eines Felds schreibt direkt in den Board-Store und persistiert den Zustand.
- Die Route `/play` ist per Guard geschützt und leitet ohne bestehendes Board nach `/edit` um.
