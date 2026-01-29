import { Injectable, signal } from '@angular/core';
import { Question } from '../models/question.model';

interface QuestionCategory {
  name: string;
  questions: Question[];
}

interface QuestionData {
  categories: QuestionCategory[];
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionPool = signal<QuestionData | null>(null);
  private readonly USED_QUESTIONS_KEY = 'examino_used_questions';

  readonly questionFiles = [
    { name: 'Rasterbilder & RGB', file: '/questions/01-rasterbilder.json' },
    { name: 'Raytracing Grundlagen', file: '/questions/02-raytracing-grundlagen.json' },
    { name: 'Kamera & Strahlerzeugung', file: '/questions/03-kamera-strahl.json' },
    { name: 'Hierarchische Szenen', file: '/questions/04-hierarchische-szenen.json' },
    { name: 'Beleuchtung & Phong', file: '/questions/05-beleuchtung-phong.json' },
    { name: 'Transformationen', file: '/questions/06-transformationen.json' },
    { name: 'Transformationspfade', file: '/questions/07-transformationspfade.json' },
    { name: 'Texturen', file: '/questions/08-texturen.json' },
    { name: 'Anti-Aliasing & Rekursion', file: '/questions/09-antialiasing-rekursion.json' },
    { name: 'Path Tracing & Beschleunigung', file: '/questions/10-pathtracing-beschleunigung.json' }
  ];

  async loadQuestions(selectedCategories?: string[]): Promise<void> {
    try {
      const categories: QuestionCategory[] = [];

      // Filtere Kategorien, wenn welche ausgewählt wurden
      const filesToLoad = selectedCategories && selectedCategories.length > 0
        ? this.questionFiles.filter(f => selectedCategories.includes(f.name))
        : this.questionFiles;

      const promises = filesToLoad.map(async ({ name, file }) => {
        const response = await fetch(file);
        const questions: Question[] = await response.json();
        return { name, questions };
      });

      const loadedCategories = await Promise.all(promises);
      categories.push(...loadedCategories);

      this.questionPool.set({ categories });
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  }

  private shuffleAnswers(question: Question): Question {
    // Kopiere die Frage und ihre Optionen
    const shuffledQuestion = { ...question };
    const originalOptions = [...question.options];
    
    // Finde die richtige Antwort
    const correctOption = originalOptions.find(opt => opt.id === question.correctAnswer);
    
    // Shuffle die Optionen
    const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
    
    // Weise neue IDs zu (a, b, c, d, e basierend auf neuer Position)
    const optionIds = ['a', 'b', 'c', 'd', 'e', 'f'];
    shuffledOptions.forEach((opt, index) => {
      opt.id = optionIds[index];
    });
    
    // Finde die neue ID der richtigen Antwort
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.text === correctOption?.text);
    
    shuffledQuestion.options = shuffledOptions;
    shuffledQuestion.correctAnswer = optionIds[newCorrectIndex];
    
    return shuffledQuestion;
  }

  private getUsedQuestions(): Record<string, string[]> {
    const stored = localStorage.getItem(this.USED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveUsedQuestions(usedQuestions: Record<string, string[]>): void {
    localStorage.setItem(this.USED_QUESTIONS_KEY, JSON.stringify(usedQuestions));
  }

  private markQuestionsAsUsed(questions: Question[]): void {
    const usedQuestions = this.getUsedQuestions();
    
    questions.forEach(q => {
      if (!usedQuestions[q.category]) {
        usedQuestions[q.category] = [];
      }
      if (!usedQuestions[q.category].includes(q.id)) {
        usedQuestions[q.category].push(q.id);
      }
    });
    
    this.saveUsedQuestions(usedQuestions);
  }

  generateExamQuestions(questionsPerCategory: number = 5): Question[] {
    const pool = this.questionPool();
    if (!pool) {
      return [];
    }

    const examQuestions: Question[] = [];
    const usedQuestions = this.getUsedQuestions();

    pool.categories.forEach(category => {
      const usedIds = usedQuestions[category.name] || [];
      
      // Filtere bereits verwendete Fragen
      let availableQuestions = category.questions.filter(q => !usedIds.includes(q.id));
      
      // Wenn nicht genug neue Fragen verfügbar sind, setze den Pool für diese Kategorie zurück
      if (availableQuestions.length < questionsPerCategory) {
        usedQuestions[category.name] = [];
        availableQuestions = category.questions;
      }
      
      // Shuffle und wähle Fragen aus
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(questionsPerCategory, availableQuestions.length));
      
      const questionsWithShuffledAnswers = selected.map(q => this.shuffleAnswers(q));
      
      examQuestions.push(...questionsWithShuffledAnswers);
    });

    // Markiere die ausgewählten Fragen als verwendet
    this.markQuestionsAsUsed(examQuestions);
    
    // Speichere aktualisierte Liste
    this.saveUsedQuestions(usedQuestions);

    return examQuestions.sort(() => Math.random() - 0.5);
  }

  // Optional: Funktion zum Zurücksetzen des Pools (für z.B. einen "Reset"-Button)
  resetUsedQuestions(): void {
    localStorage.removeItem(this.USED_QUESTIONS_KEY);
  }

  getCategories(): string[] {
    const pool = this.questionPool();
    if (!pool) {
      return [];
    }
    return pool.categories.map(c => c.name);
  }

  getAllQuestions(): Question[] {
    const pool = this.questionPool();
    if (!pool) {
      return [];
    }
    return pool.categories.flatMap(c => c.questions);
  }

  getQuestionsByCategory(categoryName: string): Question[] {
    const pool = this.questionPool();
    if (!pool) {
      return [];
    }
    const category = pool.categories.find(c => c.name === categoryName);
    return category ? category.questions : [];
  }
}
