import { describe, it, expect, beforeEach } from 'vitest';
import { ChatStorageService } from './chat-storage.service';
import { ChatConversation, ChatStateSnapshot } from '../models/chat.model';

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; }
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  value: createMemoryStorage(),
  configurable: true
});

describe('ChatStorageService', () => {
  let service: ChatStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new ChatStorageService();
  });

  it('should remove the newest question and answer pair when quota is exceeded', () => {
    const state: ChatStateSnapshot = {
      version: 1,
      activeConversationId: 'conversation-2',
      savedAt: '2024-01-02T00:00:40.000Z',
      conversations: [
        {
          id: 'conversation-1',
          title: 'Older chat',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          messages: [
            { id: 'm1', sender: 'user', text: 'Old question', timestamp: '2024-01-01T00:00:00.000Z' },
            { id: 'm2', sender: 'assistant', text: 'Old answer', timestamp: '2024-01-01T00:00:10.000Z' }
          ]
        } as ChatConversation,
        {
          id: 'conversation-2',
          title: 'Newest chat',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:40.000Z',
          messages: [
            { id: 'm3', sender: 'user', text: 'Latest question', timestamp: '2024-01-02T00:00:00.000Z' },
            { id: 'm4', sender: 'assistant', text: 'Latest answer', timestamp: '2024-01-02T00:00:20.000Z' },
            { id: 'm5', sender: 'user', text: 'Follow-up question', timestamp: '2024-01-02T00:00:30.000Z' },
            { id: 'm6', sender: 'assistant', text: 'Follow-up answer', timestamp: '2024-01-02T00:00:40.000Z' }
          ]
        } as ChatConversation
      ]
    };

    const adjusted = service.handleQuotaExceeded(state);

    expect(adjusted.conversations[1].messages).toEqual([
      { id: 'm3', sender: 'user', text: 'Latest question', timestamp: '2024-01-02T00:00:00.000Z' },
      { id: 'm4', sender: 'assistant', text: 'Latest answer', timestamp: '2024-01-02T00:00:20.000Z' }
    ]);
    expect(adjusted.conversations[1].messages.length).toBe(2);
  });
});
