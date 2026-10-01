import { Injectable } from '@angular/core';
import { ChatConversation, ChatStateSnapshot } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatStorageService {
  private static readonly STORAGE_KEY = 'hr-rag-chat-state-v1';

  saveState(state: ChatStateSnapshot): boolean {
    const safeState = this.validateState(state) ? state : this.getDefaultState();

    try {
      localStorage.setItem(ChatStorageService.STORAGE_KEY, JSON.stringify(safeState));
      return true;
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        const reducedState = this.handleQuotaExceeded(safeState);

        try {
          localStorage.setItem(ChatStorageService.STORAGE_KEY, JSON.stringify(reducedState));
          return true;
        } catch {
          return false;
        }
      }

      return false;
    }
  }

  loadState(): ChatStateSnapshot | null {
    try {
      const raw = localStorage.getItem(ChatStorageService.STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as Partial<ChatStateSnapshot>;
      if (!this.validateState(parsed as ChatStateSnapshot)) {
        localStorage.removeItem(ChatStorageService.STORAGE_KEY);
        return null;
      }

      return parsed as ChatStateSnapshot;
    } catch {
      localStorage.removeItem(ChatStorageService.STORAGE_KEY);
      return null;
    }
  }

  clearState(): void {
    localStorage.removeItem(ChatStorageService.STORAGE_KEY);
  }

  validateState(state: Partial<ChatStateSnapshot> | null | undefined): state is ChatStateSnapshot {
    if (!state || typeof state !== 'object') {
      return false;
    }

    if (!Array.isArray(state.conversations) || typeof state.activeConversationId !== 'string' && state.activeConversationId !== null) {
      return false;
    }

    for (const conversation of state.conversations) {
      if (!conversation || typeof conversation !== 'object') {
        return false;
      }

      if (!conversation.id || !conversation.title || !Array.isArray(conversation.messages)) {
        return false;
      }

      for (const message of conversation.messages) {
        if (!message || typeof message !== 'object' || typeof message.id !== 'string' || typeof message.sender !== 'string' || typeof message.text !== 'string' || typeof message.timestamp !== 'string') {
          return false;
        }
      }
    }

    return true;
  }

  handleQuotaExceeded(state: ChatStateSnapshot): ChatStateSnapshot {
    const nextState: ChatStateSnapshot = {
      ...state,
      conversations: state.conversations.map(conversation => ({
        ...conversation,
        messages: [...conversation.messages]
      })),
      savedAt: new Date().toISOString()
    };

    const newestConversation = [...nextState.conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    if (!newestConversation) {
      return nextState;
    }

    const conversationIndex = nextState.conversations.findIndex(c => c.id === newestConversation.id);
    const newestMessages = [...newestConversation.messages];

    for (let i = newestMessages.length - 2; i >= 0; i--) {
      const current = newestMessages[i];
      const next = newestMessages[i + 1];

      if (current?.sender === 'user' && next?.sender === 'assistant') {
        newestMessages.splice(i, 2);
        nextState.conversations[conversationIndex] = {
          ...newestConversation,
          updatedAt: newestMessages.at(-1)?.timestamp ?? newestConversation.updatedAt,
          messages: newestMessages
        };
        return nextState;
      }
    }

    if (newestMessages.length > 0) {
      newestMessages.pop();
      nextState.conversations[conversationIndex] = {
        ...newestConversation,
        updatedAt: newestMessages.at(-1)?.timestamp ?? newestConversation.updatedAt,
        messages: newestMessages
      };
    }

    return nextState;
  }

  private getDefaultState(): ChatStateSnapshot {
    return {
      version: 1,
      activeConversationId: null,
      conversations: [],
      savedAt: new Date().toISOString()
    };
  }

  private isQuotaExceededError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'QuotaExceededError';
  }
}
