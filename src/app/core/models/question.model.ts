export interface Question {
  id: string;
  category: string;
  question: string;
  code?: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface ExamQuestion extends Question {
  userAnswer?: string;
  isMarked: boolean;
}
