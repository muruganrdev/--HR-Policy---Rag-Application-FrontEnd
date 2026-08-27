import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { POLICY_CATEGORIES, SAMPLE_QUESTIONS, POLICY_DOCUMENTS_CATALOG } from '../../../core/constants/policy.constants';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { SampleQuestion } from '../../../core/models/policy.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly chatState = inject(ChatStateService);
  readonly categories = POLICY_CATEGORIES;
  readonly sampleQuestions = SAMPLE_QUESTIONS;
  readonly catalog = POLICY_DOCUMENTS_CATALOG;

  @Output() questionSelected = new EventEmitter<string>();

  selectSampleQuestion(q: SampleQuestion): void {
    this.chatState.sendQuestion(q.query);
    this.questionSelected.emit(q.query);
  }

  clearChat(): void {
    this.chatState.clearHistory();
  }
}
