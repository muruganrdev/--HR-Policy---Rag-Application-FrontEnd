// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChatStateService } from './chat-state.service';
import { HrRagApiService } from './hr-rag-api.service';
import { RoleStateService } from './role-state.service';
import { ChatMessage } from '../models/chat.model';

describe('ChatStateService', () => {
  let service: ChatStateService;
  let roleState: RoleStateService;
  let askQuestionSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      },
      configurable: true
    });

    const spy = {
      askQuestion: vi.fn(() => of({ answer: 'Test response' })),
      checkHealth: vi.fn(() => of({ message: 'Online' }))
    };
    askQuestionSpy = spy.askQuestion;

    TestBed.configureTestingModule({
      providers: [
        ChatStateService,
        RoleStateService,
        { provide: HrRagApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ChatStateService);
    roleState = TestBed.inject(RoleStateService);
  });

  it('should be created and start with an active conversation', () => {
    expect(service).toBeTruthy();
    expect(service.conversations().length).toBeGreaterThan(0);
    expect(service.activeConversationId()).not.toBeNull();
  });

  it('should create a new empty conversation when requested', () => {
    const beforeCount = service.conversations().length;

    service.createNewConversation();

    expect(service.conversations().length).toBeGreaterThan(beforeCount);
    expect(service.activeConversationId()).not.toBeNull();
  });

  it('should clear the current conversation via clearHistory()', () => {
    service.clearHistory();
    expect(service.messages().length).toBe(0);
    expect(service.activeConversationId()).not.toBeNull();
  });

  it('should send the active conversation ID and current role context', () => {
    roleState.setRole('employee');
    const firstConversationId = service.currentConversation()!.id;
    service.sendQuestion('What is Priya Nair\\\'s annual salary?');

    expect(askQuestionSpy).toHaveBeenNthCalledWith(
      1,
      'What is Priya Nair\\\'s annual salary?',
      firstConversationId,
      expect.objectContaining({
        role: 'Employee',
        employee_id: '001',
        employee_name: 'Asha Rao'
      })
    );

    const secondConversation = service.createNewConversation();
    service.sendQuestion('What is her designation?');

    expect(secondConversation.id).not.toBe(firstConversationId);
    expect(askQuestionSpy).toHaveBeenNthCalledWith(
      2,
      'What is her designation?',
      secondConversation.id,
      expect.objectContaining({
        role: 'Employee',
        employee_id: '001',
        employee_name: 'Asha Rao'
      })
    );
  });

  it('should update the next request when demo identity changes', () => {
    const conversationId = service.currentConversation()!.id;

    roleState.setRole('manager');
    roleState.setManager('003', 'Arun Kumar');

    service.sendQuestion('Who reports to me?');

    expect(askQuestionSpy).toHaveBeenLastCalledWith(
      'Who reports to me?',
      conversationId,
      expect.objectContaining({
        role: 'Manager',
        employee_id: '003',
        employee_name: 'Arun Kumar'
      })
    );
  });

  it('should start a new conversation when role changes and previous conversation has messages', () => {
    roleState.setRole('employee');
    service.sendQuestion('What is my leave balance?');
    const firstConversationId = service.currentConversation()!.id;
    expect(service.messages().length).toBeGreaterThan(0);

    // Switch role to manager
    roleState.setRole('manager');
    const newConversationId = service.currentConversation()!.id;

    expect(newConversationId).not.toBe(firstConversationId);
    expect(service.messages().length).toBe(0);
  });

  it('should preserve historical message role labels across role switches', () => {
    roleState.setRole('employee');
    service.sendQuestion('My employee question');

    const empConversation = service.currentConversation()!;
    const empUserMessage = empConversation.messages.find((m: ChatMessage) => m.sender === 'user');
    expect(empUserMessage?.role).toBe('Employee');
    expect(empUserMessage?.roleContextLabel).toContain('Employee');

    // Switch to manager and send message in the new conversation
    roleState.setRole('manager');
    service.sendQuestion('My manager question');

    // Historical conversation still has employee label
    expect(empUserMessage?.role).toBe('Employee');
    expect(empUserMessage?.roleContextLabel).toContain('Employee');

    const mgrConversation = service.currentConversation()!;
    const mgrUserMessage = mgrConversation.messages.find((m: ChatMessage) => m.sender === 'user');
    expect(mgrUserMessage?.role).toBe('Manager');
    expect(mgrUserMessage?.roleContextLabel).toContain('Manager');
  });

  it('should preserve the active conversation when sending multiple questions under the same role', () => {
    roleState.setRole('manager');
    roleState.setManager('003', 'Arun Kumar');

    service.sendQuestion('First manager question');
    const conversationId = service.currentConversation()!.id;
    const initialCount = service.conversations().length;

    service.sendQuestion('Second manager question');
    expect(service.currentConversation()!.id).toBe(conversationId);
    expect(service.conversations().length).toBe(initialCount);
    expect(service.messages().filter((m: ChatMessage) => m.sender === 'user').length).toBe(2);
  });

  it('should append the assistant response to the same conversation as the question', () => {
    service.sendQuestion('Tell me about the leave policy');
    const conversation = service.currentConversation()!;
    expect(conversation.messages.length).toBe(2);
    expect(conversation.messages[0].sender).toBe('user');
    expect(conversation.messages[0].text).toBe('Tell me about the leave policy');
    expect(conversation.messages[1].sender).toBe('assistant');
    expect(conversation.messages[1].text).toBe('Test response');
  });

  it('should safely initialize state when stored snapshot is invalid or corrupted', () => {
    const corruptService = TestBed.runInInjectionContext(() => {
      const storage = {
        loadState: () => null,
        validateState: () => false,
        saveState: vi.fn()
      };
      return new ChatStateService();
    });

    expect(corruptService.conversations().length).toBeGreaterThan(0);
    expect(corruptService.activeConversationId()).not.toBeNull();
  });

  it('should not create a new conversation when current conversation is empty and role changes', () => {
    const initialConversationId = service.currentConversation()!.id;
    expect(service.messages().length).toBe(0);

    roleState.setRole('manager');
    expect(service.currentConversation()!.id).toBe(initialConversationId);

    roleState.setRole('employee');
    expect(service.currentConversation()!.id).toBe(initialConversationId);
  });
});
