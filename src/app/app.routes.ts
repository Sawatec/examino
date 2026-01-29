import { Routes } from '@angular/router';
import { ExamStartComponent } from './features/exam/exam-start.component';
import { ExamQuestionComponent } from './features/exam/exam-question.component';
import { ExamResultComponent } from './features/exam/exam-result.component';

export const routes: Routes = [
  {
    path: '',
    component: ExamStartComponent
  },
  {
    path: 'exam/question',
    component: ExamQuestionComponent
  },
  {
    path: 'exam/result',
    component: ExamResultComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
