
# Examino – Interaktive Klausurvorbereitung mit Gamification

Examino ist eine moderne Web-App, mit der du dich gezielt, motiviert und spielerisch auf deine Klausuren vorbereiten kannst. Wähle Themengebiete, Testdauer und Schwierigkeitsgrad, beantworte Fragen im Prüfungsmodus und sammle Erfolge. Die Anwendung bietet Statistiken, Levelsystem und zahlreiche Gamification-Elemente, um das Lernen effektiv und unterhaltsam zu gestalten.

## 🚀 Features

- Themenauswahl und flexibler Prüfungsmodus
- Fortschrittsanzeige, Levelsystem und Erfahrungspunkte (XP)
- 19 Achievements (Erfolge) für besondere Leistungen
- Streak-System für tägliche Motivation
- Übersichtliche Statistiken und Auswertungen
- Animierte XP- und Achievement-Anzeigen
- Persistenz aller Daten im Browser (localStorage)
- Moderne, responsive Benutzeroberfläche

## 🎮 Gamification-System (Kurzüberblick)

- **Level-System:** XP für richtige Antworten, Bonus für hohe Scores und Geschwindigkeit, Levelaufstieg nach Formel
- **Achievements:** 19 Erfolge für Tests, Geschwindigkeit, Streaks, Level, Kategorien und Perfektion
- **Streaks:** Belohnung für tägliches Üben ohne Unterbrechung
- **Statistiken:** Fortschritt, Scores, Streaks, XP, Tests pro Kategorie u.v.m.

Weitere Details findest du in [GAMIFICATION.md](GAMIFICATION.md).

## 🛠️ Entwicklung & Nutzung

### Entwicklung starten

```bash
ng serve
```
Öffne dann [http://localhost:4200/](http://localhost:4200/) im Browser. Die App lädt automatisch neu bei Änderungen.

### Komponenten generieren

```bash
ng generate component component-name
```
Weitere Schematics findest du mit:
```bash
ng generate --help
```

### Build für Produktion

```bash
ng build
```
Das Build landet im `dist/`-Verzeichnis und ist für Performance optimiert.

### Unit-Tests ausführen

```bash
ng test
```
Verwendet [Vitest](https://vitest.dev/) als Test Runner.

### End-to-End-Tests

```bash
ng e2e
```
Ein E2E-Framework kann nach Bedarf ergänzt werden.

## ℹ️ Weitere Ressourcen

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [GAMIFICATION.md](GAMIFICATION.md) – Details zum Gamification-System

---

**Ideal für Studierende, die sich gezielt und motiviert auf Prüfungen vorbereiten möchten!**
