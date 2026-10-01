import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RECOMMENDED_QUESTIONS } from '../../../core/constants/policy.constants';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { SampleQuestion } from '../../../core/models/policy.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly chatState = inject(ChatStateService);
  readonly recommendedQuestions = RECOMMENDED_QUESTIONS;

  @Output() questionSelected = new EventEmitter<string>();

  createNewChat(): void {
    this.chatState.createNewConversation();
  }

  selectConversation(conversationId: string): void {
    this.chatState.selectConversation(conversationId);
  }

  selectSampleQuestion(question: SampleQuestion): void {
    this.chatState.sendQuestion(question.query);
    this.questionSelected.emit(question.query);
  }

  clearChat(): void {
    this.chatState.createNewConversation();
  }
}
