import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatComponent } from './chat.component';
import { ChatStateService } from '../../core/services/chat-state.service';
import { vi } from 'vitest';

describe('ChatComponent', () => {
  let fixture: ComponentFixture<ChatComponent>;
  let component: ChatComponent;
  let chatState: ChatStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    chatState = TestBed.inject(ChatStateService);
    fixture.detectChanges();
  });

  it('should create the chat component without creating another conversation when one exists', () => {
    expect(component).toBeTruthy();
    const initialConversationsCount = chatState.conversations().length;

    // Creating a second ChatComponent instance (simulating navigation to AI Assistant)
    const secondFixture = TestBed.createComponent(ChatComponent);
    secondFixture.detectChanges();

    expect(chatState.conversations().length).toBe(initialConversationsCount);
  });

  it('should submit question exactly once when Enter key is pressed without Shift', () => {
    const sendSpy = vi.spyOn(chatState, 'sendQuestion').mockImplementation(() => {});
    component.userInput = 'What is the leave entitlement?';

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: false,
      cancelable: true
    });
    const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');

    component.onKeyDown(enterEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith('What is the leave entitlement?');
    expect(component.userInput).toBe('');
  });

  it('should not submit question when Shift+Enter is pressed', () => {
    const sendSpy = vi.spyOn(chatState, 'sendQuestion').mockImplementation(() => {});
    component.userInput = 'Line 1';

    const shiftEnterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      cancelable: true
    });

    component.onKeyDown(shiftEnterEvent);

    expect(sendSpy).not.toHaveBeenCalled();
    expect(component.userInput).toBe('Line 1');
  });

  it('should submit question exactly once when Send button is clicked', () => {
    const sendSpy = vi.spyOn(chatState, 'sendQuestion').mockImplementation(() => {});
    component.userInput = 'How many sick leave days are available?';

    component.submitQuestion();

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith('How many sick leave days are available?');
    expect(component.userInput).toBe('');
  });

  it('should not submit if userInput is only whitespace or empty', () => {
    const sendSpy = vi.spyOn(chatState, 'sendQuestion').mockImplementation(() => {});
    component.userInput = '   ';

    component.submitQuestion();

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('should not submit if chatState is currently loading', () => {
    const sendSpy = vi.spyOn(chatState, 'sendQuestion').mockImplementation(() => {});
    chatState.isLoading.set(true);
    component.userInput = 'Another query';

    component.submitQuestion();

    expect(sendSpy).not.toHaveBeenCalled();
  });
});
