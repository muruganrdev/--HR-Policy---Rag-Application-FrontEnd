// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';
import { ChatStateService } from './chat-state.service';
import { HrRagApiService } from './hr-rag-api.service';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

describe('ChatStateService', () => {
  let service: ChatStateService;

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
      askQuestion: vi.fn(),
      checkHealth: vi.fn(() => of({ message: 'Online' }))
    };

    TestBed.configureTestingModule({
      providers: [
        ChatStateService,
        { provide: HrRagApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ChatStateService);
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
});
