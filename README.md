# Knitting Quarterly Bingo

![CI](https://github.com/flingoflux/knitting-quarterly-bingo/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/flingoflux/knitting-quarterly-bingo/graph/badge.svg)](https://codecov.io/gh/flingoflux/knitting-quarterly-bingo)

## Projektüberblick

Ein Angular-Projekt für ein Bingo-Spiel rund ums Stricken.

## Setup

1. **Abhängigkeiten installieren**

   ```sh
   pnpm install
   # oder
   npm install
   ```

2. **Entwicklungsserver starten**

   ```sh
   pnpm start
   # oder
   npm start
   ```

   Die App ist dann unter http://localhost:4200 erreichbar.

## Build für Produktion

```sh
pnpm build
# oder
npm run build
```

Das gebaute Projekt liegt im `dist/`-Ordner.

## Deployment

Das gebaute Verzeichnis `dist/` kann auf jedem statischen Webserver bereitgestellt werden.

## Testen

Unit-Tests werden mit [Vitest](https://vitest.dev/) ausgeführt:

```sh
pnpm test
```

E2E-Tests werden mit [Playwright](https://playwright.dev/) ausgeführt:

```sh
pnpm test:e2e
```

Interaktive E2E-Ausführung:

```sh
pnpm test:e2e:ui
```

### Unit-Test-Konventionen

Testnamen folgen dem Schema `should <erwartetes Verhalten> when/for/on/with <Kontext>`:

```ts
it('should load persisted progress when plan signature matches', () => {
  // given
  ...

  // when
  ...

  // then
  expect(...);
});
```

- Namen beginnen immer mit `should` und beschreiben das erwartete Verhalten.
- Der Kontext steht nach `when`, `for`, `on`, `with` oder `without`.
- Testnamen sind auf Englisch.
- Testköörper sind mit `// given`, `// when`, `// then` gegliedert.
- Wenn es keinen eigenen Aktionsschritt gibt, werden `// when` und `// then` zu `// when + then` zusammengefasst.

### E2E-Konventionen (Playwright)

- Selektoren in E2E-Tests sollen bevorzugt `data-testid` nutzen statt sichtbarem Text.
- Namenskonvention für `data-testid`: `page-*` für Seitenanker/Titel, `action-*` für klickbare Aktionen, `state-*` für Zustandsanzeigen.
- Beispiel-IDs: `page-start-root`, `page-bingo-title`, `action-start-play`, `action-toolbar-home`, `state-toolbar-quarter-label`.
- Kritische Toolbar-Navigation ist standardisiert über `action-toolbar-home`, `action-toolbar-help`, `action-toolbar-quarter-prev`, `action-toolbar-quarter-next`.

Hinweis: Neue interaktive UI-Elemente sollten bei Implementierung direkt eine passende `data-testid` nach diesem Schema erhalten.

Ein Beispieltest für den BingoService ist enthalten. Weitere Tests können in `src/**/*.spec.ts` ergänzt werden.

## Codequalität

- Linting: `pnpm lint` (ESLint)
- Formatierung: `pnpm format` (Prettier)
- Pre-commit-Hook prüft Linting & Formatierung automatisch

## Technische Verbesserungen (Stand 2026)

- Moderne Testumgebung: **Vitest** (statt Karma/Jasmine)
- Linting & Formatierung mit ESLint und Prettier
- Husky pre-commit-Hook für Codequalität
- Build & Tests laufen ohne Warnungen
- Projektstruktur nach Best Practices (core/features/shared)

Weitere Empfehlungen:

- Unit- und E2E-Tests ergänzen
- ggf. Barrierefreiheit (a11y) und Internationalisierung (i18n) prüfen
- README aktuell halten

## Projektstruktur

- `src/app/core/` – zentrale Services, z.B. für Datenhaltung
- `src/app/features/` – Feature-Module und Komponenten
- `src/app/shared/` – geteilte Komponenten, Pipes, etc.

## Entwicklungstipps

- Halte dich an Angular- und TypeScript-Best Practices
- Nutze Linting und Formatierung (z.B. ESLint, Prettier)
- Schreibe Unit- und E2E-Tests

## Verbesserungsvorschläge

Siehe Chatverlauf für technische Empfehlungen!
