import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-question',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-question.component.html',
  styleUrl: './exam-question.component.scss'
})
export class ExamQuestionComponent implements OnInit {
  private examService = inject(ExamService);
  private router = inject(Router);

  currentQuestion = this.examService.currentQuestion;
  currentQuestionIndex = this.examService.currentQuestionIndex;
  totalQuestions = this.examService.totalQuestions;
  timeRemaining = this.examService.timeRemaining;
  allQuestions = this.examService.allQuestions;

  ngOnInit(): void {
    if (!this.currentQuestion()) {
      this.router.navigate(['/']);
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  selectAnswer(answerId: string): void {
    this.examService.answerQuestion(answerId);
  }

  toggleMark(): void {
    this.examService.toggleMarkQuestion();
  }

  goToQuestion(index: number): void {
    this.examService.goToQuestion(index);
  }

  nextQuestion(): void {
    this.examService.nextQuestion();
  }

  previousQuestion(): void {
    this.examService.previousQuestion();
  }

  showFinishConfirm(): void {
    const answeredCount = this.examService.getAnsweredQuestionsCount();
    const total = this.totalQuestions();
    const unanswered = total - answeredCount;

    let message = `Du hast ${answeredCount} von ${total} Fragen beantwortet.`;
    if (unanswered > 0) {
      message += `\n\n${unanswered} Fragen sind noch nicht beantwortet.`;
    }
    message += '\n\nMöchtest du den Test wirklich abschließen?';

    if (confirm(message)) {
      this.completeExam();
    }
  }

  completeExam(): void {
    this.examService.completeExam();
    this.router.navigate(['/exam/result']);
  }

  isAnswered(index: number): boolean {
    return this.examService.isQuestionAnswered(index);
  }
}
