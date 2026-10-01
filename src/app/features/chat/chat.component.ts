import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../core/services/chat-state.service';
import { MarkdownFormatPipe } from '../../shared/pipes/markdown-format.pipe';
import { SourceBadgeComponent } from '../../shared/components/source-badge/source-badge.component';
import { RECOMMENDED_QUESTIONS } from '../../core/constants/policy.constants';
import { SampleQuestion } from '../../core/models/policy.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownFormatPipe, SourceBadgeComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewChecked {
  readonly chatState = inject(ChatStateService);
  readonly sampleQuestions = RECOMMENDED_QUESTIONS;

  userInput = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  get activeConversationTitle(): string {
    if (this.chatState.isLoading()) {
      return '...';
    }

    return this.chatState.currentConversation()?.title || 'New chat';
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  submitQuestion(): void {
    const query = this.userInput.trim();
    if (!query || this.chatState.isLoading()) return;

    this.chatState.sendQuestion(query);
    this.userInput = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitQuestion();
    }
  }

  askSample(question: SampleQuestion): void {
    this.chatState.sendQuestion(question.query);
  }

  getVisibleTools(tools: string[] | undefined): string[] {
    return (tools ?? []).map(tool => this.formatToolLabel(tool));
  }

  private formatToolLabel(tool: string): string {
    const labels: Record<string, string> = {
      get_employee_data: 'Employee information',
      get_department_employees: 'Department information',
      lookup_annual_leave_policy: 'Leave policy',
      calculate_annual_leave_disposition: 'Leave calculation',
      get_employee_leave_balance: 'Leave balance',
      get_reporting_manager: 'Reporting line'
    };

    return labels[tool] ?? tool.replace(/_/g, ' ');
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {
      // scroll container might not be initialized yet
    }
  }
}
