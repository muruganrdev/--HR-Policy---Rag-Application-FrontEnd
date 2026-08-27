import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatStateService } from '../../core/services/chat-state.service';
import { MarkdownFormatPipe } from '../../shared/pipes/markdown-format.pipe';
import { SourceBadgeComponent } from '../../shared/components/source-badge/source-badge.component';
import { SAMPLE_QUESTIONS } from '../../core/constants/policy.constants';
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
  readonly sampleQuestions = SAMPLE_QUESTIONS;

  userInput = '';
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

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

  askSample(q: SampleQuestion): void {
    this.chatState.sendQuestion(q.query);
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
