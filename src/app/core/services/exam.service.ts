import { Injectable, signal, computed, effect } from '@angular/core';
import { ExamQuestion } from '../models/question.model';
import { ExamState, ExamResult } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private examState = signal<ExamState | null>(null);
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private testDurationSeconds: number = 3600; // Wird beim Start gesetzt

  currentQuestion = computed(() => {
    const state = this.examState();
    if (!state || state.questions.length === 0) {
      return null;
    }
    return state.questions[state.currentQuestionIndex];
  });

  currentQuestionIndex = computed(() => this.examState()?.currentQuestionIndex ?? 0);
  totalQuestions = computed(() => this.examState()?.questions.length ?? 0);
  timeRemaining = computed(() => this.examState()?.timeRemaining ?? 0);
  isCompleted = computed(() => this.examState()?.isCompleted ?? false);
  allQuestions = computed(() => this.examState()?.questions ?? []);

  startExam(questions: ExamQuestion[], durationMinutes: number = 60): void {
    this.testDurationSeconds = durationMinutes * 60;
    
    const examQuestions = questions.map(q => ({
      ...q,
      userAnswer: undefined,
      isMarked: false
    }));

    this.examState.set({
      questions: examQuestions,
      currentQuestionIndex: 0,
      startTime: new Date(),
      timeRemaining: this.testDurationSeconds,
      isCompleted: false
    });

    this.startTimer();
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const state = this.examState();
      if (!state || state.isCompleted) {
        this.stopTimer();
        return;
      }

      if (state.timeRemaining <= 0) {
        this.completeExam();
        return;
      }

      this.examState.update(s => s ? {
        ...s,
        timeRemaining: s.timeRemaining - 1
      } : null);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  goToQuestion(index: number): void {
    this.examState.update(state => {
      if (!state || index < 0 || index >= state.questions.length) {
        return state;
      }
      return { ...state, currentQuestionIndex: index };
    });
  }

  nextQuestion(): void {
    const state = this.examState();
    if (state && state.currentQuestionIndex < state.questions.length - 1) {
      this.goToQuestion(state.currentQuestionIndex + 1);
    }
  }

  previousQuestion(): void {
    const state = this.examState();
    if (state && state.currentQuestionIndex > 0) {
      this.goToQuestion(state.currentQuestionIndex - 1);
    }
  }

  answerQuestion(answer: string): void {
    this.examState.update(state => {
      if (!state) return state;

      const questions = [...state.questions];
      questions[state.currentQuestionIndex] = {
        ...questions[state.currentQuestionIndex],
        userAnswer: answer
      };

      return { ...state, questions };
    });
  }

  toggleMarkQuestion(): void {
    this.examState.update(state => {
      if (!state) return state;

      const questions = [...state.questions];
      questions[state.currentQuestionIndex] = {
        ...questions[state.currentQuestionIndex],
        isMarked: !questions[state.currentQuestionIndex].isMarked
      };

      return { ...state, questions };
    });
  }

  completeExam(): void {
    this.stopTimer();
    this.examState.update(state => {
      if (!state) return state;
      return { ...state, isCompleted: true };
    });
  }

  calculateResult(): ExamResult | null {
    const state = this.examState();
    if (!state) {
      return null;
    }

    const correctAnswers = state.questions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;

    const totalQuestions = state.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeUsed = this.testDurationSeconds - state.timeRemaining;

    return {
      totalQuestions,
      correctAnswers,
      score,
      timeUsed,
      testDuration: this.testDurationSeconds,
      questions: state.questions
    };
  }

  resetExam(): void {
    this.stopTimer();
    this.examState.set(null);
  }

  isQuestionAnswered(index: number): boolean {
    const state = this.examState();
    if (!state || index < 0 || index >= state.questions.length) {
      return false;
    }
    return state.questions[index].userAnswer !== undefined;
  }

  getAnsweredQuestionsCount(): number {
    const state = this.examState();
    if (!state) return 0;
    return state.questions.filter(q => q.userAnswer !== undefined).length;
  }
}
