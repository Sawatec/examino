# 🎮 Gamification System

Das Examino-System verfügt über ein vollständiges Gamification-System mit localStorage-Persistenz.

## Features

### 🌟 Level-System
- **XP-Berechnung**: 
  - 10 XP pro richtige Antwort
  - Bonus für hohe Scores: 100 XP (100%), 50 XP (90%+), 25 XP (70%+)
  - Bonus für Geschwindigkeit: 50 XP (<10 Min), 25 XP (<15 Min)
- **Level-Formel**: `Level = floor(sqrt(XP / 100)) + 1`
- **XP-Anzeige**: Fortschrittsbalken mit aktuellen XP / benötigte XP für nächstes Level

### 🏆 Achievement-System (19 Erfolge)

#### Test-basiert
- 🎯 **Erster Schritt**: Ersten Test abgeschlossen
- 💯 **Perfektionist**: 100% in einem Test
- 🌟 **Ausgezeichnet**: Mindestens 90%
- 🎓 **Gut vorbereitet**: Mindestens 70%
- 💪 **Bestanden**: Mindestens 50%
- 🏆 **Champion**: Alle Fragen richtig
- 🎖️ **Durchhalter**: Alle Fragen beantwortet

#### Geschwindigkeit
- ⚡ **Speedrunner**: Test in unter 10 Minuten
- 🚀 **Schnelldenker**: Test in unter 15 Minuten

#### Fortschritt
- 🔥 **Fleißig**: 5 Tests abgeschlossen
- 💎 **Engagiert**: 10 Tests abgeschlossen
- 📚 **Wissensjäger**: 100 Fragen beantwortet
- 🧠 **Meisterschüler**: 500 Fragen beantwortet

#### Streaks
- 📅 **3-Tage-Streak**: 3 Tage hintereinander geübt
- 🌈 **1-Wochen-Streak**: 7 Tage hintereinander geübt

#### Level
- ⭐ **Level 5**: Level 5 erreicht
- 🌟 **Level 10**: Level 10 erreicht

#### Kategorie
- 🎨 **Universalgelehrter**: Alle 10 Kategorien getestet

#### Perfektion
- 👑 **Meister**: 3 perfekte Scores

### 📊 Statistiken

#### Gesamtfortschritt
- **Totale Tests**: Anzahl absolvierte Tests
- **Totale Fragen**: Anzahl beantwortete Fragen
- **Beste Score**: Höchster erreichter Prozentsatz
- **Durchschnitt**: Durchschnittliche Erfolgsrate
- **Perfekte Tests**: Anzahl 100%-Tests
- **Aktuelle Streak**: Aufeinanderfolgende Tage mit Tests
- **Längste Streak**: Längste erreichte Streak
- **XP**: Gesammelte Erfahrungspunkte
- **Tests pro Kategorie**: Verteilung über alle Themengebiete

#### Test-Ergebnis
- **Kategorie-Statistiken**: Performance pro Themengebiet mit Fortschrittsbalken
- **Erzielte Achievements**: In diesem Test freigeschaltete Erfolge
- **Neue Erfolge**: Neu freigeschaltete Achievements (hervorgehoben)
- **Alle Erfolge**: Übersicht aller Achievements (freigeschaltet + gesperrt)

### 🔥 Streak-System
- **Berechnung**: Aufeinanderfolgende Tage mit mindestens einem Test
- **Reset**: Streak wird zurückgesetzt bei mehr als 1 Tag Pause
- **Persistenz**: Speichert letztes Test-Datum in localStorage

### 💾 Persistenz (localStorage)

#### Keys
- `exam_user_stats`: Benutzerstatistiken
- `exam_achievements`: Freigeschaltete Achievements
- `exam_history`: Letzte 50 Test-Ergebnisse

#### Datenstruktur

```typescript
interface UserStats {
  totalTests: number;
  totalQuestions: number;
  totalCorrect: number;
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  lastTestDate?: string;
  experiencePoints: number;
  testsPerCategory: { [category: string]: number };
  perfectScores: number;
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  unlockedAt?: Date;
}

interface TestResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeUsed: number;
  date: string;
  categories: string[];
}
```

## Visuelle Features

### Startseite
- **Level-Badge**: Zeigt aktuelles Level mit ⭐ Icon
- **Mini-Stats**: Beste Score, Anzahl Tests, Achievements, aktuelle Streak
- **Gradient-Design**: Orange-Farbschema für Fortschritt

### Ergebnisseite
- **XP-Gewinn**: Animierte Anzeige der erhaltenen XP
- **XP-Fortschrittsbalken**: Visueller Fortschritt zum nächsten Level
- **Neu freigeschaltete Achievements**: Hervorgehoben mit "NEU!"-Badge und Glow-Animation
- **Achievements in diesem Test**: Zeigt alle in diesem Test erfüllten Achievements
- **Gesamtstatistiken**: 6 Stat-Cards mit Icons
- **Alle Achievements**: Übersicht mit freigeschaltet/gesperrt (🔒)
- **Locked-Achievements**: Ausgegraut mit Schloss-Icon

### Animationen
- `successPulse`: Pulsierender Score-Circle bei bestandenem Test
- `xpPop`: Pop-Animation für XP-Gewinn
- `glowPulse`: Glühende neue Achievements
- `newUnlockAnimation`: Rotation und Skalierung für neu freigeschaltete Achievements
- `badgeBounce`: Hüpfender "NEU!"-Badge
- `earnedGlow`: Glühende Achievements

## Motivationssystem

### Performace-Level
- **Perfekt** (100%)
- **Ausgezeichnet** (90-99%)
- **Gut** (70-89%)
- **Bestanden** (50-69%)
- **Nicht bestanden** (<50%)

### Motivations-Nachrichten
- Personalisierte Nachrichten basierend auf Performance
- Positive Verstärkung bei Erfolg
- Ermutigende Hinweise bei Misserfolg

## Technische Details

### Service: GamificationService
- **Methoden**:
  - `recordTestResult(result)`: Speichert Ergebnis und prüft Achievements
  - `getLevel(xp)`: Berechnet Level aus XP
  - `getXPForNextLevel(currentXP)`: Berechnet benötigte XP
  - `getProgressToNextLevel(currentXP)`: Berechnet Fortschritt in %
  - `resetAllData()`: Setzt alle Daten zurück (mit Bestätigung)

### Integration
- **exam-result.component**: Zeigt Ergebnisse und aktualisiert Stats
- **exam-start.component**: Zeigt Level und Mini-Stats auf Startseite
- **Automatische Speicherung**: Nach jedem Test

## Zukünftige Erweiterungen

Mögliche Features:
- 📜 Achievement-Historie mit Unlock-Zeitstempel
- 📈 Detaillierte Statistik-Graphen
- 🎯 Tägliche Herausforderungen
- 🏅 Leaderboard (falls Multi-User)
- 🎁 Belohnungen für Meilensteine
- 📱 Push-Benachrichtigungen für Streaks
- 🌙 Dark/Light Mode basierend auf Level
- 🎨 Freischaltbare Themes
