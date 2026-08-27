import { Injectable, signal, computed, inject } from '@angular/core';
import { ChatMessage, BackendHealthStatus, AskResponse } from '../models/chat.model';
import { HrRagApiService } from './hr-rag-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private readonly apiService = inject(HrRagApiService);

  // Reactive State Signals
  readonly messages = signal<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "👋 **Welcome to the ACME HR Policy Assistant!**\n\nI am your verified AI assistant grounded strictly in our company's official HR policy documents.\n\nYou can ask me about:\n- 🌴 **Annual & Sick Leave** rules\n- 💻 **Work From Home (WFH)** eligibility & schedules\n- ⏰ **Attendance & Working Hours**\n- ⚖️ **Employee Conduct & Harassment** guidelines\n- 📋 **Notice Periods & Exit Buyout** terms\n\nHow may I help you today?",
      timestamp: new Date(),
      sources: []
    }
  ]);

  readonly isLoading = signal<boolean>(false);
  readonly backendHealth = signal<BackendHealthStatus>({ status: 'checking' });
  readonly activeFilterCategory = signal<string>('all');

  // Computed Values
  readonly messageCount = computed(() => this.messages().length);
  readonly hasUserMessages = computed(() => this.messages().some(m => m.sender === 'user'));

  constructor() {
    this.verifyBackendHealth();
  }

  /**
   * Checks the health of the FastAPI backend.
   */
  verifyBackendHealth(): void {
    this.backendHealth.set({ status: 'checking' });
    this.apiService.checkHealth().subscribe({
      next: (res) => {
        this.backendHealth.set({
          status: 'online',
          message: res.message || 'HR Policy API is connected',
          endpoint: res.endpoint || 'POST /ask',
          timestamp: new Date()
        });
      },
      error: (err) => {
        this.backendHealth.set({
          status: 'offline',
          message: err.message || 'Cannot connect to port 8001',
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Dispatches a user query to the RAG pipeline.
   */
  sendQuestion(questionText: string): void {
    const trimmed = questionText.trim();
    if (!trimmed || this.isLoading()) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    const pendingAssistantId = `assistant-loading-${Date.now()}`;
    const pendingAssistantMessage: ChatMessage = {
      id: pendingAssistantId,
      sender: 'assistant',
      text: '',
      timestamp: new Date(),
      isLoading: true
    };

    // Append user message & loading indicator
    this.messages.update(msgs => [...msgs, userMessage, pendingAssistantMessage]);
    this.isLoading.set(true);

    // Call API
    this.apiService.askQuestion(trimmed).subscribe({
      next: (res: AskResponse) => {
        this.messages.update(msgs =>
          msgs.map(m =>
            m.id === pendingAssistantId
              ? {
                  id: `assistant-${Date.now()}`,
                  sender: 'assistant',
                  text: res.answer,
                  timestamp: new Date(),
                  sources: res.sources,
                  isLoading: false
                }
              : m
          )
        );
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.messages.update(msgs =>
          msgs.map(m =>
            m.id === pendingAssistantId
              ? {
                  id: `error-${Date.now()}`,
                  sender: 'system',
                  text: `⚠️ **Error communicating with HR API:**\n\n${err.message}`,
                  timestamp: new Date(),
                  isError: true,
                  isLoading: false
                }
              : m
          )
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Clears conversation and resets to welcome message.
   */
  clearHistory(): void {
    this.messages.set([
      {
        id: 'welcome-msg-reset',
        sender: 'assistant',
        text: "👋 **Conversation reset.**\n\nFeel free to ask any new question regarding ACME Corporation HR policies.",
        timestamp: new Date(),
        sources: []
      }
    ]);
  }
}
