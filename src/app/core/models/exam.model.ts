export interface ExamState {
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  startTime: Date;
  timeRemaining: number; // in seconds
  isCompleted: boolean;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeUsed: number;
  testDuration: number; // Vorgegebene Testzeit in Sekunden
  questions: ExamQuestion[];
}

import { ExamQuestion } from './question.model';
