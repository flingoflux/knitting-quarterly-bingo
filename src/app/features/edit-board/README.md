# Edit-Board Feature

Dieses Feature kapselt alle Komponenten und Services für den Editiermodus des Bingo-Boards.

- Komponenten: `edit-board.component.ts`, `components/editable-board.component.ts`
- State-Fassade: `state/edit-board-state.service.ts`
- Zentrale Datenquelle: `core/services/board-store.service.ts`

## Datenfluss

- Der Container `edit-board.component.ts` liest `projects` aus dem zentralen Board-Store (via State-Service).
- Drag-and-drop und Shuffle schreiben direkt in den Board-Store.
- Der Übergang nach `/play` erfolgt ohne Navigation-State; das Play-Feature liest aus derselben Store-Quelle.
