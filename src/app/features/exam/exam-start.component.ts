import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../core/services/question.service';
import { ExamService } from '../../core/services/exam.service';
import { GamificationService } from '../../core/services/gamification.service';
import { ExamQuestion, Question } from '../../core/models/question.model';

interface CategorySelection {
  name: string;
  selected: boolean;
}

type TestDuration = 'short' | 'medium' | 'long';

interface DurationConfig {
  label: string;
  minutes: number;
  totalQuestions: number;
}

@Component({
  selector: 'app-exam-start',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-start.component.html',
  styleUrl: './exam-start.component.scss'
})
export class ExamStartComponent implements OnInit {
  private questionService = inject(QuestionService);
  private examService = inject(ExamService);
  private gamificationService = inject(GamificationService);
  private router = inject(Router);

  categories = signal<CategorySelection[]>([]);
  isLoading = signal(false);
  selectedDuration = signal<TestDuration>('medium');

  userStats = this.gamificationService.userStats;
  allAchievements = this.gamificationService.achievements;

  get userLevel(): number {
    return this.gamificationService.getLevel(this.userStats().experiencePoints);
  }

  get earnedAchievements() {
    return this.allAchievements().filter(a => a.earned);
  }

  get progressToNextLevel(): number {
    return this.gamificationService.getProgressToNextLevel(this.userStats().experiencePoints);
  }

  get xpToNextLevel(): number {
    const currentXP = this.userStats().experiencePoints;
    const nextLevelXP = this.gamificationService.getXPForNextLevel(currentXP);
    return nextLevelXP - currentXP;
  }

  get nextAchievementsToUnlock() {
    // Zeige die nächsten 3 noch nicht freigeschalteten Achievements
    const locked = this.allAchievements().filter(a => !a.earned);
    
    // Priorisiere bestimmte Achievements für neue Nutzer
    const priority = ['first_test', 'passed', 'quick_thinker', 'well_prepared', 'excellent'];
    const prioritized = locked.filter(a => priority.includes(a.id));
    const others = locked.filter(a => !priority.includes(a.id));
    
    return [...prioritized, ...others].slice(0, 3);
  }

  get achievementProgress() {
    return this.gamificationService.getTopProgress(5);
  }

  private readonly USED_QUESTIONS_KEY = 'examino_used_questions';
  private readonly SETTINGS_KEY = 'examino_exam_settings';

  readonly durations: Record<TestDuration, DurationConfig> = {
    short: { label: 'Kurz', minutes: 15, totalQuestions: 12 },
    medium: { label: 'Mittel', minutes: 30, totalQuestions: 25 },
    long: { label: 'Lang', minutes: 60, totalQuestions: 50 }
  };

  ngOnInit() {
    // Lade gespeicherte Einstellungen
    const savedSettings = this.loadSettings();
    
    // Initialisiere Kategorien
    const allCategories = this.questionService.questionFiles.map(f => ({
      name: f.name,
      selected: savedSettings.selectedCategories.includes(f.name)
    }));
    this.categories.set(allCategories);
    
    // Setze gespeicherte Dauer
    this.selectedDuration.set(savedSettings.duration);
  }

