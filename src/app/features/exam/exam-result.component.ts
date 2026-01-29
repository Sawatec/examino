import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { ExamResult } from '../../core/models/exam.model';
import { CommonModule } from '@angular/common';
import { GamificationService, Achievement as GamificationAchievement } from '../../core/services/gamification.service';

@Component({
  selector: 'app-exam-result',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-result.component.html',
  styleUrl: './exam-result.component.scss'
})
export class ExamResultComponent implements OnInit {
  private examService = inject(ExamService);
  private gamificationService = inject(GamificationService);
  private router = inject(Router);

  result = signal<ExamResult | null>(null);
  selectedQuestionIndex = signal<number>(0);
  expandedExplanations = signal<Set<number>>(new Set());
  newlyUnlockedAchievements = signal<GamificationAchievement[]>([]);
  xpGained = signal<number>(0);
  
  // Collapsible sections
  showAllAchievements = signal<boolean>(false);
  showCategoryStats = signal<boolean>(false);
  showLockedAchievements = signal<boolean>(false);

  userStats = this.gamificationService.userStats;
  allAchievements = this.gamificationService.achievements;

  get userLevel(): number {
    return this.gamificationService.getLevel(this.userStats().experiencePoints);
  }

  get progressToNextLevel(): number {
    return this.gamificationService.getProgressToNextLevel(this.userStats().experiencePoints);
  }

  get xpForNextLevel(): number {
    return this.gamificationService.getXPForNextLevel(this.userStats().experiencePoints);
  }

  ngOnInit(): void {
    const examResult = this.examService.calculateResult();
    if (!examResult) {
      this.router.navigate(['/']);
      return;
    }
    this.result.set(examResult);
    
    // Springe automatisch zur ersten falschen Antwort
    const firstWrongIndex = examResult.questions.findIndex(q => q.userAnswer !== q.correctAnswer);
    if (firstWrongIndex !== -1) {
      this.selectedQuestionIndex.set(firstWrongIndex);
    }

    // Record test result and get newly unlocked achievements
    const categories = [...new Set(examResult.questions.map(q => q.category))] as string[];
    const testResult = {
      score: examResult.score,
      correctAnswers: examResult.correctAnswers,
      totalQuestions: examResult.totalQuestions,
      timeUsed: examResult.timeUsed,
      testDuration: examResult.testDuration, // Vorgegebene Testzeit in Sekunden
      date: new Date().toISOString(),
      categories
    };

    const previousXP = this.userStats().experiencePoints;
    const newlyUnlocked = this.gamificationService.recordTestResult(testResult);
    const currentXP = this.userStats().experiencePoints;
    
    this.newlyUnlockedAchievements.set(newlyUnlocked);
    this.xpGained.set(currentXP - previousXP);
  }

  selectQuestion(index: number): void {
    this.selectedQuestionIndex.set(index);
  }

  get selectedQuestion(): any {
    const res = this.result();
    if (!res) return null;
    return res.questions[this.selectedQuestionIndex()];
  }

  get wrongAnswersCount(): number {
    const res = this.result();
    if (!res) return 0;
    return res.questions.filter(q => q.userAnswer !== q.correctAnswer).length;
  }

  get categoryStats(): { category: string; correct: number; total: number; percentage: number }[] {
    const res = this.result();
    if (!res) return [];
    
    const stats = new Map<string, { correct: number; total: number }>();
    
    res.questions.forEach(q => {
      if (!stats.has(q.category)) {
        stats.set(q.category, { correct: 0, total: 0 });
      }
      const stat = stats.get(q.category)!;
      stat.total++;
      if (q.userAnswer === q.correctAnswer) {
        stat.correct++;
      }
    });
    
    return Array.from(stats.entries()).map(([category, stat]) => ({
      category,
      correct: stat.correct,
      total: stat.total,
      percentage: Math.round((stat.correct / stat.total) * 100)
    }));
  }

