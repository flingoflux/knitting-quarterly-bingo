# Knitting Quarterly Bingo

![CI](https://github.com/flingoflux/knitting-quarterly-bingo/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/flingoflux/knitting-quarterly-bingo/graph/badge.svg)](https://codecov.io/gh/flingoflux/knitting-quarterly-bingo)

## Projektüberblick

Knitting Quarterly Bingo ist eine Angular-Webanwendung fuer ein persoenliches 4x4-Quartalsboard rund ums Stricken. Planung, aktives Spielen, Archiv und Druckansicht laufen komplett im Browser ohne Backend.

## Dokumentation

- Architektur (arc42): `docs/arc42.md`
- Architekturdiagramme: `docs/diagrams/`

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

   Die App ist dann unter <http://localhost:4200> erreichbar.

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
- Testkoerper sind mit `// given`, `// when`, `// then` gegliedert.
- Wenn es keinen eigenen Aktionsschritt gibt, werden `// when` und `// then` zu `// when + then` zusammengefasst.

### E2E-Konventionen (Playwright)

- Selektoren in E2E-Tests sollen bevorzugt `data-testid` nutzen statt sichtbarem Text.
- Namenskonvention für `data-testid`: `page-*` für Seitenanker/Titel, `action-*` für klickbare Aktionen, `state-*` für Zustandsanzeigen.
- Beispiel-IDs: `page-start-root`, `page-bingo-title`, `action-start-play`, `action-toolbar-home`, `state-toolbar-quarter-label`.
- Kritische Toolbar-Navigation ist standardisiert über `action-toolbar-home`, `action-toolbar-help`, `action-toolbar-quarter-prev`, `action-toolbar-quarter-next`.

Hinweis: Neue interaktive UI-Elemente sollten bei Implementierung direkt eine passende `data-testid` nach diesem Schema erhalten.

Die Smoke-Suite deckt die Kernfluesse Start, Navigation, Quartalswechsel, Help/Home, Kompakt-Umschaltung und Print-Popup ab.

## Codequalität

- Linting: `pnpm lint` (ESLint)
- Formatierung: `pnpm format` (Prettier)
- Pre-commit-Hook prüft Linting & Formatierung automatisch

## Features

- **Board planen** – Challenges per Drag & Drop anordnen, würfeln und mit Inspirationsfotos versehen
- **Bingo spielen** – Challenges abhaken, Fortschrittsfotos hochladen, Bingo-Linien erkennen
- **Jetzt spielen** – Plan eines zukünftigen Quartals direkt als Bingo starten (Play-Button im Planungsboard, mit Sicherheitsabfrage)
- **Archiv** – abgeschlossene Quartale werden automatisch archiviert
- **Einstellungen** – Board-Ansicht (Polaroid / Kompakt) umschalten
- **Druckansicht** – Bingo-Board als eigene Print-Ansicht (`/quarterly-print`) mit mode-abhaengiger Seitenausrichtung drucken

## Projektstruktur

- `src/app/core/` – zentrale Services, z.B. für Datenhaltung
- `src/app/features/` – Feature-Module und Komponenten
- `src/app/shared/` – geteilte Komponenten, Pipes, etc.

## Lizenz

Dieses Projekt steht unter der **Apache License 2.0**.
Siehe [LICENSE](LICENSE) im Repository-Root.

**Ausnahme:** Das Logo und andere Markenzeichen (`assets/logo.svg`, `assets/flower.svg`, `assets/crown.svg`) sind urheberrechtlich geschützt und von der Apache-Lizenzierung ausgenommen. Alle Rechte vorbehalten. Eine Nutzung außerhalb des Projektkontexts erfordert ausdrückliche Genehmigung.

### Verwendete Drittkomponenten

Dieses Projekt verwendet folgende Open-Source-Komponenten:

- **Angular Framework** – MIT License (<https://angular.io>)
- **Feather Icons** – MIT License (<https://feathericons.com>) – SVG-Icon-Pfade als Inline-Definitionen
- Weitere Dependencies siehe `package.json` – alle unter MIT oder Apache 2.0

Drittanbieter-Abhängigkeiten behalten ihre jeweiligen eigenen Lizenzen.