  private loadSettings(): { duration: TestDuration; selectedCategories: string[] } {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Falls Fehler beim Parsen, verwende Standardwerte
      }
    }
    // Standardwerte: alle Kategorien ausgewählt, mittlere Dauer
    return {
      duration: 'medium',
      selectedCategories: this.questionService.questionFiles.map(f => f.name)
    };
  }

  private saveSettings(): void {
    const settings = {
      duration: this.selectedDuration(),
      selectedCategories: this.categories()
        .filter(c => c.selected)
        .map(c => c.name)
    };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  toggleCategory(categoryName: string): void {
    const updated = this.categories().map(c => 
      c.name === categoryName ? { ...c, selected: !c.selected } : c
    );
    this.categories.set(updated);
    this.saveSettings();
  }

  toggleAll(): void {
    const allSelected = this.categories().every(c => c.selected);
    const updated = this.categories().map(c => ({ ...c, selected: !allSelected }));
    this.categories.set(updated);
    this.saveSettings();
  }

  selectDuration(duration: TestDuration): void {
    this.selectedDuration.set(duration);
    this.saveSettings();
  }

  get selectedCount(): number {
    return this.categories().filter(c => c.selected).length;
  }

  get currentDuration(): DurationConfig {
    return this.durations[this.selectedDuration()];
  }

  get totalQuestions(): number {
    return this.currentDuration.totalQuestions;
  }

  get estimatedMinutes(): number {
    return this.currentDuration.minutes;
  }

  get questionsPerCategory(): number {
    const count = this.selectedCount;
    if (count === 0) return 0;
    // Zeige durchschnittliche Fragen pro Kategorie (für UI)
    return Math.floor(this.totalQuestions / count);
  }

  private getUsedQuestions(): Record<string, string[]> {
    const stored = localStorage.getItem(this.USED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveUsedQuestions(usedQuestions: Record<string, string[]>): void {
    localStorage.setItem(this.USED_QUESTIONS_KEY, JSON.stringify(usedQuestions));
  }

  private shuffleAnswers(question: Question): Question {
    const shuffledQuestion = { ...question };
    const originalOptions = [...question.options];
    const correctOption = originalOptions.find(opt => opt.id === question.correctAnswer);
    const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
    const optionIds = ['a', 'b', 'c', 'd', 'e', 'f'];
    shuffledOptions.forEach((opt, index) => {
      opt.id = optionIds[index];
    });
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.text === correctOption?.text);
    shuffledQuestion.options = shuffledOptions;
    shuffledQuestion.correctAnswer = optionIds[newCorrectIndex];
    return shuffledQuestion;
    }
    
    getCategoryIcon(name: string): string {
        const n = name.toLowerCase();

        if (n.includes('raster') || n.includes('rgb')) return '🖼️';
        if (n.includes('raytracing')) return '🪄';
        if (n.includes('kamera') || n.includes('strahl')) return '📷';
        if (n.includes('hierarch')) return '🌳';
        if (n.includes('phong') || n.includes('beleuchtung')) return '💡';

        return '📘';
        }


  async startExam(): Promise<void> {
    const selectedCategories = this.categories()
      .filter(c => c.selected)
      .map(c => c.name);

    if (selectedCategories.length === 0) {
      alert('Bitte wähle mindestens ein Themengebiet aus.');
      return;
    }

    this.isLoading.set(true);

    try {
      // Lade nur ausgewählte Kategorien
      await this.questionService.loadQuestions(selectedCategories);
      
      // Generiere genau totalQuestions, gleichmäßig verteilt auf alle Kategorien
      const total = this.totalQuestions;
      const numCategories = selectedCategories.length;
      const questionsPerCat = Math.floor(total / numCategories);
      const remainder = total % numCategories;
      
      const usedQuestions = this.getUsedQuestions();
      const examQuestions: ExamQuestion[] = [];
      
      // Für jede Kategorie
      selectedCategories.forEach((categoryName, index) => {
        const categoryQuestions = this.questionService.getQuestionsByCategory(categoryName);
        const usedIds = usedQuestions[categoryName] || [];
        
        // Filtere bereits verwendete Fragen
        let availableQuestions = categoryQuestions.filter(q => !usedIds.includes(q.id));
        
        // Wenn nicht genug neue Fragen verfügbar, setze Pool zurück
        if (availableQuestions.length < questionsPerCat) {
          usedQuestions[categoryName] = [];
          availableQuestions = categoryQuestions;
        }
        
        // Shuffle
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        
        // Erste Kategorien bekommen +1 Frage wenn es einen Rest gibt
        const numQuestions = questionsPerCat + (index < remainder ? 1 : 0);
        const selected = shuffled.slice(0, numQuestions);
        
        // Shuffle answers und convert to ExamQuestion
        selected.forEach(q => {
          const shuffledQ = this.shuffleAnswers(q);
          examQuestions.push({
            ...shuffledQ,
            userAnswer: undefined,
            isMarked: false
          });
          
          // Markiere als verwendet
          if (!usedQuestions[categoryName]) {
            usedQuestions[categoryName] = [];
          }
          usedQuestions[categoryName].push(q.id);
        });
      });
      
      // Speichere verwendete Fragen
      this.saveUsedQuestions(usedQuestions);
      
      if (examQuestions.length === 0) {
        alert('Fehler beim Laden der Fragen. Bitte versuche es erneut.');
        this.isLoading.set(false);
        return;
      }

      // Starte Exam mit Fragen und Dauer
      const durationMinutes = this.currentDuration.minutes;
      this.examService.startExam(examQuestions, durationMinutes);
      this.router.navigate(['/exam/question']);
    } catch (error) {
      console.error('Fehler beim Laden der Fragen:', error);
      alert('Fehler beim Laden der Fragen. Bitte versuche es erneut.');
      this.isLoading.set(false);
    }
  }
}