  get currentTestAchievements(): { icon: string; title: string; description: string; earned: boolean }[] {
    const res = this.result();
    if (!res) return [];
    
    const score = res.score;
    const timeInMinutes = Math.floor(res.timeUsed / 60);
    const totalQuestions = res.totalQuestions;
    const correctAnswers = res.correctAnswers;
    const timePercentage = (res.timeUsed / res.testDuration) * 100;
    const isPassed = score >= 50;
    
    return [
      {
        icon: '🎯',
        title: 'Perfektionist',
        description: '100% richtige Antworten',
        earned: score === 100
      },
      {
        icon: '🌟',
        title: 'Ausgezeichnet',
        description: 'Mindestens 90% erreicht',
        earned: score >= 90
      },
      {
        icon: '🚀',
        title: 'Schnelldenker',
        description: 'Unter 70% der Zeit & bestanden',
        earned: timePercentage < 70 && isPassed
      },
      {
        icon: '💪',
        title: 'Bestanden',
        description: 'Mindestens 50% erreicht',
        earned: isPassed
      },
      {
        icon: '🎓',
        title: 'Gut vorbereitet',
        description: 'Mindestens 70% erreicht',
        earned: score >= 70
      },
      {
        icon: '🏆',
        title: 'Champion',
        description: 'Alle Fragen richtig ohne Fehler',
        earned: correctAnswers === totalQuestions
      },
      {
        icon: '⚡',
        title: 'Speedrunner',
        description: 'Unter 50% der Zeit & bestanden',
        earned: timePercentage < 50 && isPassed
      },
      {
        icon: '🎖️',
        title: 'Durchhalter',
        description: 'Alle Fragen beantwortet',
        earned: res.questions.every(q => q.userAnswer !== undefined)
      }
    ];
  }

  get earnedCurrentTestAchievements() {
    return this.currentTestAchievements.filter(a => a.earned);
  }

  get earnedAchievements() {
    return this.allAchievements().filter(a => a.earned);
  }

  get lockedAchievements() {
    return this.allAchievements().filter(a => !a.earned);
  }

  get achievementProgress() {
    return this.gamificationService.getAchievementProgress().slice(0, 8);
  }

  get isPassed(): boolean {
    const res = this.result();
    return res ? res.score >= 50 : false;
  }

  get performanceLevel(): string {
    const res = this.result();
    if (!res) return '';
    
    if (res.score === 100) return 'Perfekt';
    if (res.score >= 90) return 'Ausgezeichnet';
    if (res.score >= 70) return 'Gut';
    if (res.score >= 50) return 'Bestanden';
    return 'Nicht bestanden';
  }

  get motivationalMessage(): string {
    const res = this.result();
    if (!res) return '';
    
    if (res.score === 100) {
      return 'Wow! Absolut perfekt! Du beherrschst den Stoff zu 100%! 🎉';
    } else if (res.score >= 90) {
      return 'Hervorragend! Du bist bestens vorbereitet für die Klausur! 🌟';
    } else if (res.score >= 70) {
      return 'Gut gemacht! Mit etwas mehr Übung schaffst du die 90%! 💪';
    } else if (res.score >= 50) {
      return 'Bestanden! Vertiefe noch die schwächeren Bereiche für ein besseres Ergebnis. 📚';
    } else {
      return 'Noch nicht bestanden. Wiederhole die Themen und versuche es nochmal! 🔄';
    }
  }

  jumpToNextWrong(): void {
    const res = this.result();
    if (!res) return;
    const currentIndex = this.selectedQuestionIndex();
    const nextWrongIndex = res.questions.findIndex((q, idx) => 
      idx > currentIndex && q.userAnswer !== q.correctAnswer
    );
    if (nextWrongIndex !== -1) {
      this.selectedQuestionIndex.set(nextWrongIndex);
    }
  }

  toggleExplanation(index: number): void {
    const expanded = new Set(this.expandedExplanations());
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    this.expandedExplanations.set(expanded);
  }

  isExplanationExpanded(index: number): boolean {
    return this.expandedExplanations().has(index);
  }

  toggleAllAchievements(): void {
    this.showAllAchievements.set(!this.showAllAchievements());
  }

  toggleCategoryStats(): void {
    this.showCategoryStats.set(!this.showCategoryStats());
  }

  toggleLockedAchievements(): void {
    this.showLockedAchievements.set(!this.showLockedAchievements());
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  isCorrect(question: any): boolean {
    return question.userAnswer === question.correctAnswer;
  }

  getAnswerText(question: any, answerId: string): string {
    const option = question.options.find((opt: any) => opt.id === answerId);
    return option ? `${option.id}. ${option.text}` : '';
  }

  backToStart(): void {
    this.examService.resetExam();
    this.router.navigate(['/']);
  }

  retryExam(): void {
    this.examService.resetExam();
    this.router.navigate(['/']);
  }
}
