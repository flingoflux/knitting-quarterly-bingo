# Edit-Board Feature

Dieses Feature kapselt alle Komponenten und Services fuer den Editiermodus des Bingo-Boards.

- Komponenten: `edit-board.component.ts`, `components/editable-board.component.ts`
- State-Fassade: `state/edit-board-state.service.ts`
- Fachliche Domäne: `domain/board-definition.ts`
- Persistenz: `state/board-definition-repository.service.ts`

## Datenfluss

- Der Container `edit-board.component.ts` liest `projects` aus dem EditBoard-Context (via State-Service).
- Drag-and-drop und Shuffle schreiben nur in die Board-Definition.
- Das Feature persistiert die Board-Definition getrennt vom Spielstand.
