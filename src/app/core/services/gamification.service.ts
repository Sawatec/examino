import { Injectable, signal } from '@angular/core';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  unlockedAt?: Date;
}

export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  progressText: string;
}

export interface UserStats {
  totalTests: number;
  totalQuestions: number;
  totalCorrect: number;
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds
  currentStreak: number;
  longestStreak: number;
  lastTestDate?: string;
  experiencePoints: number;
  testsPerCategory: { [category: string]: number };
  perfectScores: number;
  lowestScore?: number;
  consecutivePasses: number;
  consecutiveHighScores: number; // 90%+
  fastTestsCount: number; // Tests unter 70% der Zeit
  recentScores: number[]; // Letzte 5 Scores für Trend-Analyse
}

export interface TestResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeUsed: number;
  testDuration: number; // Vorgegebene Testzeit in Sekunden
  date: string;
  categories: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private readonly STATS_KEY = 'exam_user_stats';
  private readonly ACHIEVEMENTS_KEY = 'exam_achievements';
  private readonly HISTORY_KEY = 'exam_history';

  userStats = signal<UserStats>(this.loadStats());
  achievements = signal<Achievement[]>(this.initializeAchievements());

  private loadStats(): UserStats {
    const stored = localStorage.getItem(this.STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      totalTests: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      bestScore: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      consecutivePasses: 0,
      consecutiveHighScores: 0,
      fastTestsCount: 0,
      recentScores: [],
      currentStreak: 0,
      longestStreak: 0,
      experiencePoints: 0,
      testsPerCategory: {},
      perfectScores: 0
    };
  }

  private saveStats(stats: UserStats): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    this.userStats.set(stats);
  }

  private initializeAchievements(): Achievement[] {
    const stored = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    const earnedAchievements = stored ? JSON.parse(stored) : {};

    const allAchievements: Omit<Achievement, 'earned' | 'unlockedAt'>[] = [
      {
        id: 'first_test',
        icon: '🎯',
        title: 'Erster Schritt',
        description: 'Ersten Test abgeschlossen'
      },
      {
        id: 'perfectionist',
        icon: '💯',
        title: 'Perfektionist',
        description: '100% in einem Test erreicht'
      },
      {
        id: 'excellent',
        icon: '🌟',
        title: 'Ausgezeichnet',
        description: 'Mindestens 90% erreicht'
      },
      {
        id: 'speedrunner',
        icon: '⚡',
        title: 'Speedrunner',
        description: 'Test in unter 50% der Zeit bestanden'
      },
      {
        id: 'quick_thinker',
        icon: '🚀',
        title: 'Schnelldenker',
        description: 'Test in unter 70% der Zeit bestanden'
      },
      {
        id: 'passed',
        icon: '💪',
        title: 'Bestanden',
        description: 'Mindestens 50% erreicht'
      },
      {
        id: 'well_prepared',
        icon: '🎓',
        title: 'Gut vorbereitet',
        description: 'Mindestens 70% erreicht'
      },
      {
        id: 'champion',
        icon: '🏆',
        title: 'Champion',
        description: 'Alle Fragen richtig ohne Fehler'
      },
      {
        id: 'persistent',
        icon: '🎖️',
        title: 'Durchhalter',
        description: 'Alle Fragen beantwortet'
      },
      {
        id: 'five_tests',
        icon: '🔥',
        title: 'Fleißig',
        description: '5 Tests abgeschlossen'
      },
      {
        id: 'ten_tests',
        icon: '💎',
        title: 'Engagiert',
        description: '10 Tests abgeschlossen'
      },
      {
        id: 'streak_3',
        icon: '📅',
        title: '3-Tage-Streak',
        description: '3 Tage hintereinander geübt'
      },
      {
        id: 'streak_7',
        icon: '🌈',
        title: '1-Wochen-Streak',
        description: '7 Tage hintereinander geübt'
      },
      {
        id: 'hundred_questions',
        icon: '📚',
        title: 'Wissensjäger',
        description: '100 Fragen beantwortet'
      },
      {
        id: 'five_hundred_questions',
        icon: '🧠',
        title: 'Meisterschüler',
        description: '500 Fragen beantwortet'
      },
      {
        id: 'level_5',
        icon: '⭐',
        title: 'Level 5',
        description: 'Level 5 erreicht'
      },
      {
        id: 'level_10',
        icon: '🌟',
        title: 'Level 10',
        description: 'Level 10 erreicht'
      },
      {
        id: 'all_categories',
        icon: '🎨',
        title: 'Universalgelehrter',
        description: 'Alle Kategorien getestet'
      },
      {
        id: 'three_perfect',
        icon: '👑',
        title: 'Meister',
        description: '3 perfekte Scores'
      },
      {
        id: 'comeback_king',
        icon: '🦅',
        title: 'Comeback-König',
        description: 'Nach durchgefallenem Test 90%+ erreicht'
      },
      {
        id: 'night_owl',
        icon: '🦉',
        title: 'Nachteule',
        description: 'Test zwischen 22-6 Uhr absolviert'
      },
      {
        id: 'early_bird',
        icon: '🐦',
        title: 'Frühaufsteher',
        description: 'Test vor 7 Uhr morgens absolviert'
      },
      {
        id: 'weekend_warrior',
        icon: '🏖️',
        title: 'Wochenend-Krieger',
        description: 'Am Wochenende geübt'
      },
      {
        id: 'marathon_runner',
        icon: '🏃',
        title: 'Marathon-Läufer',
        description: 'Langen Test (50 Fragen) bestanden'
      },
      {
        id: 'speed_demon',
        icon: '😈',
        title: 'Speed-Dämon',
        description: 'Test in unter 30% der Zeit bestanden'
      },
      {
        id: 'unstoppable',
        icon: '💥',
        title: 'Unaufhaltsam',
        description: '5 Tests in Folge bestanden'
      },
      {
        id: 'overachiever',
        icon: '🎖️',
        title: 'Überflieger',
        description: '3 Tests in Folge mit 90%+ bestanden'
      },
      {
        id: 'category_master',
        icon: '🎯',
        title: 'Kategorie-Meister',
        description: '5 Tests in einer Kategorie bestanden'
      },
      {
        id: 'triple_threat',
        icon: '🎪',
        title: 'Triple-Threat',
        description: '3 verschiedene Kategorien an einem Tag'
      },
      {
        id: 'consistent',
        icon: '📊',
        title: 'Konsistent',
        description: '5 Tests mit Score zwischen 70-80%'
      },
      {
        id: 'improving',
        icon: '📈',
        title: 'Aufstrebend',
        description: 'Score um 30%+ verbessert'
      },
      {
        id: 'dedication',
        icon: '💎',
        title: 'Hingabe',
        description: 'Streak von 14 Tagen erreicht'
      },
      {
        id: 'explorer',
        icon: '🗺️',
        title: 'Entdecker',
        description: '5 verschiedene Kategorien getestet'
      },
      {
        id: 'scholar',
        icon: '📖',
        title: 'Gelehrter',
        description: '1000 Fragen beantwortet'
      },
      {
        id: 'legend',
        icon: '⚔️',
        title: 'Legende',
        description: 'Level 20 erreicht'
      },
      {
        id: 'veteran',
        icon: '🎖️',
        title: 'Veteran',
        description: '25 Tests abgeschlossen'
      },
      {
        id: 'centurion',
        icon: '🛡️',
        title: 'Zenturio',
        description: '100 Tests abgeschlossen'
      },
      {
        id: 'flawless_streak',
        icon: '✨',
        title: 'Makellose Serie',
        description: '3 perfekte Scores in Folge'
      },
      {
        id: 'no_mistakes',
        icon: '🎯',
        title: 'Fehlerfrei',
        description: '25+ Fragen ohne Fehler'
      },
      {
        id: 'time_master',
        icon: '⏰',
        title: 'Zeitmeister',
        description: '10 Tests unter 70% der Zeit'
      },
      {
        id: 'patience',
        icon: '🧘',
        title: 'Geduld',
        description: 'Test über 90% der Zeit genutzt & bestanden'
      },
      {
        id: 'lucky_seven',
        icon: '🍀',
        title: 'Glückliche Sieben',
        description: '7 Tests hintereinander bestanden'
      },
      {
        id: 'perfectionist_plus',
        icon: '💎',
        title: 'Perfektionist+',
        description: '5 perfekte Scores erreicht'
      },
      {
        id: 'knowledge_seeker',
        icon: '🔍',
        title: 'Wissenssuchender',
        description: 'Alle Erklärungen angeschaut'
      }
    ];

    return allAchievements.map(achievement => ({
      ...achievement,
      earned: earnedAchievements[achievement.id]?.earned || false,
      unlockedAt: earnedAchievements[achievement.id]?.unlockedAt
        ? new Date(earnedAchievements[achievement.id].unlockedAt)
        : undefined
    }));
  }

  private saveAchievements(achievements: Achievement[]): void {
    const toSave = achievements.reduce((acc, achievement) => {
      if (achievement.earned) {
        acc[achievement.id] = {
          earned: true,
          unlockedAt: achievement.unlockedAt
        };
      }
      return acc;
    }, {} as any);
    localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(toSave));
    this.achievements.set(achievements);
  }

  recordTestResult(result: TestResult): Achievement[] {
    const stats = this.userStats();
    const newlyUnlocked: Achievement[] = [];

    // Update stats
    stats.totalTests++;
    stats.totalQuestions += result.totalQuestions;
    stats.totalCorrect += result.correctAnswers;
    // Track lowest score
    if (!stats.lowestScore || result.score < stats.lowestScore) {
      stats.lowestScore = result.score;
    }
    
    // Track consecutive passes and high scores
    if (result.score >= 50) {
      stats.consecutivePasses++;
    } else {
      stats.consecutivePasses = 0;
    }
    
    if (result.score >= 90) {
      stats.consecutiveHighScores++;
    } else {
      stats.consecutiveHighScores = 0;
    }
    
    // Track fast tests
    const timePercentage = (result.timeUsed / result.testDuration) * 100;
    if (timePercentage < 70 && result.score >= 50) {
      stats.fastTestsCount++;
    }
    
    // Track recent scores for trend analysis
    stats.recentScores = stats.recentScores || [];
    stats.recentScores.push(result.score);
    if (stats.recentScores.length > 10) {
      stats.recentScores.shift();
    }
    
    stats.totalTimeSpent += result.timeUsed;
    stats.bestScore = Math.max(stats.bestScore, result.score);
    stats.averageScore = Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
    
    if (result.score === 100) {
      stats.perfectScores++;
    }

    // Update category stats
    result.categories.forEach(category => {
      stats.testsPerCategory[category] = (stats.testsPerCategory[category] || 0) + 1;
    });

    // Calculate streak
    const today = new Date().toDateString();
    if (stats.lastTestDate) {
      const lastDate = new Date(stats.lastTestDate);
      const diffTime = new Date().getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Same day, keep streak
      } else if (diffDays === 1) {
        // Next day, increment streak
        stats.currentStreak++;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      } else {
        // Streak broken
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }
    stats.lastTestDate = today;

    // Calculate XP
    const xpGained = this.calculateXP(result);
    stats.experiencePoints += xpGained;

    this.saveStats(stats);

    // Check for new achievements
    const achievements = this.achievements();
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.earned && this.checkAchievement(achievement.id, stats, result)) {
        newlyUnlocked.push({ ...achievement, earned: true, unlockedAt: new Date() });
        return { ...achievement, earned: true, unlockedAt: new Date() };
      }
      return achievement;
    });

    this.saveAchievements(updatedAchievements);

    // Save to history
    this.saveToHistory(result);

    return newlyUnlocked;
  }

  private calculateXP(result: TestResult): number {
    let xp = result.correctAnswers * 10; // 10 XP per correct answer
    
    // Bonus for high scores
    if (result.score === 100) xp += 100;
    else if (result.score >= 90) xp += 50;
    else if (result.score >= 70) xp += 25;
    
    // Bonus for speed (relativ zur vorgegebenen Zeit, nur wenn bestanden)
    if (result.score >= 50) {
      const timePercentage = (result.timeUsed / result.testDuration) * 100;
      if (timePercentage < 50) xp += 50; // Unter 50% der Zeit
      else if (timePercentage < 70) xp += 25; // Unter 70% der Zeit
    }
    
    return xp;
  }

  private checkAchievement(id: string, stats: UserStats, result: TestResult): boolean {
    const timeInMinutes = result.timeUsed / 60;
    const allowedTimeMinutes = result.testDuration / 60;
    const timePercentage = (result.timeUsed / result.testDuration) * 100;
    const allCategories = ['01-rasterbilder', '02-raytracing-grundlagen', '03-kamera-strahl', 
                          '04-hierarchische-szenen', '05-beleuchtung-phong', '06-transformationen',
                          '07-transformationspfade', '08-texturen', '09-antialiasing-rekursion',
                          '10-pathtracing-beschleunigung'];

    switch (id) {
      case 'first_test':
        return stats.totalTests === 1;
      case 'perfectionist':
      case 'champion':
        return result.score === 100;
      case 'comeback_king':
        // Nach einem Fail mindestens 90% erreicht
        return stats.lowestScore !== undefined && stats.lowestScore < 50 && result.score >= 90;
      case 'night_owl':
        const hour = new Date(result.date).getHours();
        return (hour >= 22 || hour < 6) && result.score >= 50;
      case 'early_bird':
        return new Date(result.date).getHours() < 7 && result.score >= 50;
      case 'weekend_warrior':
        const day = new Date(result.date).getDay();
        return (day === 0 || day === 6) && result.score >= 50;
      case 'marathon_runner':
        return result.totalQuestions >= 50 && result.score >= 50;
      case 'speed_demon':
        return timePercentage < 30 && result.score >= 50;
      case 'unstoppable':
        return stats.consecutivePasses >= 5;
      case 'overachiever':
        return stats.consecutiveHighScores >= 3;
      case 'category_master':
        return Object.values(stats.testsPerCategory).some(count => count >= 5);
      case 'triple_threat':
        // Prüfe ob heute 3 verschiedene Kategorien getestet wurden
        const history = this.getHistory();
        const todayTests = history.filter(t => 
          new Date(t.date).toDateString() === new Date(result.date).toDateString()
        );
        const uniqueCategories = new Set(todayTests.flatMap(t => t.categories));
        return uniqueCategories.size >= 3;
      case 'consistent':
        const scoresInRange = stats.recentScores.filter(s => s >= 70 && s <= 80);
        return scoresInRange.length >= 5;
      case 'improving':
        if (stats.recentScores.length < 3) return false;
        const oldScore = stats.recentScores[0];
        return result.score >= oldScore + 30;
      case 'dedication':
        return stats.currentStreak >= 14;
      case 'explorer':
        return Object.keys(stats.testsPerCategory).length >= 5;
      case 'scholar':
        return stats.totalQuestions >= 1000;
      case 'legend':
        return this.getLevel(stats.experiencePoints) >= 20;
      case 'veteran':
        return stats.totalTests >= 25;
      case 'centurion':
        return stats.totalTests >= 100;
      case 'flawless_streak':
        // Prüfe letzte 3 Tests auf 100%
        const recentHistory = this.getHistory().slice(-3);
        return recentHistory.length === 3 && recentHistory.every(t => t.score === 100);
      case 'no_mistakes':
        return result.totalQuestions >= 25 && result.score === 100;
      case 'time_master':
        return stats.fastTestsCount >= 10;
      case 'patience':
        return timePercentage > 90 && result.score >= 50;
      case 'lucky_seven':
        return stats.consecutivePasses >= 7;
      case 'perfectionist_plus':
        return stats.perfectScores >= 5;
      case 'knowledge_seeker':
        // Wird später implementiert wenn Tracking für Erklärungen hinzugefügt wird
        return false;
      case 'excellent':
        return result.score >= 90;
      case 'speedrunner':
        // Unter 50% der vorgegebenen Zeit UND bestanden
        return timePercentage < 50 && result.score >= 50;
      case 'quick_thinker':
        // Unter 70% der vorgegebenen Zeit UND bestanden
        return timePercentage < 70 && result.score >= 50;
      case 'passed':
        return result.score >= 50;
      case 'well_prepared':
        return result.score >= 70;
      case 'persistent':
        // Alle Fragen wurden beantwortet (implizit durch correctAnswers + wrong answers)
        return result.correctAnswers + (result.totalQuestions - result.correctAnswers) === result.totalQuestions;
      case 'five_tests':
        return stats.totalTests >= 5;
      case 'ten_tests':
        return stats.totalTests >= 10;
      case 'streak_3':
        return stats.currentStreak >= 3;
      case 'streak_7':
        return stats.currentStreak >= 7;
      case 'hundred_questions':
        return stats.totalQuestions >= 100;
      case 'five_hundred_questions':
        return stats.totalQuestions >= 500;
      case 'level_5':
        return this.getLevel(stats.experiencePoints) >= 5;
      case 'level_10':
        return this.getLevel(stats.experiencePoints) >= 10;
      case 'all_categories':
        return allCategories.every(cat => stats.testsPerCategory[cat] > 0);
      case 'three_perfect':
        return stats.perfectScores >= 3;
      default:
        return false;
    }
  }

  getLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  getXPForNextLevel(currentXP: number): number {
    const currentLevel = this.getLevel(currentXP);
    return currentLevel * currentLevel * 100;
  }

  getProgressToNextLevel(currentXP: number): number {
    const currentLevel = this.getLevel(currentXP);
    const xpForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * currentLevel * 100;
    const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  private saveToHistory(result: TestResult): void {
    const history = this.getHistory();
    history.push(result);
    
    // Keep only last 50 results
    if (history.length > 50) {
      history.shift();
    }
    
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  getHistory(): TestResult[] {
    const stored = localStorage.getItem(this.HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  resetAllData(): void {
    if (confirm('Möchtest du wirklich alle Fortschritte zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      localStorage.removeItem(this.STATS_KEY);
      localStorage.removeItem(this.ACHIEVEMENTS_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      this.userStats.set(this.loadStats());
      this.achievements.set(this.initializeAchievements());
    }
  }

  getAchievementProgress(): AchievementProgress[] {
    const stats = this.userStats();
    const achievements = this.achievements();
    const progress: AchievementProgress[] = [];
    const currentLevel = this.getLevel(stats.experiencePoints);
    const categoriesCount = Object.keys(stats.testsPerCategory).length;
    const maxCategoryTests = Math.max(0, ...Object.values(stats.testsPerCategory));

    // Trackbare Achievements mit Fortschritt
    const trackable = [
      { id: 'five_tests', current: stats.totalTests, target: 5 },
      { id: 'ten_tests', current: stats.totalTests, target: 10 },
      { id: 'veteran', current: stats.totalTests, target: 25 },
      { id: 'centurion', current: stats.totalTests, target: 100 },
      { id: 'streak_3', current: stats.currentStreak, target: 3 },
      { id: 'streak_7', current: stats.currentStreak, target: 7 },
      { id: 'dedication', current: stats.currentStreak, target: 14 },
      { id: 'hundred_questions', current: stats.totalQuestions, target: 100 },
      { id: 'five_hundred_questions', current: stats.totalQuestions, target: 500 },
      { id: 'scholar', current: stats.totalQuestions, target: 1000 },
      { id: 'level_5', current: currentLevel, target: 5 },
      { id: 'level_10', current: currentLevel, target: 10 },
      { id: 'legend', current: currentLevel, target: 20 },
      { id: 'three_perfect', current: stats.perfectScores, target: 3 },
      { id: 'perfectionist_plus', current: stats.perfectScores, target: 5 },
      { id: 'unstoppable', current: stats.consecutivePasses, target: 5 },
      { id: 'overachiever', current: stats.consecutiveHighScores, target: 3 },
      { id: 'lucky_seven', current: stats.consecutivePasses, target: 7 },
      { id: 'time_master', current: stats.fastTestsCount, target: 10 },
      { id: 'explorer', current: categoriesCount, target: 5 },
      { id: 'all_categories', current: categoriesCount, target: 10 },
      { id: 'category_master', current: maxCategoryTests, target: 5 }
    ];

    trackable.forEach(({ id, current, target }) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement && !achievement.earned && current < target) {
        const percentage = Math.min(Math.round((current / target) * 100), 100);
        progress.push({
          achievement,
          current,
          target,
          percentage,
          progressText: `${current}/${target}`
        });
      }
    });

    // Sortiere nach Fortschritt (nah am Ziel zuerst)
    return progress.sort((a, b) => b.percentage - a.percentage);
  }

  getTopProgress(count: number = 5): AchievementProgress[] {
    return this.getAchievementProgress().slice(0, count);
  }
}
