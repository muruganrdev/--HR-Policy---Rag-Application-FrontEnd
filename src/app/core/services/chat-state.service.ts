import { Injectable, computed, inject, signal } from '@angular/core';
import { AskResponse, BackendHealthStatus, ChatConversation, ChatMessage, ChatStateSnapshot } from '../models/chat.model';
import { HrRagApiService } from './hr-rag-api.service';
import { ChatStorageService } from './chat-storage.service';
import { RoleStateService } from './role-state.service';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private readonly apiService = inject(HrRagApiService);
  private readonly storage = inject(ChatStorageService);
  readonly roleState = inject(RoleStateService);

  readonly conversations = signal<ChatConversation[]>([]);
  readonly activeConversationId = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly backendHealth = signal<BackendHealthStatus>({ status: 'checking' });
  readonly activeFilterCategory = signal<string>('all');

  readonly currentConversation = computed(() => {
    const activeId = this.activeConversationId();
    if (!activeId) {
      return null;
    }

    return this.conversations().find(conversation => conversation.id === activeId) ?? null;
  });

  readonly messages = computed(() => this.currentConversation()?.messages ?? []);
  readonly messageCount = computed(() => this.messages().length);
  readonly hasUserMessages = computed(() => this.messages().some((message: ChatMessage) => message.sender === 'user'));

  constructor() {
    this.restoreFromStorage();
    if (!this.conversations().length) {
      this.createNewConversation(true);
    }

    this.roleState.identityChange$.subscribe(() => {
      this.onRoleOrIdentityChanged();
    });

    this.verifyBackendHealth();
  }

  private onRoleOrIdentityChanged(): void {
    const current = this.currentConversation();
    if (!current || current.messages.length > 0) {
      this.createNewConversation(true);
    }
  }

  verifyBackendHealth(): void {
    this.backendHealth.set({ status: 'checking' });
    this.apiService.checkHealth().subscribe({
      next: (res) => {
        this.backendHealth.set({
          status: 'online',
          message: res.message || 'HR Policy API is connected',
          endpoint: res.endpoint || 'POST /ask',
          timestamp: new Date().toISOString()
        });
      },
      error: (err) => {
        this.backendHealth.set({
          status: 'offline',
          message: err.message || 'Cannot connect to port 8001',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  createNewConversation(autoPersist = true): ChatConversation {
    const conversationId = `conversation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const now = new Date().toISOString();
    const conversation: ChatConversation = {
      id: conversationId,
      title: 'New chat',
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    this.conversations.update(list => [...list, conversation]);
    this.activeConversationId.set(conversationId);

    if (autoPersist) {
      this.persistState();
    }

    return conversation;
  }

  selectConversation(conversationId: string): void {
    const isKnown = this.conversations().some(conversation => conversation.id === conversationId);
    if (!isKnown) {
      return;
    }

    this.activeConversationId.set(conversationId);
    this.persistState();
  }

  sendQuestion(questionText: string): void {
    const trimmed = questionText.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    const currentRoleContext = this.roleState.activeRoleContext();
    const currentRoleLabel = this.roleState.activeIdentityLabel();

    let activeConversation = this.currentConversation();
    if (activeConversation && activeConversation.messages.length > 0) {
      const firstUserMsg = activeConversation.messages.find((m: ChatMessage) => m.sender === 'user');
      const msgRole = firstUserMsg?.role ?? 'Super Admin';
      const msgEmpId = firstUserMsg?.employeeId ?? '001';
      if (firstUserMsg && (msgRole !== currentRoleContext.role || msgEmpId !== currentRoleContext.employee_id)) {
        activeConversation = this.createNewConversation(true);
      }
    } else if (!activeConversation) {
      activeConversation = this.createNewConversation(true);
    }

    const now = new Date().toISOString();
    const userMessageId = `user-${Date.now()}`;
    const pendingAssistantId = `assistant-loading-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: trimmed,
      timestamp: now,
      roleContextLabel: currentRoleLabel,
      role: currentRoleContext.role,
      employeeId: currentRoleContext.employee_id,
      employeeName: currentRoleContext.employee_name
    };

    const pendingAssistantMessage: ChatMessage = {
      id: pendingAssistantId,
      sender: 'assistant',
      text: '',
      timestamp: now,
      isLoading: true
    };

    this.updateConversation(activeConversation.id, conversation => ({
      ...conversation,
      title: this.determineTitle(conversation.title, trimmed),
      updatedAt: now,
      messages: [...conversation.messages, userMessage, pendingAssistantMessage]
    }));
    this.isLoading.set(true);
    this.persistState();

    this.apiService.askQuestion(trimmed, activeConversation.id, currentRoleContext).subscribe({
      next: (res: AskResponse) => {
        const responseMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: res.answer || 'I could not generate a response from the backend.',
          timestamp: new Date().toISOString(),
          sources: res.sources ?? [],
          route: res.route ?? 'rag',
          toolsUsed: Array.isArray(res.tools_used) ? res.tools_used : [],
          isLoading: false
        };

        this.updateConversation(activeConversation.id, conversation => ({
          ...conversation,
          title: this.determineTitle(conversation.title, this.extractQuestionText(res, trimmed)),
          updatedAt: responseMessage.timestamp,
          messages: conversation.messages.map((message: ChatMessage) =>
            message.id === pendingAssistantId ? responseMessage : message
          )
        }));
        this.isLoading.set(false);
        this.persistState();
      },
      error: (err: Error) => {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'system',
          text: `⚠️ **Error communicating with HR API:**\n\n${err.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
          isLoading: false
        };

        this.updateConversation(activeConversation.id, conversation => ({
          ...conversation,
          updatedAt: errorMessage.timestamp,
          messages: conversation.messages.map((message: ChatMessage) =>
            message.id === pendingAssistantId ? errorMessage : message
          )
        }));
        this.isLoading.set(false);
        this.persistState();
      }
    });
  }

  clearHistory(): void {
    const conversation = this.currentConversation() ?? this.createNewConversation();

    this.updateConversation(conversation.id, current => ({
      ...current,
      title: 'New chat',
      updatedAt: new Date().toISOString(),
      messages: []
    }));
    this.persistState();
  }

  private restoreFromStorage(): void {
    const snapshot = this.storage.loadState();
    if (!snapshot || !this.storage.validateState(snapshot)) {
      this.conversations.set([]);
      this.activeConversationId.set(null);
      return;
    }

    this.conversations.set(snapshot.conversations);
    const activeExists = snapshot.conversations.some(c => c.id === snapshot.activeConversationId);
    this.activeConversationId.set(activeExists ? snapshot.activeConversationId : (snapshot.conversations[0]?.id ?? null));
  }

  private persistState(): void {
    const snapshot: ChatStateSnapshot = {
      version: 1,
      activeConversationId: this.activeConversationId(),
      conversations: this.conversations(),
      savedAt: new Date().toISOString()
    };

    this.storage.saveState(snapshot);
  }

  private updateConversation(conversationId: string, updater: (conversation: ChatConversation) => ChatConversation): void {
    this.conversations.update(list => list.map(conversation =>
      conversation.id === conversationId ? updater(conversation) : conversation
    ));
  }

  private determineTitle(currentTitle: string, questionText: string): string {
    const trimmed = questionText.trim();
    if (!trimmed) {
      return currentTitle || 'New chat';
    }

    if (currentTitle && currentTitle !== 'New chat' && !trimmed.toLowerCase().includes(currentTitle.toLowerCase())) {
      return currentTitle;
    }

    return this.buildTitle(trimmed);
  }

  private extractQuestionText(response: AskResponse, fallback: string): string {
    return typeof response.question === 'string' && response.question.trim() ? response.question.trim() : fallback;
  }

  private buildTitle(question: string): string {
    const cleaned = question
      .replace(/\s+/g, ' ')
      .replace(/\?+$/, '')
      .trim();

    if (!cleaned) {
      return 'New chat';
    }

    const words = cleaned.split(' ');
    const titleWords = words.slice(0, 10);
    const title = titleWords.join(' ');
    return title.length > 40 ? `${title.slice(0, 37).trim()}...` : title;
  }
}
